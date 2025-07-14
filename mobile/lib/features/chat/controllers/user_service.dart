import 'dart:convert';

import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/chat/models/chat_model.dart';
import 'package:mobile/features/chat/models/user_model.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:http/http.dart' as http;
part 'user_service.g.dart';

class ContactUsers {
  List<UserModel> contactUsers;
  List<ChatModel> messageUsers;
  ContactUsers({this.contactUsers = const [], this.messageUsers = const []});
  ContactUsers copyWith({
    List<UserModel>? contactUsers,
    List<ChatModel>? messageUsers,
  }) {
    return ContactUsers(
      contactUsers: contactUsers ?? this.contactUsers,
      messageUsers: messageUsers ?? this.messageUsers,
    );
  }
}

@Riverpod(keepAlive: true)
class UserService extends _$UserService {
  @override
  ContactUsers build() {
    return ContactUsers();
  }

  Future<void> fetchUsers() async {
    print('[DEBUG] Kullanici cagrisi yapıldı');
    var responseContact;
    var responseMessageUsers;
    final authController = ref.read(authControllerProvider.notifier);
    if (ref.read(authControllerProvider).isLoggedIn) {
      try {
        final accessToken = authController.token;
        responseContact = await http.get(
          Uri.parse('http://192.168.1.9:5001/api/messages/users'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $accessToken',
          },
        );
        responseMessageUsers = await http.get(
          Uri.parse('http://192.168.1.9:5001/api/messages/messageUsers'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $accessToken',
          },
        );
      } catch (err) {
        print(err);
      }

      if (responseContact.statusCode == 200 &&
          responseMessageUsers.statusCode == 200) {
        try {
          final List<dynamic> contactData = jsonDecode(responseContact.body);
          final List<dynamic> messageUserData = jsonDecode(
            responseMessageUsers.body,
          );
          final contactUsers = contactData
              .map((user) => UserModel.fromJson(user))
              .toList();
          final messageUsers = messageUserData
              .map((user) => ChatModel.fromJson(user))
              .toList();

          state = ContactUsers(
            contactUsers: contactUsers,
            messageUsers: messageUsers,
          );
          print(messageUsers);
        } catch (err) {
          print(err);
        }
      }
    }
  }

  void updateChat(ChatModel updatedChat) {
    print('updateChat fonksiyonu Calisti..');
    final updatedList = List<ChatModel>.from(state.messageUsers);
    final index = state.messageUsers.indexWhere(
      (chat) => chat.id == updatedChat.id,
    );
    if (index != -1) {
      updatedList[index] = updatedChat;
    } else {
      updatedList.add(updatedChat);
    }
    updatedList.sort((a, b) => b.time.compareTo(a.time));
    state = state.copyWith(messageUsers: updatedList);
  }
}
