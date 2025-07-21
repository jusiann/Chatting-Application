import 'package:mobile/features/chat/models/user_model.dart';

class ChatModel {
  String firstName;
  String lastName;
  String? title;
  String email;
  String? icon;
  String? profilepic;
  bool isGroup;
  DateTime time;
  String? lastSeen;
  String currentMessage;
  int id;
  int? senderid;
  String? messageStatus;
  String? department;

  ChatModel({
    required this.firstName,
    required this.lastName,
    required this.email,
    this.icon,
    required this.isGroup,
    required this.time,
    this.lastSeen,
    required this.currentMessage,
    required this.id,
    this.senderid,
    this.messageStatus,
    this.title,
    this.department,
    this.profilepic,
  });

  factory ChatModel.fromJson(Map<String, dynamic> json) {
    return ChatModel(
      firstName: json['first_name'],
      lastName: json['last_name'],
      email: json['email'],
      isGroup: false,
      time: DateTime.parse(json['last_message_time']),
      currentMessage: json['last_message'],
      id: json['id'],
      senderid: json['message_sender'],
      messageStatus: json['message_status'],
      title: json['title'],
      department: json['department'],
      profilepic: json['profile_pic'],
    );
  }

  factory ChatModel.fromUser(UserModel user) {
    return ChatModel(
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isGroup: false,
      time: DateTime.parse(DateTime.now().toString()),
      currentMessage: '',
      id: user.id,
      title: user.title,
      department: user.department,
      profilepic: user.profilepic,
    );
  }

  String get fullname => '$firstName $lastName';
}
