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
      text: json['text'],
      time: DateTime.parse(json['createdat']),
      senderid: json['senderid'],
      receiverid: json['receiverid'],
      id: json['id'],
      status: json['status'] ?? 'sent',
      deliveredAt: json['delivered_at'],
      readAt: json['read_at'],
    );
  }

  Map<String, dynamic> toJson() => {
    if (id != null) 'id': id,
    'text': text,
    'time': time,
    'senderid': senderid,
    'receiverid': receiverid,
    'status': status,
    'delivered_at': deliveredAt,
    'read_at': readAt,
  };

  factory MessageModel.fromMap(Map<String, dynamic> map) {
    return MessageModel(
      text: map['text'],
      time: DateTime.parse(map['time']),
      senderid: map['senderid'],
      receiverid: map['receiverid'],
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
