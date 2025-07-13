import 'package:mobile/features/chat/controllers/socket_service.dart';
import 'package:mobile/features/chat/models/message_model.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
part 'message_controller.g.dart';

@riverpod
class MessageController extends _$MessageController {
  List<MessageModel> _messages = [];

  @override
  List<MessageModel> build() {
    return _messages;
  }

  void addMessages(MessageModel msg) {
    _messages.add(msg);
    state = [..._messages];
  }

  void listenSocket(SocketService socketService) {
    socketService.on('message', (data) {
      final msg = MessageModel(
        text: data['text'],
        time: data['time'],
        senderid: data['senderid'],
        receiverid: data['receiverid'],
      );
      addMessages(msg);
    });
  }

  void setInitialMessages(List<MessageModel> messages) {
    _messages = messages;
    state = _messages;
  }
}
