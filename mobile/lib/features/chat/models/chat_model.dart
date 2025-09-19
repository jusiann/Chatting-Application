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
  int messageId;
  int? unreadCount;

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
    required this.messageId,
    this.unreadCount,
  });

  factory ChatModel.fromJson(Map<String, dynamic> json) {
    final lastMessage = json['lastMessage'] as Map<String, dynamic>?;
    return ChatModel(
      firstName: json['first_name'],
      lastName: json['last_name'],
      email: json['email'],
      isGroup: false,
      time: lastMessage != null && lastMessage['created_at'] != null
          ? DateTime.parse(lastMessage['created_at']).toLocal()
          : DateTime.now(),
      currentMessage: lastMessage?['content'] ?? '',
      id: json['id'],
      senderid: lastMessage?['sender'] ?? 0,
      messageStatus: lastMessage?['status'] ?? '',
      title: json['title'],
      department: json['department'],
      profilepic: json['profile_pic'],
      messageId: lastMessage?['id'] ?? -1,
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
      messageId: -1,
    );
  }

  ChatModel copyWith({
    String? firstName,
    String? lastName,
    String? email,
    String? icon,
    bool? isGroup,
    DateTime? time,
    String? lastSeen,
    String? currentMessage,
    int? id,
    int? senderid,
    String? messageStatus,
    String? title,
    String? department,
    String? profilepic,
    int? messageId,
  }) {
    return ChatModel(
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      icon: icon ?? this.icon,
      isGroup: isGroup ?? this.isGroup,
      time: time ?? this.time,
      lastSeen: lastSeen ?? this.lastSeen,
      currentMessage: currentMessage ?? this.currentMessage,
      id: id ?? this.id,
      senderid: senderid ?? this.senderid,
      messageStatus: messageStatus ?? this.messageStatus,
      title: title ?? this.title,
      department: department ?? this.department,
      profilepic: profilepic ?? this.profilepic,
      messageId: messageId ?? this.messageId,
    );
  }

  String get fullname => '$firstName $lastName';
}
