import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/authentication/models/auth_user_model.dart';
import 'package:mobile/features/chat/controllers/message_controller.dart';
import 'package:mobile/features/chat/controllers/providers.dart';
import 'package:mobile/features/chat/controllers/user_service.dart';
import 'package:mobile/features/chat/models/message_model.dart';
import 'package:mobile/features/chat/models/group_message_model.dart';
import 'package:mobile/features/chat/models/group_model.dart';
import 'package:mobile/features/chat/controllers/group_controller.dart';
import 'package:mobile/features/chat/models/user_model.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
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

  @override
  MySocket build() {
    return MySocket();
  }

  void connect(String token) {
    if (_token == token && _socket != null && _socket!.connected) {
      print('Zaten bağlı');
      return;
    }

    print('[SOCKET] Yeni bağlantı kuruluyor');
    _token = token;

    _socket?.disconnect();

    _socket = IO.io(
      'http://10.10.1.197:5001',
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
    });
    _socket!.onDisconnect((_) => print('[SOCKET] Bağlantı koptu'));

    _socket!.on('new_message', (data) async {
      final openChatId = ref.read(openChatIdProvider);
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
      if (openChatId != null && openChatId == msg.senderid) {
        _socket!.emit('mark_read', {
          'receiver_id': msg.receiverid,
          'sender_id': msg.senderid,
        });
      }
    });

    _socket!.on('message_sent', (data) async {
      final openChatId = ref.read(openChatIdProvider);
      final msg = MessageModel.fromJson(data);
      ref.read(messageControllerProvider.notifier).addFromSocket(msg);
      ref.read(messageControllerProvider.notifier).handleIncomingMessages(data);
    });

    _socket!.on('message_delivered', (data) {
      final receiver_id = data['receiver_id'];
      final decoded = JwtDecoder.decode(_token!);
      final user = AuthUserModel.fromJwt(decoded);
      if (receiver_id != user.id) {
        ref
            .read(messageControllerProvider.notifier)
            .markAsDelivered(receiver_id);
        ref
            .read(userServiceProvider.notifier)
            .changeChatStatus(receiver_id, 'delivered');
      }
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
      print('MESSAGE ALINDI GROUP');
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
      final groupId = data['group_id'];
      final content = data['content'];
      final createdAt = DateTime.parse(data['created_at']);

      final updatedGroup = GroupModel(
        id: groupId,
        name: 'Grup', // Bu veriyi backend'den almanız gerekebilir
        description: null,
        createdBy: 0,
        createdAt: createdAt,
        lastMessage: content,
        lastMessageTime: createdAt,
      );

      ref.read(userServiceProvider.notifier).updateGroup(updatedGroup);
    });

    // State güncelle
    state = MySocket(socket: _socket);

    print('[SOCKET] Socket kurulumu tamamlandı');
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
