import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/chat/controllers/user_service.dart';
import 'package:mobile/features/chat/models/group_model.dart';
import 'package:mobile/features/chat/models/group_message_model.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'group_controller.g.dart';

@Riverpod(keepAlive: true)
class GroupController extends _$GroupController {
  @override
  List<GroupModel> build() => [];

  Future<void> fetchUserGroups() async {
    final token = ref.read(authControllerProvider.notifier).token;
    final response = await http.get(
      Uri.parse('http://10.10.1.197:5001/api/groups/user-groups'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      state = data.map((json) => GroupModel.fromJson(json)).toList();
    }
  }

  Future<bool> createGroup({
    required String name,
    String? description,
    required List<int> memberIds,
  }) async {
    final token = ref.read(authControllerProvider.notifier).token;
    final response = await http.post(
      Uri.parse('http://10.10.1.197:5001/api/groups/create'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'name': name,
        'description': description,
        'memberIds': memberIds,
      }),
    );

    if (response.statusCode == 200) {
      await ref.read(userServiceProvider.notifier).fetchUsers();
      return true;
    }
    return false;
  }
}

@Riverpod()
class GroupMessageController extends _$GroupMessageController {
  @override
  List<GroupMessageModel> build() => [];

  Future<void> fetchGroupMessages(int groupId, int page, int pageSize) async {
    final token = ref.read(authControllerProvider.notifier).token;
    print("Fetching messages for group $groupId, page $page, size $pageSize");
    final response = await http.get(
      Uri.parse(
        'http://10.10.1.197:5001/api/groups/$groupId/messages/$page/$pageSize',
      ),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      print("Messages fetched successfully for group $groupId");
      final List<dynamic> data = jsonDecode(response.body);
      final messages = data
          .map((json) => GroupMessageModel.fromJson(json))
          .toList();
      state = [...state, ...messages];
    }
  }

  void addGroupMessage(GroupMessageModel message) {
    state = [...state, message];
  }

  void addFromSocket(GroupMessageModel msg) {
    final message = msg;
    final isDuplicate = state.any(
      (m) =>
          m.content == message.content &&
          m.senderId == message.senderId &&
          m.groupId == message.groupId &&
          m.createdAt.difference(message.createdAt).inMilliseconds.abs() < 100,
    );
    if (!isDuplicate) {
      state = [...state, message];
    }
  }
}
