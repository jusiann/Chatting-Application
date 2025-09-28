import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/chat/controllers/providers.dart';
import 'package:mobile/features/chat/views/chat_view.dart';
import 'package:mobile/features/chat/views/contact_view.dart';
import 'package:mobile/features/settings/views/settings_view.dart';

class HomeShell extends ConsumerStatefulWidget {
  const HomeShell({super.key});

  @override
  ConsumerState<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends ConsumerState<HomeShell> {
  final Map<int, String> pageName = {0: 'Sohbet', 1: 'Rehber', 2: 'Ayarlar'};

  late final PageController _pageController;

  @override
  void initState() {
    super.initState();
    final initialIndex = ref.read(homeShellControllerProvider).navbarId;
    _pageController = PageController(initialPage: initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(homeShellControllerProvider, (prev, next) {
      final idx = next.navbarId;
      if (_pageController.hasClients &&
          (_pageController.page?.round() ?? _pageController.initialPage) !=
              idx) {
        _pageController.animateToPage(
          idx,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOutCubic,
        );
      }
    });

    return PopScope(
      canPop: ref.read(homeShellControllerProvider).navbarId == 0,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && ref.read(homeShellControllerProvider).navbarId != 0) {
          ref.read(homeShellControllerProvider.notifier).setNavbarId(0);
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            pageName[ref.watch(homeShellControllerProvider).navbarId] ?? 'Hata',
            style: TextStyle(
              color: Color(0xFF910811),
              fontFamily: 'Inter',
              fontWeight: FontWeight.w600,
            ),
          ),
          actions: [
            IconButton(onPressed: () {}, icon: Icon(Icons.search)),
            PopupMenuButton<String>(
              icon: Icon(Icons.menu),
              onSelected: (value) {
                if (value == 'cikis') {
                  ref.read(authControllerProvider.notifier).logout();
                }
              },
              itemBuilder: (context) => <PopupMenuEntry<String>>[
                PopupMenuItem<String>(value: 'cikis', child: Text('Çıkış')),
              ],
            ),
          ],
          bottom: PreferredSize(
            preferredSize: Size.fromHeight(1),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
              child: Divider(height: 1, thickness: 1.5, color: Colors.black),
            ),
          ),
        ),
        body: PageView(
          controller: _pageController,
          physics: const PageScrollPhysics(),
          onPageChanged: (value) =>
              ref.read(homeShellControllerProvider.notifier).setNavbarId(value),
          children: [ChatPage(), ContactPage(), SettingsView()],
        ),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: ref.watch(homeShellControllerProvider).navbarId,
          onTap: (i) => _pageController.animateToPage(
            i,
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeOutCubic,
          ),
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          elevation: 8,
          selectedItemColor: Color(0xFF910811),
          unselectedItemColor: Colors.grey,
          selectedIconTheme: const IconThemeData(size: 28),
          unselectedIconTheme: const IconThemeData(size: 22),
          selectedLabelStyle: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
          unselectedLabelStyle: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
          showUnselectedLabels: true,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Sohbetler'),
            BottomNavigationBarItem(
              icon: Icon(Icons.contact_emergency),
              label: 'Rehber',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.settings),
              label: 'Ayarlar',
            ),
          ],
        ),
      ),
    );
  }
}
