import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/svg.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/chat/controllers/custom_card_controller.dart';
import 'package:mobile/features/chat/models/chat_model.dart';

class CustomCard extends ConsumerWidget {
  const CustomCard({super.key, required this.chat, this.unRead});
  final ChatModel chat;
  final int? unRead;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUser = ref.read(authControllerProvider).authUser!.id;
    return Column(
      children: [
        ListTile(
          leading: CircleAvatar(
            backgroundColor: Colors.blueGrey,
            radius: 25,
            child: chat.profilepic != null
                ? CachedNetworkImage(
                    imageUrl: chat.profilepic!,
                    imageBuilder: (context, imageProvider) => CircleAvatar(
                      radius: 25,
                      backgroundImage: imageProvider,
                    ),
                    placeholder: (context, url) => CircleAvatar(
                      radius: 25,
                      backgroundColor: Colors.grey.shade200,
                      child: SvgPicture.asset(
                        'assets/svg_files/person.svg',
                        height: 40,
                      ),
                    ),
                  )
                : SvgPicture.asset('assets/svg_files/person.svg', width: 40),
          ),
          title: Text(
            chat.title != null
                ? '${chat.title!} ${chat.fullname}'
                : chat.fullname,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              color: Colors.black,
              fontWeight: FontWeight.w500,
            ),
          ),
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(formatMessageTime(chat.time)),
              SizedBox(height: 3),
              unReadCountWidget(unRead),
            ],
          ),
          subtitle: Row(
            children: [
              currentTextIcon(currentUser, chat.senderid!, chat.messageStatus!),
              SizedBox(width: 5),
              Text(
                chat.currentMessage,
                style: TextStyle(fontFamily: 'Inter', fontSize: 13),
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
