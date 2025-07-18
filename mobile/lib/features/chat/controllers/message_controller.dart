import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/chat/controllers/individual_page_controller.dart';
import 'package:mobile/features/chat/controllers/providers.dart';
import 'package:mobile/features/chat/controllers/unread_message_controller.dart';
import 'package:mobile/features/chat/controllers/user_service.dart';
import 'package:mobile/features/chat/models/chat_model.dart';
import 'package:mobile/features/chat/models/message_model.dart';
import 'package:mobile/features/chat/models/user_model.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
part 'message_controller.g.dart';

@riverpod
class MessageController extends _$MessageController {
  List<MessageModel> _messages = [];
  bool _hasMore = true;
  int _page = 0;
  final int _pageSize = 20;

  @override
  List<MessageModel> build() {
    return _messages;
  }

  bool get hasMore => _hasMore;

  Future<void> fetchMore(int otherUserId) async {
    if (!_hasMore) return;

    _page++;

    final newMessages = await fetchMessagesFromDb(
      otherUserId: otherUserId,
      token: ref.read(authControllerProvider.notifier).token!,
      page: _page,
      pageSize: _pageSize,
    );

    if (newMessages.length < _pageSize) {
      _hasMore = false;
    }

    _messages.insertAll(0, newMessages);
    _messages.sort((a, b) => a.time.compareTo(b.time));
    state = [..._messages];
  }

  void addFromSocket(MessageModel msg) {
    final message = msg;
    final isDuplicate = _messages.any(
      (m) =>
          m.text == message.text &&
          m.senderid == message.senderid &&
          m.receiverid == message.receiverid &&
          m.time.difference(message.time).inMilliseconds.abs() < 100,
    );
    if (!isDuplicate) {
      _messages.add(message);
      state = [..._messages];
    }
  }

  void addFromDb(List<MessageModel> list) {
    _messages.addAll(list);
    _messages.sort((a, b) => a.time.compareTo(b.time));
    state = [..._messages];
  }

  List<MessageModel> forChat(int otherUserId, int currentUserId) {
    return _messages
        .where(
          (m) =>
              (m.senderid == currentUserId && m.receiverid == otherUserId) ||
              (m.senderid == otherUserId && m.receiverid == currentUserId),
        )
        .toList();
  }

  void markAsDelivered(int id, String deliveredAt) {
    final index = state.indexWhere((msg) => msg.id == id);
    if (index != -1) {
      final updated = state[index].copyWith(
        status: 'delivered',
        deliveredAt: deliveredAt,
      );
      state = [...state]..[index] = updated;
    }
  }

  void markAsRead(int id, String readAt) {
    final index = state.indexWhere((msg) => msg.id == id);
    if (index != -1) {
      final updated = state[index].copyWith(status: 'read', readAt: readAt);
      state = [...state]..[index] = updated;
    }
  }

  void handleIncomingMessages(dynamic data) async {
    final currentUserId = ref.read(authControllerProvider).authUser!.id;
    final senderId = (data['senderid'] as int);
    final openChatId = ref.read(openChatIdProvider);

    final isChatOpen =
        (openChatId != null && openChatId == senderId) ||
        currentUserId == senderId;

    if (!isChatOpen) {
      ref
          .read(unreadMessageControllerProvider.notifier)
          .incrementUnread(senderId);
    }
    ChatModel model;

    if (senderId != currentUserId) {
      UserModel? user;
      try {
        user = ref
            .read(userServiceProvider)
            .contactUsers
            .firstWhere((u) => u.id == senderId);
      } catch (err) {
        user = null;
      }
      if (user == null) {
        await ref.read(userServiceProvider.notifier).fetchUsers();
        user = ref
            .read(userServiceProvider)
            .contactUsers
            .firstWhere((u) => u.id == senderId);
      }
      model = ChatModel(
        name: user.name,
        surname: user.surname,
        email: user.email,
        isGroup: false,
        time: DateTime.parse(data['createdat']),
        currentMessage: data['text'],
        id: senderId,
        senderid: data['senderid'],
        messageStatus: data['status'],
      );
    } else {
      final newId = data['receiverid'];
      final user = ref
          .read(userServiceProvider)
          .contactUsers
          .firstWhere((u) => u.id == newId);
      model = ChatModel(
        name: user.name,
        surname: user.surname,
        email: user.email,
        isGroup: false,
        time: DateTime.parse(data['createdat']),
        currentMessage: data['text'],
        id: user.id,
        senderid: data['senderid'],
        messageStatus: data['status'],
      );
    }
    ref.read(userServiceProvider.notifier).updateChat(model);
  }
}
