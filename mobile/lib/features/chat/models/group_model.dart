class GroupModel {
  final int id;
  final String name;
  final String? description;
  final int createdBy;
  final String? role;
  final String? lastMessage;
  final DateTime? lastMessageTime;
  final DateTime createdAt;
  final int? unreadCount;

  GroupModel({
    required this.id,
    required this.name,
    this.description,
    required this.createdBy,
    this.role,
    this.lastMessage,
    this.lastMessageTime,
    required this.createdAt,
    this.unreadCount,
  });

  factory GroupModel.fromJson(Map<String, dynamic> json) {
    return GroupModel(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      createdBy: json['created_by'],
      role: json['role'],
      lastMessage: json['last_message'],
      lastMessageTime: json['last_message_time'] != null
          ? DateTime.parse(json['last_message_time']).toLocal()
          : null,
      createdAt: DateTime.parse(json['created_at']).toLocal(),
      unreadCount: int.tryParse(json['unread_count'].toString()) ?? 0,
    );
  }
}
