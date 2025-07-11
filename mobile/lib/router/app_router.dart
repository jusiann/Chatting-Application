import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/authentication/views/login_view.dart';
import 'package:mobile/features/chat/views/home_view.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authControllerProvider);
  return GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(path: '/home', builder: (context, state) => HomeShell()),
      GoRoute(path: '/login', builder: (context, state) => LoginPage()),
    ],
    redirect: (context, state) {
      final isLoggedIn = auth.isLoggedIn;
      final isOnLoginPage = state.uri.toString() == '/login';
      if (!isLoggedIn && !isOnLoginPage) return '/login';
      if (isLoggedIn) return '/home';
      return null;
    },
  );
});
