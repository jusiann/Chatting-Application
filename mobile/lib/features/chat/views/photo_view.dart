import 'dart:io';

import 'package:flutter/material.dart';

class PhotoView extends StatelessWidget {
  const PhotoView({super.key, required this.path});
  final String path;
  @override
  Widget build(BuildContext context) {
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
                onPressed: () {},
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
