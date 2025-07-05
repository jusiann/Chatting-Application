import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/chat/controllers/providers.dart';
import 'package:mobile/features/chat/views/chat_view.dart';
import 'package:mobile/features/chat/views/contact_view.dart';

class HomeShell extends ConsumerWidget {
  const HomeShell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Sohbet',
          style: TextStyle(
            color: Color(0xFF910811),
            fontFamily: 'Inter',
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(onPressed: () {}, icon: Icon(Icons.search)),
          IconButton(onPressed: () {}, icon: Icon(Icons.menu)),
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
        children: const [ChatPage(), ContactPage()],
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
        ],
      ),
    );
  }
}
