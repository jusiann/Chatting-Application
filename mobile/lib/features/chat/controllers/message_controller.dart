import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/chat/controllers/individual_page_controller.dart';
import 'package:mobile/features/chat/controllers/providers.dart';
import 'package:mobile/features/chat/controllers/unread_message_controller.dart';
import 'package:mobile/features/chat/controllers/user_service.dart';
import 'package:mobile/features/chat/models/chat_model.dart';
import 'package:mobile/features/chat/models/message_model.dart';
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

  Future<void> fetchMore(int otherUserId) async {
    final newMessages = await fetchMessagesFromDb(
      otherUserId: otherUserId,
      token: ref.read(authControllerProvider.notifier).token!,
    );

    _messages.insertAll(0, newMessages);
    _messages.sort((a, b) => a.time.compareTo(b.time));
    state = [..._messages];
  }

  void addFromSocket(MessageModel msg) {
    final message = msg;
    final isDuplicate = state.any(
      (m) =>
          m.text == message.text &&
          m.senderid == message.senderid &&
          m.receiverid == message.receiverid &&
          m.time.difference(message.time).inMilliseconds.abs() < 100,
    );
    if (!isDuplicate) {
      state = [...state, message];
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

  void markAsDelivered(int receiverId) {
    state = [
      for (final msg in state)
        if (msg.receiverid == receiverId && msg.status != 'read')
          msg.copyWith(status: 'delivered')
        else
          msg,
    ];
  }

  void markAsRead(int receiverId) {
    state = [
      for (final msg in state)
        if (msg.receiverid == receiverId) msg.copyWith(status: 'read') else msg,
    ];
  }

  void markReadAll(int readerId, String readAt) {
    state = [
      for (final msg in state)
        if (msg.receiverid == readerId)
          msg.copyWith(status: 'read', readAt: readAt)
        else
          msg,
    ];
  }

  void handleIncomingMessages(dynamic data) async {
    final currentUserId = ref.read(authControllerProvider).authUser!.id;
    final senderId = (data['sender_id'] as int);
    final otherUserId = senderId != currentUserId
        ? senderId
        : (data['receiver_id'] as int);
    final otherUser = ref
        .read(userServiceProvider)
        .contactUsers
        .where((user) => user.id == otherUserId)
        .firstOrNull;
    if (otherUser != null) {
      final updatedModel = ChatModel.fromUser(otherUser!).copyWith(
        time: DateTime.parse(data['created_at']).toLocal(),
        currentMessage: data['content'],
        senderid: data['sender_id'],
        messageStatus: data['status'],
        messageId: data['id'],
      );
      ref.read(userServiceProvider.notifier).updateChat(updatedModel);
    }
    final openChatId = ref.read(openChatControllerProvider).id;
    final openChatType = ref.read(openChatControllerProvider).type;

    final isChatOpen =
        (openChatType == 'individual' && openChatId == senderId) ||
        currentUserId == senderId;
    if (!isChatOpen) {
      ref
          .read(unreadMessageControllerProvider.notifier)
          .incrementUnread(senderId);
      /* await ref.read(userServiceProvider.notifier).refreshChat(); */
    }
  }
}
