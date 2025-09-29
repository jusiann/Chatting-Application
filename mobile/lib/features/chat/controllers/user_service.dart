import 'dart:async';
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
  List<GroupModel> userGroups;
  bool fetchingUsers = false;
  ContactUsers({
    required this.contactUsers,
    required this.messageUsers,
    this.userGroups = const [],
    this.fetchingUsers = false, // Default değer
  });

  ContactUsers copyWith({
    List<UserModel>? contactUsers,
    List<ChatModel>? messageUsers,
    List<GroupModel>? userGroups,
    bool? fetchingUsers,
  }) {
    return ContactUsers(
      contactUsers: contactUsers ?? this.contactUsers,
      messageUsers: messageUsers ?? this.messageUsers,
      userGroups: userGroups ?? this.userGroups,
      fetchingUsers: fetchingUsers ?? this.fetchingUsers,
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
  
  final Map<int, Timer> _typingTimers = {}; // userId -> Timer
  void addTypingUser(int userId) {
    final idx = state.contactUsers.indexWhere((user) => user.id == userId);
    if (idx == -1) return;

    final typingUser = state.contactUsers[idx];
    if (typingUser.typing == true) {
      _typingTimers[userId]?.cancel();
      _typingTimers[userId] = Timer(const Duration(seconds: 3), () {
        removeTypingUser(userId);
        _typingTimers.remove(userId);
        return;
      });
    }
    final updatedTypingUser = typingUser.copyWith(typing: true);
    final updatedList = List<UserModel>.from(state.contactUsers);
    updatedList[idx] = updatedTypingUser;
    state = state.copyWith(contactUsers: updatedList);

    // Eski timer varsa iptal et
    _typingTimers[userId]?.cancel();

    // Yeni timer başlat
    _typingTimers[userId] = Timer(const Duration(seconds: 3), () {
      removeTypingUser(userId);
      _typingTimers.remove(userId);
    });
  }

  void removeTypingUser(int userId) {
    final idx = state.contactUsers.indexWhere((user) => user.id == userId);
    if (idx == -1) return;

    final user = state.contactUsers[idx];
    final updatedUser = user.copyWith(typing: false);
    final updatedList = List<UserModel>.from(state.contactUsers);
    updatedList[idx] = updatedUser;
    state = state.copyWith(contactUsers: updatedList);
  }

  Future<void> fetchUsers() async {
    print('FETCH USER METODU ÇAGIRILDI');
    state = state.copyWith(fetchingUsers: true);
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

          state = state.copyWith(
            contactUsers: contactUsers,
            messageUsers: messageUsers,
            userGroups: userGroups,
            fetchingUsers: false,
          );
        }
        state = state.copyWith(fetchingUsers: false);
      } catch (err) {
        print(err);
        state = state.copyWith(fetchingUsers: false);
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

  void setUserOnlineStatus(int userId, bool status) {
    final userList = List<UserModel>.from(state.contactUsers);
    final index = state.contactUsers.indexWhere((user) => user.id == userId);
    if (index != -1 && status) {
      userList[index].isOnline = status;
    } else if (index != -1 && !status) {
      userList[index].isOnline = false;
      userList[index].lastSeen = DateTime.now().toLocal();
    }
    state = state.copyWith(contactUsers: userList);
  }
}
