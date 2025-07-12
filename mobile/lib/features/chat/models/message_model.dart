import 'package:flutter/foundation.dart';

class MessageModel {
  String text;
  String time;
  int senderid;
  bool? status;
  MessageModel({
    required this.text,
    required this.time,
    required this.senderid,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      text: json['text'],
      time: json['createdat'],
      senderid: json['senderid'],
    );
  }
}
