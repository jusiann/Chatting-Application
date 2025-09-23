import 'package:flutter/material.dart';
import 'package:mobile/features/chat/controllers/custom_card_controller.dart';
import 'package:mobile/features/chat/models/group_model.dart';

class GroupChatCardWidget extends StatelessWidget {
  const GroupChatCardWidget({
    super.key,
    required this.group,
    required this.unreadCount,
  });

  final GroupModel group;
  final int? unreadCount;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ListTile(
          leading: CircleAvatar(
            radius: 25,
            backgroundColor: Color(0xFF910811),
            child: Icon(Icons.group, color: Colors.white, size: 30),
          ),
          title: Text(
            group.name,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          subtitle: Text(
            group.lastMessage ?? 'Grup oluşturuldu',
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 12,
              color: Color(0xFF777777),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                group.lastMessageTime != null
                    ? formatMessageTime(group.lastMessageTime!)
                    : formatMessageTime(group.createdAt),
              ),
              SizedBox(height: 6),
              if (unreadCount != null && unreadCount! > 0)
                CircleAvatar(
                  backgroundColor: Color(0xFF910811),
                  radius: 10,
                  child: Text(
                    unreadCount.toString(),
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
            ],
          ),
        ),
        Divider(height: 1, thickness: 0.5),
      ],
    );
  }
}
