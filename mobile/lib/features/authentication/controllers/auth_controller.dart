import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:mobile/features/authentication/models/auth_user_model.dart';
import 'package:mobile/features/chat/controllers/message_controller.dart';
import 'package:mobile/features/chat/controllers/socket_service.dart';
import 'package:mobile/features/chat/controllers/unread_message_controller.dart';
import 'package:mobile/features/chat/controllers/user_service.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:http/http.dart' as http;
part 'auth_controller.g.dart';

class AuthState {
  final AuthUserModel? authUser;
  final bool isLoggedIn;
  final bool isChecking;
  AuthState({
    required this.isLoggedIn,
    this.authUser,
    required this.isChecking,
  });
}

@Riverpod(keepAlive: true)
class AuthController extends _$AuthController {
  final _storage = FlutterSecureStorage();
  Timer? _refreshTimer;

  @override
  AuthState build() {
    return AuthState(isLoggedIn: false, isChecking: true);
  }

  String? _token;
  String? get token => _token;

  Future<void> checkLoginStatus() async {
    _token ??= await _storage.read(key: 'accessToken');
    if (_token != null) {
      final remainingTime = JwtDecoder.getRemainingTime(_token!);
      final isStillValid = !JwtDecoder.isExpired(_token!);

      if (isStillValid && remainingTime > Duration(minutes: 1)) {
        final decoded = JwtDecoder.decode(_token!);
        final user = AuthUserModel.fromJwt(decoded);
        ref.read(socketServiceProvider.notifier).connect(_token!);
        _startTokenRefreshTimer(_token!);
        await markDeliveredMessages();
        await ref
            .read(unreadMessageControllerProvider.notifier)
            .fetchUnreadCounts(_token!);
        state = AuthState(isLoggedIn: true, authUser: user, isChecking: false);
        return;
      }
    }

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
        _token = accessToken;
        await _storage.write(key: 'refreshToken', value: refreshToken);
        final decodedToken = JwtDecoder.decode(accessToken);
        final user = AuthUserModel.fromJwt(decodedToken);
        await ref
            .read(unreadMessageControllerProvider.notifier)
            .fetchUnreadCounts(_token!);
        state = (AuthState(
          isLoggedIn: true,
          authUser: user,
          isChecking: false,
        ));
        ref.read(socketServiceProvider.notifier).connect(accessToken);
        _startTokenRefreshTimer(accessToken);
        await markDeliveredMessages();
        return;
      } else {}
    } else {
      state = AuthState(isLoggedIn: false, authUser: null, isChecking: false);
      return;
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
      _startTokenRefreshTimer(data['accessToken']);
      _token = data['accessToken'];
      await ref
          .read(unreadMessageControllerProvider.notifier)
          .fetchUnreadCounts(_token!);
      state = AuthState(isLoggedIn: true, authUser: user, isChecking: false);
      ref.read(socketServiceProvider.notifier).connect(data['accessToken']);
      await markDeliveredMessages();
    }
    if (response.statusCode != 200) {
      dynamic data = jsonDecode(response.body);
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
    _token = null;
    state = AuthState(isLoggedIn: false, isChecking: false, authUser: null);
    ref.invalidate(socketServiceProvider);
    ref.invalidate(messageControllerProvider);
    ref.invalidate(userServiceProvider);
    ref.invalidate(unreadMessageControllerProvider);
  }

  void _startTokenRefreshTimer(String token) {
    _refreshTimer?.cancel();

    final expiryDate = JwtDecoder.getExpirationDate(token);
    final now = DateTime.now();
    final refreshTime = expiryDate.difference(now) - Duration(minutes: 1);

    if (refreshTime.isNegative) {
      checkLoginStatus();
      return;
    }

    _refreshTimer = Timer(refreshTime, () async {
      await checkLoginStatus();
    });
  }

  Future<void> markDeliveredMessages() async {
    final uri = Uri.parse(
      'http://192.168.1.9:5001/api/messages/mark-delivered',
    );
    final response = await http.get(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_token',
      },
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
    }
  }
}
