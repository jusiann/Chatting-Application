import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/chat/controllers/unread_group_messages.dart';
import 'package:mobile/features/chat/controllers/unread_message_controller.dart';
import 'package:mobile/features/chat/controllers/user_service.dart';
import 'package:mobile/features/chat/models/chat_model.dart';
import 'package:mobile/features/chat/models/group_model.dart';
import 'package:mobile/features/chat/views/individual_view.dart';
import 'package:mobile/features/chat/views/group_chat_view.dart';
import 'package:mobile/features/chat/views/widgets/custom_card_widget.dart';
import 'package:mobile/features/chat/views/widgets/group_chat_card_widget.dart';

class ChatPage extends ConsumerWidget {
  const ChatPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unReadCount = ref.watch(unreadMessageControllerProvider);
    final groupUnReadCount = ref.watch(unreadGroupMessagesProvider);
    final userState = ref.watch(userServiceProvider);
    final allChats = userState.allChats; // Hem gruplar hem bireysel sohbetler

    if (userState.fetchingUsers) {
      return Center(child: CircularProgressIndicator());
    }

    if (userState.fetchingUsers == false && allChats.isEmpty) {
      return Center(
        child: Text("Henüz mesaj yok. Kişi ekleyin veya bir gruba katılın!"),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(userServiceProvider.notifier).fetchUsers();
      },
      child: ListView.builder(
        itemBuilder: (context, index) {
          final chat = allChats[index];

          if (chat is ChatModel && chat.isGroup) {
            // Grup sohbeti
            return InkWell(
              onTap: () {
                // GroupModel'e dönüştür
                final groupModel = GroupModel(
                  id: chat.id,
                  name: chat.firstName,
                  description: null,
                  createdBy: 0,
                  createdAt: chat.time,
                  lastMessage: chat.currentMessage,
                  lastMessageTime: chat.time,
                );

                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => GroupChatView(group: groupModel),
                  ),
                );
              },
              child: GroupChatCardWidget(
                group: GroupModel(
                  id: chat.id,
                  name: chat.firstName,
                  description: null,
                  createdBy: 0,
                  createdAt: chat.time,
                  lastMessage: chat.currentMessage,
                  lastMessageTime: chat.time,
                ),
                unreadCount:
                    groupUnReadCount[chat.id] ??
                    0, // Grup için unread count ekleyebilirsiniz
              ),
            );
          } else if (chat is ChatModel) {
            // Bireysel sohbet
            return InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => IndividualPage(chat: chat)),
                );
              },
              child: CustomCard(chat: chat, unRead: unReadCount[chat.id]),
            );
          } else {
            return SizedBox.shrink();
          }
        },
        itemCount: allChats.length,
      ),
    );
  }
}
