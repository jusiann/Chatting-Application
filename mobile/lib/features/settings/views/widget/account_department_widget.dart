import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';

class AccountDepartmentWidget extends ConsumerStatefulWidget {
  const AccountDepartmentWidget({
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
  ConsumerState<AccountDepartmentWidget> createState() =>
      _AccountDepartmentWidgetState();
}

class _AccountDepartmentWidgetState
    extends ConsumerState<AccountDepartmentWidget> {
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
                    Icon(Icons.business, color: Color(0xFF910811)),
                    SizedBox(width: 30),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Departman',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF910811),
                          ),
                        ),
                        Text(
                          user.authUser!.department ?? 'Seçiniz',
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
              padding: const EdgeInsets.only(left: 30),
              child: Row(
                children: [
                  Text(
                    'Departman Seçiniz',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 14,
                      color: Color(0xFF910811),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Expanded(child: Container()),
                  DropdownButton<String>(
                    value: 'Bilgisayar',
                    items: <String>['Bilgisayar', 'İnşaat', 'Psikoloji']
                        .map<DropdownMenuItem<String>>((String value) {
                          return DropdownMenuItem<String>(
                            value: value,
                            child: Text(value),
                          );
                        })
                        .toList(),
                    onChanged: (String? newValue) {},
                  ),
                  IconButton(
                    icon: Icon(Icons.check, color: Color(0xFF910811)),
                    onPressed: () {
                      setState(() {
                        isEditing = false;
                      });
                      widget.function();
                    },
                  ),
                  SizedBox(width: 20),
                ],
              ),
            ),
    );
  }
}
