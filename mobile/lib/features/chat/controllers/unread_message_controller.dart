import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mobile/config.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
part 'unread_message_controller.g.dart';

@Riverpod(keepAlive: true)
class UnreadMessageController extends _$UnreadMessageController {
  @override
  Map<int, int> build() => {};

  Future<void> fetchUnreadCounts(String token) async {
    final uri = Uri.parse('$baseUrl/api/messages/unread-count');
    final response = await http.get(
      uri,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      state = {
        for (var entry in data.entries) int.parse(entry.key): entry.value,
      };
    }
  }

  void incrementUnread(int senderId) {
    state = {...state, senderId: (state[senderId] ?? 0) + 1};
  }

  void clearUnread(int senderId) {
    state = {...state, senderId: 0};
  }
}
