import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/authentication/views/login_view.dart';
import 'package:mobile/features/authentication/views/splash_screen.dart';
import 'package:mobile/features/chat/views/home_view.dart';
import 'package:mobile/main.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authControllerProvider);
  return GoRouter(
    initialLocation: '/splash-screen',
    routes: [
      GoRoute(
        path: '/splash-screen',
        builder: (context, state) => SplashScreen(),
      ),
      GoRoute(path: '/home', builder: (context, state) => HomeShell()),
      GoRoute(path: '/login', builder: (context, state) => LoginPage()),
    ],
    observers: [routeObserver],
    redirect: (context, state) {
      final isLoggedIn = auth.isLoggedIn;
      final isChecking = auth.isChecking;
      final isOnLoginPage = state.uri.toString() == '/login';
      final isOnSplash = state.uri.toString() == '/splash-screen';

      if (isChecking) return null;
      if (!isLoggedIn && !isOnLoginPage) return '/login';
      if (isLoggedIn && (isOnLoginPage || isOnSplash)) return '/home';
      return null;
    },
  );
});
