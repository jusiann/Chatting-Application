import 'dart:io';
import 'dart:convert';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:http/http.dart' as http;
import 'package:mime/mime.dart';
import 'package:mobile/config.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/chat/controllers/socket_service.dart';

class SendFileController {
  final WidgetRef ref;
  SendFileController(this.ref);

  Future<void> sendFileMessage(int senderId, int receiverId, bool isGroup) async {
  try {
    final token = ref.read(authControllerProvider.notifier).token;
    // 1. Dosya seç
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
    );
    if (result == null) {
      return;
    }

    if (result != null) {
      final file = result.files.single;
      int sizeInBytes = file.size; // byte cinsinden
      double sizeInMb = sizeInBytes / (1024 * 1024);

      if (sizeInMb > 5) {
        Fluttertoast.showToast(
        msg: 'Dosya çok büyük (max 5 MB)!',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
        backgroundColor: Colors.red,
        textColor: Colors.white,
        fontSize: 16.0,);
        return;
      }
    }

    String filePath = result.files.single.path!;
    String fileName = result.files.single.name;
    String? fileType = lookupMimeType(filePath) ?? "application/octet-stream";


    // 2. Backend’den pre-signed URL al
    final presignRes = await http.post(
      Uri.parse("$baseUrl/api/messages/upload-url"),
      headers: {"Content-Type": "application/json",'Authorization': 'Bearer $token',},
      body: jsonEncode({"fileName": fileName, "fileType": fileType}),
    );

    if (presignRes.statusCode != 200) {
      Fluttertoast.showToast(
        msg: 'Dosya gönderimi başarısız.',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
        backgroundColor: Colors.red,
        textColor: Colors.white,
        fontSize: 16.0,
      );
      throw Exception("Pre-signed URL alınamadı: ${presignRes.body}");
    }

    final presignData = jsonDecode(presignRes.body);
    String uploadUrl = presignData["uploadUrl"];
    String fileKey = presignData["fileKey"];

    // 3. Dosyayı S3’e yükle
    final file = File(filePath);
    final bytes = await file.readAsBytes();

    final uploadRes = await http.put(
      Uri.parse(uploadUrl),
      body: bytes,
      headers: {"Content-Type": fileType},
    );

    if (uploadRes.statusCode != 200) {
      Fluttertoast.showToast(
        msg: 's3 upload başarısız',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
        backgroundColor: Colors.red,
        textColor: Colors.white,
        fontSize: 16.0,
      );
      throw Exception("S3 upload başarısız: ${uploadRes.statusCode}");
    }

    Fluttertoast.showToast(
        msg: 'Dosya başarıyla yüklendi.',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
        backgroundColor: Colors.green,
        textColor: Colors.white,
        fontSize: 16.0,
      );
    print("S3'e başarıyla yüklendi: $fileKey");

    //mesajı socket ile gönder.
    if(!isGroup){
      ref.read(socketServiceProvider.notifier).emit('file_message', {
      "senderId": senderId,
      "receiverId": receiverId,
      "fileKey": fileKey,
      "fileType": fileType,
    });
    }
    if(isGroup){
      ref.read(socketServiceProvider.notifier).emit('group_file_message', {
      "senderId": senderId,
      "groupId": receiverId,
      "fileKey": fileKey,
      "fileType": fileType,
      });
    }
    

  } catch (e) {
    print("Hata: $e");
  }
}

Future<void> sendPhoto(int senderId, int receiverId, bool isGroup, String path) async {
  try {
    final token = ref.read(authControllerProvider.notifier).token;
    final file = File(path);
    final fileSize = await file.length(); // byte cinsinden
    double sizeInMb = fileSize / (1024 * 1024);
      if (sizeInMb > 5) {
        Fluttertoast.showToast(
        msg: 'Dosya çok büyük (max 5 MB)!',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
        backgroundColor: Colors.red,
        textColor: Colors.white,
        fontSize: 16.0,);
        return;
      }
    String fileName = file.path.split('/').last;
    String? fileType = lookupMimeType(file.path) ?? "image/jpeg"; // default

    final presignRes = await http.post(
        Uri.parse("$baseUrl/api/messages/upload-url"),
        headers: {"Content-Type": "application/json",'Authorization': 'Bearer $token',},
        body: jsonEncode({"fileName": fileName, "fileType": fileType}),
      );

      if (presignRes.statusCode != 200) {
        Fluttertoast.showToast(
          msg: 'Dosya gönderimi başarısız.',
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
          backgroundColor: Colors.red,
          textColor: Colors.white,
          fontSize: 16.0,
        );
        throw Exception("Pre-signed URL alınamadı: ${presignRes.body}");
      }

      final presignData = jsonDecode(presignRes.body);
      String uploadUrl = presignData["uploadUrl"];
      String fileKey = presignData["fileKey"];

      // 3. Dosyayı S3’e yükle
      final bytes = await file.readAsBytes();

      final uploadRes = await http.put(
        Uri.parse(uploadUrl),
        body: bytes,
        headers: {"Content-Type": fileType},
      );

      if (uploadRes.statusCode != 200) {
        Fluttertoast.showToast(
          msg: 's3 upload başarısız',
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
          backgroundColor: Colors.red,
          textColor: Colors.white,
          fontSize: 16.0,
        );
        throw Exception("S3 upload başarısız: ${uploadRes.statusCode}");
      }

      Fluttertoast.showToast(
          msg: 'Fotoğraf gönderildi.',
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
          backgroundColor: Colors.green,
          textColor: Colors.white,
          fontSize: 16.0,
        );

      if(!isGroup){
        ref.read(socketServiceProvider.notifier).emit('file_message', {
        "senderId": senderId,
        "receiverId": receiverId,
        "fileKey": fileKey,
        "fileType": fileType,
      });
      }
      if(isGroup){
        ref.read(socketServiceProvider.notifier).emit('group_file_message', {
        "senderId": senderId,
        "groupId": receiverId,
        "fileKey": fileKey,
        "fileType": fileType,
        });
      }
    }
    catch (err){
      print(err);
    }
  }
}


