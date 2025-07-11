import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:mobile/features/authentication/models/auth_user_model.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:http/http.dart' as http;
part 'auth_controller.g.dart';

class AuthState {
  final AuthUserModel? authUser;
  final bool isLoggedIn;
  AuthState({required this.isLoggedIn, this.authUser});
}

@riverpod
class AuthController extends _$AuthController {
  final _storage = FlutterSecureStorage();

  @override
  AuthState build() {
    checkLoginStatus();
    return AuthState(isLoggedIn: false);
  }

  Future<void> checkLoginStatus() async {
    final token = await _storage.read(key: 'accessToken');
    if (token != null && !JwtDecoder.isExpired(token)) {
      final decoded = JwtDecoder.decode(token);
      final user = AuthUserModel.fromJwt(decoded);
      state = AuthState(isLoggedIn: true, authUser: user);
    } else {
      final refreshToken = await _storage.read(key: 'refreshToken');
      if (refreshToken != null) {
        final response = await http.post(
          Uri.parse('http://192.168.1.9:5001/api/auth/refresh'),
          headers: {
            'Authorization': 'Bearer $refreshToken',
            'Content-Type': 'application/json',
          },
        );
        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          final accessToken = data['accessToken'];
          final refreshToken = data['refreshToken'];
          await _storage.write(key: 'accessToken', value: accessToken);
          await _storage.write(key: 'refreshToken', value: refreshToken);
          final decodedToken = JwtDecoder.decode(accessToken);
          final user = AuthUserModel.fromJwt(decodedToken);
          state = (AuthState(isLoggedIn: true, authUser: user));
        } else {}
      } else {
        state = AuthState(isLoggedIn: false, authUser: null);
      }
    }
  }

  Future<void> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('http://192.168.1.9:5001/api/auth/signin'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (response.statusCode == 200) {
      Fluttertoast.showToast(
        msg: 'Giriş Başarılı.',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
        backgroundColor: Colors.green,
        textColor: Colors.white,
        fontSize: 16.0,
      );
      final data = jsonDecode(response.body);
      await _storage.write(key: 'accessToken', value: data['accessToken']);
      await _storage.write(key: 'refreshToken', value: data['refreshToken']);
      final decoded = JwtDecoder.decode(data['accessToken']);
      final user = AuthUserModel.fromJwt(decoded);
      state = AuthState(isLoggedIn: true, authUser: user);
    }
    if (response.statusCode != 200) {
      dynamic? data = jsonDecode(response.body);
      String message = data['message'] ?? 'bir hata olustu';

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

  Future<void> logout() async {
    await _storage.deleteAll();
    state = AuthState(isLoggedIn: false);
  }
}
