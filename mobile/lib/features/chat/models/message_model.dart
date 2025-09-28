class MessageModel {
  int id;
  String? text;
  DateTime time;
  int senderid;
  int receiverid;
  String status;
  String? deliveredAt;
  String? readAt;
  String? fileKey;
  String? fileUrl;
  String? fileType;

  MessageModel({
    this.text,
    required this.time,
    required this.senderid,
    required this.receiverid,
    required this.id,
    this.status = 'sent',
    this.deliveredAt,
    this.readAt,
    this.fileKey,
    this.fileUrl,
    this.fileType,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      text: json['content'],
      time: DateTime.parse(json['created_at']).toLocal(),
      senderid: json['sender_id'],
      receiverid: json['receiver_id'],
      id: json['id'],
      status: json['status'] ?? 'sent',
      deliveredAt: json['delivered_at'],
      readAt: json['read_at'],
      fileKey: json['file_key'],
      fileUrl: json['file_url'],
      fileType: json['file_type'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    if(text != null) 'content': text,
    'time': time,
    'sender_id': senderid,
    'receiver_id': receiverid,
    'status': status,
    'delivered_at': deliveredAt,
    'read_at': readAt,
    if(fileKey != null) 'file_key': fileKey,
    if(fileType != null) 'file_type': fileType,
  };

  factory MessageModel.fromMap(Map<String, dynamic> map) {
    return MessageModel(
      text: map['content'],
      time: DateTime.parse(map['created_at']).toLocal(),
      senderid: map['sender_id'],
      receiverid: map['receiver_id'],
      id: map['id'],
      status: map['status'] ?? 'sent',
      deliveredAt: map['delivered_at'],
      readAt: map['read_at'],
      fileUrl: map['file_url'],
      fileKey: map['file_key'],
      fileType: map['file_type'],
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
    String? fileUrl,
    String? fileKey,
    String? fileType,
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
      fileUrl: fileUrl ?? this.fileUrl,
      fileKey: fileKey ?? this.fileKey,
      fileType: fileType ?? this.fileType,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MessageModel &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  List<int> get conversationKey => [senderid, receiverid]..sort();
}
