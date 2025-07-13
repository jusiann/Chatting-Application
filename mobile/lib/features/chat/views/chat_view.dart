import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/chat/controllers/user_service.dart';
import 'package:mobile/features/chat/models/chat_model.dart';
import 'package:mobile/features/chat/views/individual_view.dart';
import 'package:mobile/features/chat/views/widgets/custom_card_widget.dart';

class ChatPage extends ConsumerWidget {
  const ChatPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userState = ref.watch(userServiceProvider);
    List<ChatModel> chats = userState.messageUsers;

    if (ref.read(userServiceProvider).messageUsers.isEmpty) {
      return Center(child: CircularProgressIndicator());
    }
    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(userServiceProvider.notifier).fetchUsers();
      },
      child: ListView.builder(
        itemBuilder: (context, index) => InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => IndividualPage(chat: chats[index]),
              ),
            );
          },
          child: CustomCard(chat: chats[index]),
        ),
        itemCount: chats.length,
      ),
    );
  }
}
