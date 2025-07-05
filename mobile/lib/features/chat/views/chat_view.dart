import 'package:flutter/material.dart';
import 'package:mobile/features/chat/models/chat_model.dart';
import 'package:mobile/features/chat/views/widgets/custom_card_widget.dart';

class ChatPage extends StatelessWidget {
  const ChatPage({super.key});

  @override
  Widget build(BuildContext context) {
    List<ChatModel> chats = [
      ChatModel(
        name: 'Arş. Gör. Derya Kaya',
        isGroup: false,
        time: '22.02',
        currentMessage: 'Görüşürüz.',
      ),
      ChatModel(
        name: 'Mehmet Özkan',
        isGroup: false,
        time: '06.30',
        currentMessage: 'Anlaşıldı',
      ),
      ChatModel(
        name: 'Doç. Dr. Emre Tanrıverdi',
        isGroup: false,
        time: '14.43',
        currentMessage: 'Haha bende öyle düşünüyorum',
      ),
    ];
    return Scaffold(
      body: ListView(
        children: [
          CustomCard(chat: chats[0]),
          CustomCard(chat: chats[1]),
          CustomCard(chat: chats[2]),
        ],
      ),
    );
  }
}
