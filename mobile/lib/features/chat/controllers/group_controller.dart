import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/config.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/chat/controllers/socket_service.dart';
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
      Uri.parse('$baseUrl/api/groups/user-groups'),
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
      Uri.parse('$baseUrl/api/groups/create'),
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

    if (response.statusCode == 200 || response.statusCode == 201) {
      await ref.read(userServiceProvider.notifier).fetchUsers();
      final decoded = jsonDecode(response.body);
      final rawId = decoded['id'];
      int groupId = rawId is int ? rawId : int.parse(rawId.toString());
      ref.read(socketServiceProvider.notifier).emit('join_group', groupId);
      ref.read(socketServiceProvider.notifier).emit('new_group', {
        'memberIds': memberIds,
        'groupId': groupId,
      });
      return true;
    }
    return false;
  }
}

@Riverpod()
class GroupMessageController extends _$GroupMessageController {
  @override
  List<GroupMessageModel> build() => [];
  bool _hasMore = true;
  int? cursor;
  bool _isLoading = false;

  Future<void> fetchGroupMessages(int groupId) async {
    if (_isLoading) return;
    _isLoading = true;
    final token = ref.read(authControllerProvider.notifier).token;
    print("Fetching messages for group $groupId");
    final response = await http.get(
      Uri.parse('$baseUrl/api/groups/$groupId/messages?isFirst=true'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      print("Messages fetched successfully for group $groupId");
      final List<dynamic> data = jsonDecode(response.body)['messages'];
      _hasMore = jsonDecode(response.body)['hasMore'];
      cursor = jsonDecode(response.body)['cursor'];
      final messages = data
          .map((json) => GroupMessageModel.fromJson(json))
          .toList();
      final combined = [...state, ...messages];
      final uniqueMessages = <int, GroupMessageModel>{};
      for (var msg in combined) {
        uniqueMessages[msg.id] = msg;
      }
      state = uniqueMessages.values.toList();
    }
    _isLoading = false;
  }

  Future<void> fetchMoreGroupMessages(int groupId) async {
    if (_isLoading || !_hasMore) return;
    _isLoading = true;
    final token = ref.read(authControllerProvider.notifier).token;
    print("Fetching messages for group $groupId");
    final response = await http.get(
      Uri.parse(
        '$baseUrl/api/groups/$groupId/messages?isFirst=false&cursor=${cursor ?? ''}',
      ),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      print("Messages fetched successfully for group $groupId");
      final List<dynamic> data = jsonDecode(response.body)['messages'];
      _hasMore = jsonDecode(response.body)['hasMore'];
      cursor = jsonDecode(response.body)['cursor'];
      final messages = data
          .map((json) => GroupMessageModel.fromJson(json))
          .toList();
      final combined = [...state, ...messages];
      final uniqueMessages = <int, GroupMessageModel>{};
      for (var msg in combined) {
        uniqueMessages[msg.id] = msg;
      }
      state = uniqueMessages.values.toList();
    }
    _isLoading = false;
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
