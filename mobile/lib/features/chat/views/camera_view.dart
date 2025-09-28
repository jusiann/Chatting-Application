import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:mobile/features/chat/controllers/take_photo.dart';
import 'package:mobile/features/chat/views/video_view.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';

List<CameraDescription> cameras = [];

class CameraView extends StatefulWidget {
  const CameraView({
    super.key,
    required this.senderId,
    required this.receiverId,
    required this.isGroup,
  });
  final int senderId;
  final int receiverId;
  final bool isGroup;

  @override
  State<CameraView> createState() => _CameraViewState();
}

class _CameraViewState extends State<CameraView> {
  CameraController? _cameraController;
  Future<void>? cameraValue;
  bool isRecording = false;
  bool isCameraFront = false;
  bool flash = false;

  @override
  void initState() {
    super.initState();
    if (cameras.isNotEmpty) {
      _cameraController = CameraController(cameras[0], ResolutionPreset.high);
    }
    if (_cameraController != null) {
      cameraValue = _cameraController?.initialize();
    }
  }

  @override
  void dispose() {
    // TODO: implement dispose
    super.dispose();
    if (_cameraController != null) {
      _cameraController!.dispose();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Expanded(
            child: SizedBox(
              width: double.infinity,
              child: FutureBuilder(
                future: cameraValue,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.done &&
                      _cameraController != null) {
                    return CameraPreview(_cameraController!);
                  } else {
                    return Center(child: CircularProgressIndicator());
                  }
                },
              ),
            ),
          ),
          Container(
            color: Colors.black,
            width: double.infinity,
            padding: EdgeInsets.only(top: 5, bottom: 5),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  onPressed: () {
                    setState(() {
                      !flash
                          ? _cameraController!.setFlashMode(FlashMode.torch)
                          : _cameraController!.setFlashMode(FlashMode.off);
                      flash = !flash;
                    });
                  },
                  icon: Icon(
                    !flash ? Icons.flash_off : Icons.flash_on,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                Column(
                  children: [
                    GestureDetector(
                      onTap: () {
                        if (!isRecording) {
                          if (_cameraController != null) {
                            takePhoto(
                              _cameraController!,
                              context,
                              widget.senderId,
                              widget.receiverId,
                              widget.isGroup,
                            );
                          }
                        }
                      },
                      onLongPress: () async {
                        if (_cameraController != null) {
                          await _cameraController!.startVideoRecording();
                        }
                        setState(() {
                          isRecording = true;
                        });
                      },
                      onLongPressUp: () async {
                        setState(() {
                          isRecording = false;
                        });
                        if (_cameraController != null) {
                          final path = join(
                            (await getTemporaryDirectory()).path,
                            '${DateTime.now().millisecondsSinceEpoch}.mp4',
                          );
                          final XFile video = await _cameraController!
                              .stopVideoRecording();
                          await video.saveTo(path);
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => VideoView(path: path),
                            ),
                          );
                        }
                      },
                      child: !isRecording
                          ? Icon(
                              Icons.panorama_fish_eye,
                              color: Colors.white,
                              size: 70,
                            )
                          : Icon(
                              Icons.radio_button_on,
                              color: Colors.red,
                              size: 80,
                            ),
                    ),
                    Text(
                      'Video için basılı tutun.',
                      style: TextStyle(
                        color: Colors.white,
                        fontFamily: 'Inter',
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () {
                    setState(() {
                      if (!isCameraFront) {
                        _cameraController = CameraController(
                          cameras[1],
                          ResolutionPreset.high,
                        );
                        cameraValue = _cameraController!.initialize();
                        isCameraFront = true;
                      } else {
                        _cameraController = CameraController(
                          cameras[0],
                          ResolutionPreset.high,
                        );
                        cameraValue = _cameraController!.initialize();
                        isCameraFront = false;
                      }
                    });
                  },
                  icon: Icon(
                    Icons.flip_camera_ios,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
