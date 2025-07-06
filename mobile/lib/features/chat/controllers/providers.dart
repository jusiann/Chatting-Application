import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/chat/controllers/home_state.dart';

final homeShellProvider = ChangeNotifierProvider<HomeState>((ref) {
  return HomeState(navBarIndex: 0);
});

/*final navBarIndex = StateProvider<int>((ref) {
  return 0;
});      Kullanılabilir.*/
