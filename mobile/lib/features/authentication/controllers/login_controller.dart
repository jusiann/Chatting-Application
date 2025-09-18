import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/config.dart';

class AuthService {
  final storage = FlutterSecureStorage();

  Future<void> loginUser(String email, String password) async {
    final url = Uri.parse('$baseUrl/api/auth/login');
    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email, "password": password}),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final token = data['token'];

      await storage.write(key: 'jwt', value: token);
      print('Login başarılı token kaydedildi.');
    } else {
      final data = jsonDecode(response.body);
      print('giriş başarısız. ${data['message']}');
    }
  }

  Future<String?> getToken() async {
    return storage.read(key: 'jwt');
  }
}
