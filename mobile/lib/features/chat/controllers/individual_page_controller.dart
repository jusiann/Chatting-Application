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
