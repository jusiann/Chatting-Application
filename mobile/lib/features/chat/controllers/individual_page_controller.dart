import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mobile/config.dart';
import 'package:mobile/features/chat/models/message_model.dart';

Future<List<MessageModel>> fetchMessagesFromDb({
  required int otherUserId,
  required String token,
  required bool isFirst,
}) async {
  final uri = Uri.parse(
    /* 'http://10.10.1.197:5001/api/messages/$otherUserId/$page/$pageSize', */
    '$baseUrl/api/messages/$otherUserId?isFirst=$isFirst',
  );

  final response = await http.get(
    uri,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
  );
  print('STATUS CODE : ${response.statusCode}');
  print('RESPONSE: ${response.body}');
  if (response.statusCode == 200) {
    final List<dynamic> jsonList = jsonDecode(response.body)['messages'];
    return jsonList.map((json) => MessageModel.fromJson(json)).toList();
  } else {
    print(response.body);
    throw Exception('Mesajlar yüklenirken hata oluştu.');
  }
}

Future<List<MessageModel>> fetchMoreMessages({
  required int otherUserId,
  required String token,
}) async {
  final uri = Uri.parse(
    /* 'http://10.10.1.197:5001/api/messages/$otherUserId/$page/$pageSize', */
    '$baseUrl/api/messages/$otherUserId',
  );

  final response = await http.get(
    uri,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
  );
  print('STATUS CODE : ${response.statusCode}');
  print('RESPONSE: ${response.body}');
  if (response.statusCode == 200) {
    final List<dynamic> jsonList = jsonDecode(response.body)['messages'];
    return jsonList.map((json) => MessageModel.fromJson(json)).toList();
  } else {
    print(response.body);
    throw Exception('Mesajlar yüklenirken hata oluştu.');
  }
}

Future<MessageModel> sendMessage({
  required String text,
  required int id,
  required String token,
}) async {
  final url = Uri.parse('$baseUrl/api/messages/send/$id');
  final response = await http.post(
    url,
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'Application/json',
    },
    body: jsonEncode({'content': text}),
  );
  if (response.statusCode == 200) {
    final messageJson = jsonDecode(response.body);
    return MessageModel.fromJson(messageJson);
  } else {
    throw Exception('Mesaj gonderilirken hata olustu.');
  }
}
