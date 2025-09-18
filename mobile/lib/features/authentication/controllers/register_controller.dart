import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/config.dart';
import 'package:fluttertoast/fluttertoast.dart';

class RegisterController {
  static Future<void> signupUser({
    String? firstName,
    String? lastName,
    String? email,
    String? password,
  }) async {
    if (firstName == null ||
        lastName == null ||
        email == null ||
        password == null) {
      print('tüm alanların doldurulması zorunludur.');
    } else {
      final url = Uri.parse('$baseUrl/api/auth/sign-up');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'first_name': firstName,
          'last_name': lastName,
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 201) {
        Fluttertoast.showToast(
          msg: 'Kayıt başarılı',
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
          backgroundColor: Colors.green,
          textColor: Colors.white,
          fontSize: 16.0,
        );
      } else {
        String message = 'bir hata oluştu';
        try {
          final data = jsonDecode(response.body);
          if (data is Map && data['message'] != null) {
            message = data['message'].toString();
          }
        } catch (e) {
          message = 'sunucu hatası ${response.body}';
        }
        Fluttertoast.showToast(
          msg: message,
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
