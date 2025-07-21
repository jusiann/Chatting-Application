class MessageModel {
  int id;
  String text;
  DateTime time;
  int senderid;
  int receiverid;
  String status;
  String? deliveredAt;
  String? readAt;

  MessageModel({
    required this.text,
    required this.time,
    required this.senderid,
    required this.receiverid,
    required this.id,
    this.status = 'sent',
    this.deliveredAt,
    this.readAt,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      text: json['content'],
      time: DateTime.parse(json['created_at']),
      senderid: json['sender_id'],
      receiverid: json['receiver_id'],
      id: json['id'],
      status: json['status'] ?? 'sent',
      deliveredAt: json['delivered_at'],
      readAt: json['read_at'],
    );
  }

  Map<String, dynamic> toJson() => {
    if (id != null) 'id': id,
    'content': text,
    'time': time,
    'sender_id': senderid,
    'receiver_id': receiverid,
    'status': status,
    'delivered_at': deliveredAt,
    'read_at': readAt,
  };

  factory MessageModel.fromMap(Map<String, dynamic> map) {
    return MessageModel(
      text: map['content'],
      time: DateTime.parse(map['created_at']),
      senderid: map['sender_id'],
      receiverid: map['receiver_id'],
      id: map['id'],
      status: map['status'] ?? 'sent',
      deliveredAt: map['delivered_at'],
      readAt: map['read_at'],
    );
  }

  MessageModel copyWith({
    int? id,
    String? text,
    DateTime? time,
    int? senderid,
    int? receiverid,
    String? status,
    String? deliveredAt,
    String? readAt,
  }) {
    return MessageModel(
      id: id ?? this.id,
      text: text ?? this.text,
      time: time ?? this.time,
      senderid: senderid ?? this.senderid,
      receiverid: receiverid ?? this.receiverid,
      status: status ?? this.status,
      deliveredAt: deliveredAt ?? this.deliveredAt,
      readAt: readAt ?? this.readAt,
    );
  }

  List<int> get conversationKey => [senderid, receiverid]..sort();
}
