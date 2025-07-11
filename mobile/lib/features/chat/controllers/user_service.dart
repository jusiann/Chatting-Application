import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/chat/models/user_model.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:http/http.dart' as http;
part 'user_service.g.dart';

class ContactUsers {
  List<UserModel> users;
  ContactUsers({this.users = const []});
}

@riverpod
class UserService extends _$UserService {
  final _storage = FlutterSecureStorage();
  @override
  ContactUsers build() {
    return ContactUsers();
  }

  Future<void> fetchUsers() async {
    await ref.read(authControllerProvider.notifier).checkLoginStatus();
    if (ref.read(authControllerProvider).isLoggedIn) {
      final accessToken = await _storage.read(key: 'accessToken');
      final response = await http.get(
        Uri.parse('http://192.168.1.9:5001/api/messages/users'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken!,
        },
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final userList = data.map((user) => UserModel.fromJson(user)).toList();
        state = ContactUsers(users: userList);
      }
    }
  }
}
