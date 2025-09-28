import 'package:flutter/material.dart';

class FullScreenImage extends StatelessWidget {
  final String url;

  const FullScreenImage({super.key, required this.url});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTap: () => Navigator.pop(context),
        child: Center(
          child: InteractiveViewer(
            // pinch zoom + kaydırma
            child: Image.network(url),
          ),
        ),
      ),
    );
  }
}
