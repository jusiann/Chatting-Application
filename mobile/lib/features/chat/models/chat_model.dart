import 'package:mobile/features/chat/models/user_model.dart';

class ChatModel {
  String name;
  String surname;
  String email;
  String? icon;
  bool isGroup;
  String time;
  String? lastSeen;
  String currentMessage;
  int id;

  ChatModel({
    required this.name,
    required this.surname,
    required this.email,
    this.icon,
    required this.isGroup,
    required this.time,
    this.lastSeen,
    required this.currentMessage,
    required this.id,
  });

  factory ChatModel.fromJson(Map<String, dynamic> json) {
    return ChatModel(
      name: json['name'],
      surname: json['surname'],
      email: json['email'],
      isGroup: false,
      time: json['last_message_time'],
      currentMessage: json['last_message'],
      id: json['id'],
    );
  }

  factory ChatModel.fromUser(UserModel user) {
    return ChatModel(
      name: user.name,
      surname: user.surname,
      email: user.email,
      isGroup: false,
      time: '12.00',
      currentMessage: '',
      id: user.id,
    );
  }
}
