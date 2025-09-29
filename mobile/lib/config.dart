import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Returns the base URL from .env or a default fallback.
/// This function is defensive: if `dotenv` hasn't been initialized
/// (for example the .env file failed to load), it returns the
/// hard-coded fallback to avoid throwing NotInitializedError.
String get baseUrl {
  const fallback = 'http://13.60.211.144';
  try {
    // `dotenv.isInitialized` guards access to `dotenv.env`.
    if (dotenv.isInitialized && dotenv.env.containsKey('BASE_URL')) {
      final v = dotenv.env['BASE_URL'];
      if (v != null && v.isNotEmpty) return v;
    }
  } catch (_) {
    // In rare cases reading dotenv may still throw; ignore and use fallback.
  }
  return fallback;
}

/// Async getter if you want to prefer persisted runtime override later.
Future<String> getBaseUrl() async {
  // You can extend this to read from SharedPreferences first.
  return baseUrl;
}
