import 'package:flutter/material.dart';
import 'package:mobile/features/chat/controllers/custom_card_controller.dart';
import 'package:mobile/features/chat/models/message_model.dart';

class SendMessageWidget extends StatelessWidget {
  const SendMessageWidget({super.key, required this.message});
  final MessageModel message;

  @override
  Widget build(BuildContext context) {
    final status = message.status;
    return Align(
      alignment: Alignment.centerRight,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width - 50,
        ),
        child: IntrinsicWidth(
          child: Card(
            color: Color(0xFF910811),
            child: Padding(
              padding: EdgeInsets.only(left: 5, right: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(right: 70, left: 5, top: 5),
                    child: Text(
                      message.text,
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  SizedBox(height: 5),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        formatMessageTime(message.time),
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 12,
                          color: Colors.white,
                        ),
                      ),
                      SizedBox(width: 5),
                      buildStatusIcon(status),
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
