import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:mobile/features/chat/views/photo_view.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';

void takePhoto(
  CameraController cameraController,
  BuildContext context,
  int senderId,
  int receiverId,
  bool isGroup,
) async {
  final path = join(
    (await getTemporaryDirectory()).path,
    '${DateTime.now().microsecondsSinceEpoch}.png',
  );
  final XFile picture = await cameraController.takePicture();
  await picture.saveTo(path);
  Navigator.push(
    context,
    MaterialPageRoute(
      builder: (builder) => PhotoView(
        path: path,
        senderId: senderId,
        receiverId: receiverId,
        isGroup: isGroup,
      ),
    ),
  );
}
