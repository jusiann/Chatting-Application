import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/svg.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/chat/controllers/custom_card_controller.dart';
import 'package:mobile/features/chat/controllers/user_service.dart';
import 'package:mobile/features/chat/models/chat_model.dart';

class CustomCard extends ConsumerWidget {
  const CustomCard({super.key, required this.chat, this.unRead});
  final ChatModel chat;
  final int? unRead;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUser = ref.read(authControllerProvider).authUser!.id;
    final messagingUser = ref
        .watch(userServiceProvider)
        .contactUsers
        .where((user) => user.id == chat.id)
        .first;
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
          title: Row(
            children: [
              Expanded(
                child: Text(
                  chat.title != null
                      ? '${chat.title!} ${chat.fullname}'
                      : chat.fullname,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 14,
                    color: Colors.black,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          trailing: SizedBox(
            width: 80,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(formatMessageTime(chat.time)),
                SizedBox(height: 6),
                unReadCountWidget(unRead),
              ],
            ),
          ),
          subtitle: messagingUser.typing!
              ? Text(
                  'Yazıyor...',
                  style: TextStyle(
                    fontStyle: FontStyle.italic,
                    color: Colors.green,
                    fontFamily: 'Inter',
                    fontSize: 13,
                  ),
                )
              : Row(
                  children: [
                    currentTextIcon(
                      currentUser,
                      chat.senderid!,
                      chat.messageStatus!,
                    ),
                    SizedBox(width: 5),
                    Expanded(
                      child: Text(
                        chat.currentMessage,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontFamily: 'Inter', fontSize: 12),
                      ),
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
