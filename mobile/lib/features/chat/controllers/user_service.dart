import 'dart:convert';

import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/chat/controllers/unread_group_messages.dart';
import 'package:mobile/features/chat/models/chat_model.dart';
import 'package:mobile/features/chat/models/user_model.dart';
import 'package:mobile/features/chat/models/group_model.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'package:http/http.dart' as http;
import 'package:mobile/config.dart';
part 'user_service.g.dart';

class ContactUsers {
  List<UserModel> contactUsers;
  List<ChatModel> messageUsers;
  List<GroupModel> userGroups; // Yeni alan eklendi

  ContactUsers({
    required this.contactUsers,
    required this.messageUsers,
    this.userGroups = const [], // Default değer
  });

  ContactUsers copyWith({
    List<UserModel>? contactUsers,
    List<ChatModel>? messageUsers,
    List<GroupModel>? userGroups,
  }) {
    return ContactUsers(
      contactUsers: contactUsers ?? this.contactUsers,
      messageUsers: messageUsers ?? this.messageUsers,
      userGroups: userGroups ?? this.userGroups,
    );
  }

  // Hem bireysel sohbetleri hem de grupları birleştiren method
  List<dynamic> get allChats {
    final List<dynamic> combined = [];

    // Bireysel sohbetleri ekle
    combined.addAll(messageUsers);

    // Grupları ChatModel formatına dönüştürüp ekle
    final groupChats = userGroups
        .map(
          (group) => ChatModel(
            id: group.id,
            firstName: group.name,
            lastName: '',
            email: '',
            profilepic: null,
            isGroup: true,
            time: group.lastMessageTime ?? group.createdAt,
            currentMessage: group.lastMessage ?? 'Grup oluşturuldu',
            senderid: 0,
            messageStatus: 'sent',
            messageId: -1,
            unreadCount: group.unreadCount,
          ),
        )
        .toList();

    combined.addAll(groupChats);

    // Zamana göre sırala (son mesaj zamanına göre)
    combined.sort((a, b) => b.time.compareTo(a.time));

    return combined;
  }
}

@Riverpod(keepAlive: true)
class UserService extends _$UserService {
  @override
  ContactUsers build() {
    return ContactUsers(contactUsers: [], messageUsers: [], userGroups: []);
  }

  Future<void> fetchUsers() async {
    print('FETCH USER METODU ÇAGIRILDI');
    final token = ref.read(authControllerProvider.notifier).token;
    if (token != null) {
      try {
        // Kullanıcıları getir
        final contactResponse = await http.get(
          Uri.parse('$baseUrl/api/messages/users'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        );

        // Mesaj kullanıcılarını getir
        final messageResponse = await http.get(
          Uri.parse('$baseUrl/api/messages/last-messages'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        );

        // Grupları getir
        final groupResponse = await http.get(
          Uri.parse('$baseUrl/api/groups/user-groups'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        );

        if (contactResponse.statusCode == 200 &&
            messageResponse.statusCode == 200 &&
            groupResponse.statusCode == 200) {
          final contactUserData = jsonDecode(contactResponse.body)['users'];
          final messageUserData = jsonDecode(messageResponse.body)['data'];
          final groupData = jsonDecode(groupResponse.body);
          ref.read(unreadGroupMessagesProvider.notifier).unReadcount(groupData);
          final contactUsers = contactUserData
              .map<UserModel>((user) => UserModel.fromJson(user))
              .toList();
          final messageUsers = messageUserData
              .where((user) => user['lastMessage'] != null)
              .map<ChatModel>((user) => ChatModel.fromJson(user))
              .toList();
          final userGroups = groupData
              .map<GroupModel>((group) => GroupModel.fromJson(group))
              .toList();

          state = ContactUsers(
            contactUsers: contactUsers,
            messageUsers: messageUsers,
            userGroups: userGroups,
          );
        }
      } catch (err) {
        print(err);
      }
    }
  }

  Future<void> refreshChat() async {
    final token = ref.read(authControllerProvider.notifier).token;
    if (token != null) {
      try {
        // Kullanıcıları getir
        final messageResponse = await http.get(
          Uri.parse('$baseUrl/api/messages/message-users'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        );
        if (messageResponse.statusCode == 200) {
          print('MESSAGE RESPONSE BAŞARILI');
        } else {
          print('MESSAGE RESPONSE HATA: ${messageResponse.statusCode}');
        }
        final messageUsersData = jsonDecode(messageResponse.body);
        final messageUsers = messageUsersData
            .map<ChatModel>((user) => ChatModel.fromJson(user))
            .toList();
        state = state.copyWith(messageUsers: messageUsers);
      } catch (err) {
        print(err);
      }
    }
  }

  void changeChatStatus(int receiverId, String status) {
    final index = state.messageUsers.indexWhere(
      (chat) => chat.id == receiverId,
    );
    if (index != -1) {
      final updatedChat = state.messageUsers[index].copyWith(
        messageStatus: status,
      );
      updateChat(updatedChat);
    }
  }

  void changeChatStatusRead(int userId) {
    final index = state.messageUsers.indexWhere((chat) => chat.id == userId);
    if (index != -1) {
      final updatedChat = state.messageUsers[index].copyWith(
        messageStatus: 'read',
      );
      updateChat(updatedChat);
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

  void updateGroup(GroupModel updatedGroup) {
    print('updateGroup fonksiyonu Calisti..');
    final updatedList = List<GroupModel>.from(state.userGroups);
    final index = state.userGroups.indexWhere(
      (group) => group.id == updatedGroup.id,
    );
    if (index != -1) {
      updatedList[index] = updatedGroup;
    } else {
      updatedList.add(updatedGroup);
    }
    state = state.copyWith(userGroups: updatedList);
  }
}
