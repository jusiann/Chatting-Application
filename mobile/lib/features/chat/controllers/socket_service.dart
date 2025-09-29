import 'dart:async';

import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/authentication/models/auth_user_model.dart';
import 'package:mobile/features/chat/controllers/message_controller.dart';
import 'package:mobile/features/chat/controllers/providers.dart';
import 'package:mobile/features/chat/controllers/unread_group_messages.dart';
import 'package:mobile/features/chat/controllers/user_service.dart';
import 'package:mobile/features/chat/models/message_model.dart';
import 'package:mobile/features/chat/models/group_message_model.dart';
import 'package:mobile/features/chat/models/group_model.dart';
import 'package:mobile/features/chat/controllers/group_controller.dart';
import 'package:mobile/features/chat/models/user_model.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:mobile/config.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
part 'socket_service.g.dart';

class MySocket {
  IO.Socket? socket;
  MySocket({this.socket});
}

@Riverpod(keepAlive: true)
class SocketService extends _$SocketService {
  IO.Socket? _socket;
  String? _token;
  bool _handlersBound = false;
  final Set<int> _seenDirectMessageIds = {};
  final Set<int> _seenGroupMessageIds = {};

  void _unbindAll() {
    if (_socket == null) return;
    for (final ev in [
      'new_message',
      'message_sent',
      'message_delivered',
      'messages_read',
      'group_message',
      'online',
      'offline',
    ]) {
      try {
        _socket!.off(ev);
      } catch (_) {}
    }
    _handlersBound = false;
  }

  @override
  MySocket build() {
    return MySocket();
  }

  Future<void> connect(String token) async {
    // If already connected with same token, do nothing.
    if (_token == token && _socket != null && _socket!.connected) {
      print('Zaten bağlı');
      return;
    }

    _unbindAll();


    print('[SOCKET] Yeni bağlantı kuruluyor');
    _token = token;

    _socket?.disconnect();

    final completer = Completer<void>();

    _socket = IO.io(
      baseUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionDelay(500)
          .setReconnectionAttempts(10)
          .setExtraHeaders({'Authorization': 'Bearer $token'})
          .build(),
    );

    _socket!.onConnect((_) async {
      print('[SOCKET] Bağlandı');
      await ref.read(userServiceProvider.notifier).fetchUsers();
      await joinUserGroups();
      if (!completer.isCompleted) completer.complete();
    });
    _socket!.onDisconnect((_) => print('[SOCKET] Bağlantı koptu'));

    _socket!.on('new_message', (data) async {
      final int? msgId =
          (data['id'] as int?) ?? int.tryParse(data['id']?.toString() ?? '');
      if (msgId != null) {
        if (_seenDirectMessageIds.contains(msgId)) return;
        _seenDirectMessageIds.add(msgId);
      }
      final openChatId = ref.read(openChatControllerProvider).id;
      final openChatType = ref.read(openChatControllerProvider).type;
      final msg = MessageModel.fromJson(data);
      ref.read(messageControllerProvider.notifier).addFromSocket(msg);
      /*       await ref.read(userServiceProvider.notifier).refreshChat(); */
      ref.read(messageControllerProvider.notifier).handleIncomingMessages(data);
      if (msg.receiverid == ref.read(authControllerProvider).authUser!.id) {
        _socket!.emit('mark_delivered', {
          'receiver_id': msg.receiverid,
          'sender_id': msg.senderid,
        });
      }
      if (openChatId == msg.senderid && openChatType == 'individual') {
        _socket!.emit('mark_read', {
          'receiver_id': msg.receiverid,
          'sender_id': msg.senderid,
        });
      }
    });

    _socket!.on('message_sent', (data) async {
      final int? msgId =
          (data['id'] as int?) ?? int.tryParse(data['id']?.toString() ?? '');
      if (msgId != null) {
        if (_seenDirectMessageIds.contains(msgId)) return;
        _seenDirectMessageIds.add(msgId);
      }
      final msg = MessageModel.fromJson(data);
      ref.read(messageControllerProvider.notifier).addFromSocket(msg);
      ref.read(messageControllerProvider.notifier).handleIncomingMessages(data);
    });

    _socket!.on('message_delivered', (data) {
      final receiverId = data['receiver_id'];
      final decoded = JwtDecoder.decode(_token!);
      final user = AuthUserModel.fromJwt(decoded);
      if (receiverId != user.id) {
        ref
            .read(messageControllerProvider.notifier)
            .markAsDelivered(receiverId);
        ref
            .read(userServiceProvider.notifier)
            .changeChatStatus(receiverId, 'delivered');
      }
    });

    _socket!.on("online", (data) {
      final rawId = data['id'];
      final userId = int.parse(rawId.toString());
      ref.read(userServiceProvider.notifier).setUserOnlineStatus(userId, true);
    });

    _socket!.on("offline", (data) {
      final rawId = data['id'];
      final userId = int.parse(rawId.toString());
      ref.read(userServiceProvider.notifier).setUserOnlineStatus(userId, false);
    });

    _socket!.on("typing", (data) {
      final rawId = data['sender_id'];
      final userId = int.parse(rawId.toString());
      ref.read(userServiceProvider.notifier).addTypingUser(userId);
    });

    _socket!.on("stop_typing", (data) {
      final rawId = data['sender_id'];
      final userId = int.parse(rawId.toString());
      ref.read(userServiceProvider.notifier).removeTypingUser(userId);
    });

    _socket!.on('messages_read', (data) {
      final receiverId = data['receiver_id'];
      ref.read(messageControllerProvider.notifier).markAsRead(receiverId);
      ref
          .read(userServiceProvider.notifier)
          .changeChatStatus(receiverId, 'read');
    });

    // ...existing code...
    _socket!.on('group_message', (data) {
      final int? gid =
          (data['id'] as int?) ?? int.tryParse(data['id']?.toString() ?? '');
      if (gid != null) {
        if (_seenGroupMessageIds.contains(gid)) return;
        _seenGroupMessageIds.add(gid);
      }
      final myId = ref.read(authControllerProvider).authUser!.id;
      final userId = data['sender_id'];
      final UserModel? sender = ref
          .read(userServiceProvider)
          .contactUsers
          .where((user) => user.id == userId)
          .firstOrNull;
      if (sender != null) {
        final groupMsg = GroupMessageModel.fromSocket(data, sender);
        ref
            .read(groupMessageControllerProvider.notifier)
            .addFromSocket(groupMsg);
      } else {
        print('[SOCKET] Gönderen kullanıcı bulunamadı: $userId');
        // Varsayılan bir kullanıcı oluşturabiliriz
        final defaultSender = UserModel(
          id: myId,
          firstName: '',
          lastName: '',
          email: '',
          // diğer gerekli alanlar...
        );
        final groupMsg = GroupMessageModel.fromSocket(data, defaultSender);
        ref
            .read(groupMessageControllerProvider.notifier)
            .addFromSocket(groupMsg);
      }

      // Grup chat listesini güncelle
      final dynamic rawGroupId = data['group_id'];
      final int groupId = rawGroupId is int
          ? rawGroupId
          : int.tryParse(rawGroupId?.toString() ?? '') ?? -1;
      final content = data['content'] != null
          ? data['content']
          : myId == userId
          ? 'Dosya gönderildi.'
          : 'Dosya alındı.';
      final DateTime createdAt =
          DateTime.tryParse(data['created_at']?.toString() ?? '')?.toLocal() ??
          DateTime.now().toLocal();

      // Mevcut grubu UserService state'inden bulmaya çalış
      final groups = ref.read(userServiceProvider).userGroups;
      GroupModel? existing;
      for (final g in groups) {
        if (g.id == groupId) {
          existing = g;
          break;
        }
      }

      final updatedGroup = GroupModel(
        id: groupId,
        name: existing?.name ?? 'Grup',
        description: existing?.description,
        createdBy: existing?.createdBy ?? 0,
        createdAt: existing?.createdAt ?? createdAt,
        lastMessage: content,
        lastMessageTime: createdAt,
      );

      ref.read(userServiceProvider.notifier).updateGroup(updatedGroup);

      final openChat = ref.read(openChatControllerProvider);
      if (openChat.id != groupId || openChat.type != 'group') {
        ref.read(unreadGroupMessagesProvider.notifier).incrementUnread(groupId);
      } else {
        // Eğer grup sohbeti açıksa, okundu olarak işaretle
        _socket!.emit('group_read', {'groupId': groupId});
      }
    });

    // State güncelle
    state = MySocket(socket: _socket);

    print('[SOCKET] Socket kurulumu tamamlandı');
    // Wait for the first onConnect to finish (or return immediately if already connected)
    if (_socket!.connected && !completer.isCompleted) {
      completer.complete();
    }
    return completer.future.timeout(
      const Duration(seconds: 10),
      onTimeout: () {
        print('[SOCKET] connect timeout, continuing without confirmation');
        return;
      },
    );
  }

  void emit(String event, dynamic data) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit(event, data);
      print('[SOCKET] Mesaj gönderildi: $data');
    } else {
      print('[SOCKET] Socket bağlı değil, emit başarısız');
    }
  }

  void on(String event, Function(dynamic data) callback) {
    if (_socket != null) {
      _socket!.on(event, callback);
      print('[SOCKET] $event olayı dinleniyor');
    } else {
      print('[SOCKET] Socket null, $event olayı eklenemedi');
    }
  }

  void disconnect() {
    _socket?.disconnect();
    print('[SOCKET] Manuel bağlantı kesildi');
  }

  Future<void> joinUserGroups() async {
    try {
      // Kullanıcının gruplarını al
      final userGroups = ref.read(userServiceProvider).userGroups;

      // Her grup için join_group eventi gönder
      for (final group in userGroups) {
        _socket!.emit('join_group', group.id);
        print('[SOCKET] Gruba katılındı: ${group.name} (ID: ${group.id})');
      }
    } catch (e) {
      print('[SOCKET] Gruplara katılım hatası: $e');
    }
  }
}
