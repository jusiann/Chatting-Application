import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/settings/controllers/profile_controller.dart';

class ProfileItemLastNameWidget extends ConsumerStatefulWidget {
  const ProfileItemLastNameWidget({super.key});

  @override
  ConsumerState<ProfileItemLastNameWidget> createState() =>
      _ProfileItemLastNameWidgetState();
}

class _ProfileItemLastNameWidgetState
    extends ConsumerState<ProfileItemLastNameWidget> {
  bool isEditing = false;
  final _controller = TextEditingController();
  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider);

    return PopScope(
      canPop: !isEditing,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && isEditing) {
          _controller.clear();
          setState(() {
            isEditing = false;
          });
        }
      },
      child: !isEditing
          ? InkWell(
              onTap: () {
                setState(() {
                  isEditing = true;
                });
              },
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 10, 0, 10),
                child: Row(
                  children: [
                    Icon(Icons.person, color: Color(0xFF910811)),
                    SizedBox(width: 30),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Soyad',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF910811),
                          ),
                        ),
                        Text(
                          user.authUser!.surname,
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 14,
                            color: Color(0xFF777777),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            )
          : Padding(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
              child: Row(
                children: [
                  Icon(Icons.person, color: Color(0xFF910811)),
                  SizedBox(width: 30),
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      decoration: InputDecoration(
                        hintText: user.authUser!.surname,
                        border: UnderlineInputBorder(
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () {
                      _controller.clear();
                      setState(() {
                        isEditing = false;
                      });
                    },
                    icon: Icon(Icons.cancel, color: Color(0xFF910811)),
                  ),
                  IconButton(
                    onPressed: () async {
                      await ref
                          .read(profileControllerProvider.notifier)
                          .updateProfile(user.authUser!.name, _controller.text);
                    },
                    icon: Icon(Icons.send, color: Color(0xFF910811)),
                  ),
                ],
              ),
            ),
    );
  }
}
