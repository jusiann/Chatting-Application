import 'package:flutter/material.dart';
import 'package:mobile/features/chat/controllers/custom_card_controller.dart';
import 'package:mobile/features/chat/models/group_message_model.dart';

class GroupMessageReceived extends StatelessWidget {
  const GroupMessageReceived({super.key, required this.message});
  final GroupMessageModel message;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width - 50,
        ),
        child: IntrinsicWidth(
          child: Card(
            color: Colors.white,
            child: Padding(
              padding: EdgeInsets.only(left: 5, right: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(right: 20, left: 5, top: 5),
                    child: Text(
                      message.fullName,
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF910811),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(right: 50, left: 5),
                    child: Text(
                      message.content,
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        color: Color(0xFF910811),
                      ),
                    ),
                  ),
                  SizedBox(height: 5),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        formatMessageTime(message.createdAt),
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 12,
                          color: Color(0xFF910811),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
