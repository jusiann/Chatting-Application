//http import etme
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/config.dart';
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'profile_controller.g.dart';

@riverpod
class ProfileController extends _$ProfileController {
  final _storage = FlutterSecureStorage();

  @override
  Future<void> build() async {
    // Initial setup if needed
  }

  Future<void> updateProfile(String newName, String newSurname) async {
    final token = ref.read(authControllerProvider.notifier).token;
    final response = await http.put(
      Uri.parse('$baseUrl/api/auth/change-name'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'name': newName, 'surname': newSurname}),
    );

    if (response.statusCode == 200) {
      Fluttertoast.showToast(
        msg: 'İsim başarıyla güncellendi',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
        backgroundColor: Colors.green,
        textColor: Colors.white,
        fontSize: 16.0,
      );
      final data = jsonDecode(response.body);
      await _storage.write(key: 'accessToken', value: data['accessToken']);
      await _storage.write(key: 'refreshToken', value: data['refreshToken']);
      ref.read(authControllerProvider.notifier).changeUser();
    } else {
      final data = jsonDecode(response.body);
      Fluttertoast.showToast(
        msg: data['message'] ?? 'Bir hata oluştu',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
        backgroundColor: Colors.red,
        textColor: Colors.white,
        fontSize: 16.0,
      );
    }
  }

  Future<void> updateTitle(String newTitle) async {
    final token = ref.read(authControllerProvider.notifier).token;
    final response = await http.put(
      Uri.parse('$baseUrl/api/auth/change-title'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'title': newTitle}),
    );

    if (response.statusCode == 200) {
      Fluttertoast.showToast(
        msg: 'Ünvan başarıyla güncellendi',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
        backgroundColor: Colors.green,
        textColor: Colors.white,
        fontSize: 16.0,
      );
      final data = jsonDecode(response.body);
      await _storage.write(key: 'accessToken', value: data['accessToken']);
      await _storage.write(key: 'refreshToken', value: data['refreshToken']);
      ref.read(authControllerProvider.notifier).changeUser();
    } else {
      final data = jsonDecode(response.body);
      Fluttertoast.showToast(
        msg: data['message'] ?? 'Bir hata oluştu',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
        backgroundColor: Colors.red,
        textColor: Colors.white,
        fontSize: 16.0,
      );
    }
  }

  Future<void> updateProfileImage() async {
    final picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
    );
    if (image != null) {
      final token = ref.read(authControllerProvider.notifier).token;
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/api/auth/upload-profile-image'),
      );
      request.headers['Authorization'] = 'Bearer $token';
      request.files.add(
        await http.MultipartFile.fromPath(
          'profile_image',
          image.path,
          contentType: MediaType('image', 'jpeg'),
        ),
      );
      final response = await request.send();
      final responseBody = await http.Response.fromStream(response);
      if (response.statusCode == 201) {
        Fluttertoast.showToast(
          msg: 'Profil resmi başarıyla güncellendi',
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
          backgroundColor: Colors.green,
          textColor: Colors.white,
          fontSize: 16.0,
        );
        final data = jsonDecode(responseBody.body);
        await _storage.write(key: 'accessToken', value: data['access_token']);
        await _storage.write(key: 'refreshToken', value: data['refresh_token']);
        ref.read(authControllerProvider.notifier).changeUser();
      } else {
        Fluttertoast.showToast(
          msg: 'Bir hata oluştu',
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
          backgroundColor: Colors.red,
          textColor: Colors.white,
          fontSize: 16.0,
        );
      }
    }
  }
}
