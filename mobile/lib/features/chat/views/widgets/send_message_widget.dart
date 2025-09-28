import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/chat/controllers/custom_card_controller.dart';
import 'package:mobile/features/chat/models/message_model.dart';
import 'package:mobile/features/chat/views/widgets/full_screen_image.dart';
import 'package:mobile/features/chat/views/widgets/pdf_viewer_page.dart';

class SendMessageWidget extends ConsumerWidget {
  const SendMessageWidget({super.key, required this.message});
  final MessageModel message;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = message.status;
    bool isFileMessage(MessageModel msg) {
      if (msg.fileUrl != null && msg.fileType != null) {
        return msg.fileType!.startsWith('image') ||
            msg.fileType!.startsWith('application');
      }
      return false;
    }

    String fileText(String fileKey) {
      String fileName = fileKey.split('_').last;
      String shortName = fileName.length > 20
          ? fileName.substring(0, 20) + "..."
          : fileName;
      return shortName;
    }

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
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.picture_as_pdf, color: Colors.white, size: 30),
                const SizedBox(width: 8),
                Text(
                  fileText(msg.fileKey!),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        );
      }
      if (msg.text != null) {
        return Text(
          msg.text!,
          style: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 14,
            color: Colors.white,
          ),
        );
      }
      return const Text('no message');
    }

    return Align(
      alignment: Alignment.centerRight,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width - 50,
        ),
        child: IntrinsicWidth(
          child: Card(
            color: const Color(0xFF910811),
            child: Padding(
              padding: const EdgeInsets.only(left: 5, right: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: !isFileMessage(message)
                        ? const EdgeInsets.only(right: 70, left: 5, top: 5)
                        : const EdgeInsets.only(right: 5, left: 5, top: 5),
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
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 5),
                      buildStatusIcon(status),
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
