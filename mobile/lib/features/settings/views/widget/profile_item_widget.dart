import 'package:flutter/material.dart';

class ProfileItemWidget extends StatefulWidget {
  const ProfileItemWidget({
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
  State<ProfileItemWidget> createState() => _ProfileItemWidgetState();
}

class _ProfileItemWidgetState extends State<ProfileItemWidget> {
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
                    Icon(widget.leadIcon, color: Color(0xFF910811)),
                    SizedBox(width: 30),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.itemHeader,
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF910811),
                          ),
                        ),
                        Text(
                          widget.itemContent,
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
                  Icon(widget.leadIcon, color: Color(0xFF910811)),
                  SizedBox(width: 30),
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      decoration: InputDecoration(
                        hintText: widget.itemContent,
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
