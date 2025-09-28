import 'package:riverpod_annotation/riverpod_annotation.dart';
part 'providers.g.dart';

class OpenChats {
  final int id;
  final String type;

  OpenChats({required this.id, required this.type});
}

class HomeShell {
  final int navbarId;

  HomeShell({required this.navbarId});
}

@Riverpod(keepAlive: true)
class OpenChatController extends _$OpenChatController {
  @override
  OpenChats build() => OpenChats(id: -1, type: '');

  void setOpenChat(int id, String type) {
    state = OpenChats(id: id, type: type);
  }

  void clearOpenChat() {
    state = OpenChats(id: -1, type: '');
  }
}

@Riverpod(keepAlive: true)
class HomeShellController extends _$HomeShellController {
  @override
  HomeShell build() => HomeShell(navbarId: 0);

  void setNavbarId(int id) {
    state = HomeShell(navbarId: id);
  }
}
