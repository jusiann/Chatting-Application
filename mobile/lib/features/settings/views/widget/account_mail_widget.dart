import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';

class AccountMailWidget extends ConsumerStatefulWidget {
  const AccountMailWidget({
    super.key,
    this.leadIcon = Icons.person,
    this.itemHeader = 'Ad',
    this.itemContent = 'name',
    this.function = _defaultFunction,
  });
  final IconData leadIcon;
  final String itemHeader;
  final String itemContent;
  final Function() function;

  static Future<void> _defaultFunction() async {
    print('Hello');
  }

  @override
  ConsumerState<AccountMailWidget> createState() => _AccountMailWidgetState();
}

class _AccountMailWidgetState extends ConsumerState<AccountMailWidget> {
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
                    Icon(Icons.mail, color: Color(0xFF910811)),
                    SizedBox(width: 30),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Mail',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF910811),
                          ),
                        ),
                        Text(
                          user.authUser!.email,
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
                  Icon(Icons.mail, color: Color(0xFF910811)),
                  SizedBox(width: 30),
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      decoration: InputDecoration(
                        hintText: user.authUser!.email,
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
                      await widget.function();
                    },
                    icon: Icon(Icons.send, color: Color(0xFF910811)),
                  ),
                ],
              ),
            ),
    );
  }
}
