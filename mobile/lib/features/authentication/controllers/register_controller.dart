import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:fluttertoast/fluttertoast.dart';

class RegisterController {
  static Future<void> signupUser({
    String? name,
    String? surname,
    String? email,
    String? password,
  }) async {
    if (name == null || surname == null || email == null || password == null) {
      print('tüm alanların doldurulması zorunludur.');
    } else {
      final url = Uri.parse('http://192.168.1.9:5001/api/auth/signup');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'surname': surname,
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 201) {
        Fluttertoast.showToast(
          msg: 'Kayıt başarılı',
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
          backgroundColor: Colors.red,
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
        Fluttertoast.showToast(msg: message);
      }
    }
  }
}
