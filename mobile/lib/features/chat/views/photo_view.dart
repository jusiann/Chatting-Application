import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/chat/controllers/send_file_controller.dart';

class PhotoView extends ConsumerWidget {
  const PhotoView({
    super.key,
    required this.path,
    required this.senderId,
    required this.receiverId,
    required this.isGroup,
  });
  final String path;
  final int senderId;
  final int receiverId;
  final bool isGroup;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sendFileController = SendFileController(ref);
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.black,
        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },
          icon: Icon(Icons.arrow_back_ios_new, color: Colors.white),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SizedBox(
              width: double.infinity,
              child: Image.file(File(path), fit: BoxFit.cover),
            ),
          ),
          Container(
            color: Colors.black,
            padding: EdgeInsets.only(top: 5, bottom: 5, right: 20),
            width: double.infinity,
            child: Align(
              alignment: Alignment(1, 0),
              child: IconButton(
                onPressed: () async {
                  await sendFileController.sendPhoto(
                    senderId,
                    receiverId,
                    isGroup,
                    path,
                  );
                  int count = 0;
                  Navigator.popUntil(context, (route) {
                    return count++ == 2;
                  });
                },
                icon: CircleAvatar(
                  backgroundColor: Color(0xFF910811),
                  radius: 25,
                  child: Icon(Icons.check, color: Colors.white, size: 35),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
