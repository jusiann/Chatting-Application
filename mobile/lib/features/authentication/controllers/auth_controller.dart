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
import 'package:mobile/config.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
part 'auth_controller.g.dart';

class AuthState {
  final AuthUserModel? authUser;
  final bool isLoggedIn;
  final bool isChecking;
  final bool loggingIn;
  final bool registering;
  AuthState({
    required this.isLoggedIn,
    this.authUser,
    required this.isChecking,
    this.loggingIn = false,
    this.registering = false,
  });

  AuthState copyWith({
    AuthUserModel? authUser,
    bool? isLoggedIn,
    bool? isChecking,
    bool? loggingIn,
    bool? registering,
  }) {
    return AuthState(
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      authUser: authUser ?? this.authUser,
      isChecking: isChecking ?? this.isChecking,
      loggingIn: loggingIn ?? this.loggingIn,
      registering: registering ?? this.registering,
    );
  }
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
        await ref.read(socketServiceProvider.notifier).connect(_token!);
        // Proaktif: İlk açılışta listeleri/grupları yükle (socket onConnect beklemeden)
        await ref.read(userServiceProvider.notifier).fetchUsers();
        await _startTokenRefreshTimer(_token!);
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
        Uri.parse('$baseUrl/api/auth/refresh-token'),
        headers: {
          'Authorization': 'Bearer $refreshToken',
          'Content-Type': 'application/json',
        },
      );
      if (response.statusCode == 200) {
        final accessToken = jsonDecode(response.body)['access_token'];
        await _storage.write(key: 'accessToken', value: accessToken);
        _token = accessToken;
        final decodedToken = JwtDecoder.decode(accessToken);
        final user = AuthUserModel.fromJwt(decodedToken);
        // Proaktif: İlk açılışta listeleri/grupları yükle (socket onConnect beklemeden)
        await ref.read(userServiceProvider.notifier).fetchUsers();
        await ref
            .read(unreadMessageControllerProvider.notifier)
            .fetchUnreadCounts(_token!);
        state = (AuthState(
          isLoggedIn: true,
          authUser: user,
          isChecking: false,
        ));
        await ref.read(socketServiceProvider.notifier).connect(accessToken);
        await _startTokenRefreshTimer(accessToken);
        await markDeliveredMessages();
        return;
      } else {
        state = AuthState(isLoggedIn: false, authUser: null, isChecking: false);
        return;
      }
    } else {
      state = AuthState(isLoggedIn: false, authUser: null, isChecking: false);
      return;
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(loggingIn: true);
    await Future.delayed(Duration(seconds: 1));
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/sign-in'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (response.statusCode == 201) {
      Fluttertoast.showToast(
        msg: 'Giriş Başarılı.',
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.BOTTOM,
        backgroundColor: Colors.green,
        textColor: Colors.white,
        fontSize: 16.0,
      );
      final data = jsonDecode(response.body);
      await _storage.write(key: 'accessToken', value: data['access_token']);
      await _storage.write(key: 'refreshToken', value: data['refresh_token']);
      final decoded = JwtDecoder.decode(data['access_token']);
      final user = AuthUserModel.fromJwt(decoded);
      await _startTokenRefreshTimer(data['access_token']);
      _token = data['access_token'];
      // Proaktif: İlk açılışta listeleri/grupları yükle (socket onConnect beklemeden)
      await ref.read(userServiceProvider.notifier).fetchUsers();
      await ref
          .read(unreadMessageControllerProvider.notifier)
          .fetchUnreadCounts(_token!);
      await ref
          .read(socketServiceProvider.notifier)
          .connect(data['access_token']);
      await markDeliveredMessages();
      state = AuthState(
        isLoggedIn: true,
        authUser: user,
        isChecking: false,
        loggingIn: false,
      );
      await registerFcmToken();
    }
    if (response.statusCode != 201) {
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
      state = state.copyWith(loggingIn: false);
    }
    state = state.copyWith(loggingIn: false);
  }

  Future<void> logout() async {
    await http.post(
      Uri.parse('$baseUrl/api/auth/logout'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'userId': state.authUser?.id}),
    );
    await _storage.deleteAll();
    _token = null;
    state = AuthState(isLoggedIn: false, isChecking: false, authUser: null);
    ref.invalidate(socketServiceProvider);
    ref.invalidate(messageControllerProvider);
    ref.invalidate(userServiceProvider);
    ref.invalidate(unreadMessageControllerProvider);
  }

  Future<void> changeUser() async {
    _token = await _storage.read(key: 'accessToken');
    final decoded = JwtDecoder.decode(_token!);
    final user = AuthUserModel.fromJwt(decoded);
    ref.read(socketServiceProvider.notifier).connect(_token!);
    await _startTokenRefreshTimer(_token!);
    state = AuthState(isLoggedIn: true, authUser: user, isChecking: false);
    return;
  }

  Future<void> _startTokenRefreshTimer(String token) async {
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
    final uri = Uri.parse('$baseUrl/api/messages/mark-delivered');
    await http.get(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_token',
      },
    );
  }

  Future<void> signupUser({
    String? firstName,
    String? lastName,
    String? email,
    String? password,
    String? title,
    String? department,
  }) async {
    if (firstName == null ||
        lastName == null ||
        email == null ||
        password == null) {
    } else {
      state = state.copyWith(registering: true);
      await Future.delayed(Duration(seconds: 1));
      final url = Uri.parse('$baseUrl/api/auth/sign-up');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'first_name': firstName,
          'last_name': lastName,
          'email': email,
          'password': password,
          'title': title,
          'department': department,
        }),
      );

      if (response.statusCode == 201) {
        state = state.copyWith(registering: false);
        Fluttertoast.showToast(
          msg: 'Kayıt başarılı',
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.BOTTOM,
          backgroundColor: Colors.green,
          textColor: Colors.white,
          fontSize: 16.0,
        );
      } else {
        state = state.copyWith(registering: false);
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
      state = state.copyWith(registering: false);
    }
    state = state.copyWith(registering: false);
  }
  
  
  Future<void> registerFcmToken() async {
    final fcm = FirebaseMessaging.instance;

    // Token al
    String? token = await fcm.getToken();
    if (token != null) {
      print("FCM Token: $token");

      // Backend'e gönder
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/fcm-token'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token', // opsiyonel, auth varsa
        },
        body: jsonEncode({'userId': state.authUser!.id, 'fcmToken': token}),
      );

      if (response.statusCode == 200) {
        print('Token backend’e kaydedildi.');
      } else {
        print('Token kaydedilirken hata: ${response.body}');
      }
    }
  }
}
