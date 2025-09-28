import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AccountPasswordWidget extends ConsumerStatefulWidget {
  const AccountPasswordWidget({
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
  ConsumerState<AccountPasswordWidget> createState() =>
      _AccountPasswordWidgetState();
}

class _AccountPasswordWidgetState extends ConsumerState<AccountPasswordWidget> {
  bool isEditing = false;
  final _controller = TextEditingController();
  @override
  Widget build(BuildContext context) {
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
          ? Padding(
              padding: const EdgeInsets.fromLTRB(20, 10, 0, 10),
              child: Row(
                children: [
                  Icon(Icons.lock, color: Color(0xFF910811)),
                  SizedBox(width: 30),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Şifre',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF910811),
                        ),
                      ),
                      Text(
                        '********',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 14,
                          color: Color(0xFF777777),
                        ),
                      ),
                    ],
                  ),
                  Expanded(child: SizedBox()),
                  TextButton(
                    onPressed: () {
                      setState(() {
                        isEditing = true;
                      });
                    },
                    child: Text(
                      'Değiştir',
                      style: TextStyle(color: Color(0xFF910811)),
                    ),
                  ),
                ],
              ),
            )
          : Padding(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
              child: Column(
                children: [
                  Row(
                    children: [
                      Icon(Icons.lock, color: Color(0xFF910811)),
                      SizedBox(width: 30),
                      Expanded(
                        child: TextField(
                          obscureText: true,
                          controller: _controller,
                          decoration: InputDecoration(
                            hintText: 'Eski şifrenizi giriniz',
                            border: UnderlineInputBorder(
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 20),
                  Row(
                    children: [
                      Icon(Icons.lock, color: Color(0xFF910811)),
                      SizedBox(width: 30),
                      Expanded(
                        child: TextField(
                          obscureText: true,
                          controller: _controller,
                          decoration: InputDecoration(
                            hintText: 'Yeni şifrenizi giriniz',
                            border: UnderlineInputBorder(
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 20),
                  Row(
                    children: [
                      Icon(Icons.lock, color: Color(0xFF910811)),
                      SizedBox(width: 30),
                      Expanded(
                        child: TextField(
                          obscureText: true,
                          controller: _controller,
                          decoration: InputDecoration(
                            hintText: 'Yeni şifrenizi tekrar giriniz',
                            border: UnderlineInputBorder(
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 20),
                  Align(
                    alignment: Alignment.centerRight,
                    child: ElevatedButton(
                      onPressed: () {
                        widget.function();
                        setState(() {
                          isEditing = false;
                        });
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xFF910811),
                        padding: EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 10,
                        ),
                      ),
                      child: Text(
                        'Kaydet',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
