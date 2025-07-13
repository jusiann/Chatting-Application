import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mobile/features/chat/models/message_model.dart';

Future<List<MessageModel>> fetchMessages(int id, String token) async {
  try {
    final url = Uri.parse('http://192.168.1.9:5001/api/messages/$id');
    final response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<MessageModel> messages = data
          .map<MessageModel>((message) => MessageModel.fromJson(message))
          .toList();
      return messages;
    } else {
      throw Exception('mesajlar alınamadı');
    }
  } catch (err) {
    print(err);
    throw Exception('Mesajlar alınamadı. $err');
  }
}

Future<MessageModel> sendMessage({
  required String text,
  required int id,
  required String token,
}) async {
  final url = Uri.parse('http://192.168.1.9:5001/api/messages/send/$id');
  final response = await http.post(
    url,
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'Application/json',
    },
    body: jsonEncode({'text': text}),
  );
  if (response.statusCode == 200) {
    final messageJson = jsonDecode(response.body);
    return MessageModel.fromJson(messageJson);
  } else {
    throw Exception('Mesaj gonderilirken hata olustu.');
  }
}
