import 'package:flutter/material.dart';
import 'package:mobile/features/chat/controllers/custom_card_controller.dart';
import 'package:mobile/features/chat/models/message_model.dart';
import 'package:mobile/features/chat/views/widgets/full_screen_image.dart';
import 'package:mobile/features/chat/views/widgets/pdf_viewer_page.dart';

class ReceivedMessageWidget extends StatelessWidget {
  const ReceivedMessageWidget({super.key, required this.message});
  final MessageModel message;

  @override
  Widget build(BuildContext context) {
    Widget messageContent(MessageModel msg) {
      if (msg.fileUrl != null && msg.fileType!.startsWith('image')) {
        return GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => FullScreenImage(url: msg.fileUrl!),
              ),
            );
          },
          child: Image.network(
            msg.fileUrl!,
            width: 100,
            height: 100,
            fit: BoxFit.cover,
          ),
        );
      }
      if (msg.text != null) {
        return Text(
          msg.text!,
          style: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 14,
            color: Color(0xFF910811),
          ),
        );
      }
      if (msg.fileUrl != null && msg.fileType!.startsWith('application')) {
        return GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => PdfViewerPage(url: msg.fileUrl!),
              ),
            );
          },
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.picture_as_pdf, color: Colors.red, size: 30),
                SizedBox(width: 8),
                Text(
                  'dosya.pdf',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        );
      }
      return const Text('no message');
    }

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
              padding: const EdgeInsets.only(left: 5, right: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(right: 70, left: 5, top: 5),
                    child: messageContent(message),
                  ),
                  const SizedBox(height: 5),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        formatMessageTime(message.time),
                        style: const TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 12,
                          color: Color(0xFF910811),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
