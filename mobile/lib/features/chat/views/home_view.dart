import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/chat/controllers/providers.dart';
import 'package:mobile/features/chat/views/chat_view.dart';
import 'package:mobile/features/chat/views/contact_view.dart';
import 'package:mobile/features/settings/views/settings_view.dart';

class HomeShell extends ConsumerStatefulWidget {
  HomeShell({super.key});

  @override
  ConsumerState<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends ConsumerState<HomeShell> {
  final Map<int, String> pageName = {0: 'Sohbet', 1: 'Rehber', 2: 'Ayarlar'};

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: ref.read(homeShellProvider).navBarIndex == 0,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && ref.read(homeShellProvider).navBarIndex != 0) {
          ref.read(homeShellProvider).setIndex(0);
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            pageName[ref.watch(homeShellProvider).navBarIndex] ?? 'Hata',
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
        body: IndexedStack(
          index: ref.watch(homeShellProvider).navBarIndex,
          children: [ChatPage(), ContactPage(), SettingsView()],
        ),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: ref.watch(homeShellProvider).navBarIndex,
          onTap: (i) => ref.read(homeShellProvider).setIndex(i),
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
