class MessageModel {
  String text;
  String time;
  int senderid;
  bool? status;
  int receiverid;
  MessageModel({
    required this.text,
    required this.time,
    required this.senderid,
    required this.receiverid,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      text: json['text'],
      time: json['createdat'],
      senderid: json['senderid'],
      receiverid: json['receiverid'],
    );
  }
}
