import 'package:mobile/features/chat/models/user_model.dart';

class GroupMessageModel {
  final int id;
  final int groupId;
  final int senderId;
  final String? content;
  final String status;
  final DateTime createdAt;
  final String senderName;
  final String senderSurname;
  final String? fileKey;
  final String? fileUrl;
  final String? fileType;

  GroupMessageModel({
    required this.id,
    required this.groupId,
    required this.senderId,
    this.content,
    required this.status,
    required this.createdAt,
    required this.senderName,
    required this.senderSurname,
    this.fileKey,
    this.fileUrl,
    this.fileType,
  });

  factory GroupMessageModel.fromJson(Map<String, dynamic> json) {
    return GroupMessageModel(
      id: json['id'],
      groupId: json['group_id'],
      senderId: json['sender_id'],
      content: json['content'],
      status: json['status'],
      createdAt: DateTime.parse(json['created_at']).toLocal(),
      senderName: json['first_name'],
      senderSurname: json['last_name'],
      fileKey: json['file_key'],
      fileUrl: json['file_url'],
      fileType: json['file_type'],
    );
  }
  factory GroupMessageModel.fromSocket(
    Map<String, dynamic> json,
    UserModel sender,
  ) {
    return GroupMessageModel(
      id: json['id'],
      groupId: json['group_id'],
      senderId: json['sender_id'],
      content: json['content'],
      status: json['status'],
      createdAt: DateTime.parse(json['created_at']).toLocal(),
      senderName: sender.firstName,
      senderSurname: sender.lastName,
      fileKey: json['file_key'],
      fileUrl: json['file_url'],
      fileType: json['file_type'],
    );
  }

  String get fullName => '$senderName $senderSurname';
}
