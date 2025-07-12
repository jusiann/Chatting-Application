import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:mobile/features/chat/controllers/custom_card_controller.dart';
import 'package:mobile/features/chat/models/chat_model.dart';
import 'package:mobile/features/chat/views/individual_view.dart';

class CustomCard extends StatelessWidget {
  const CustomCard({super.key, required this.chat});
  final ChatModel chat;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ListTile(
          leading: CircleAvatar(
            backgroundColor: Colors.blueGrey,
            radius: 25,
            child: SvgPicture.asset(
              chat.isGroup
                  ? 'assets/svg_files/groups.svg'
                  : 'assets/svg_files/person.svg',
              height: 40,
            ),
          ),
          title: Text(
            '${chat.name} ${chat.surname}',
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 16,
              color: Colors.black,
              fontWeight: FontWeight.w500,
            ),
          ),
          trailing: Text(formatMessageTime(chat.time)),
          subtitle: Row(
            children: [
              Icon(Icons.done_all, size: 18),
              SizedBox(width: 5),
              Text(
                chat.currentMessage,
                style: TextStyle(fontFamily: 'Inter', fontSize: 14),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(left: 80, right: 20),
          child: Divider(thickness: 1),
        ),
      ],
    );
  }
}
