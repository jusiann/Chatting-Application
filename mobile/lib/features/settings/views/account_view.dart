import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/settings/views/widget/account_department_widget.dart';
import 'package:mobile/features/settings/views/widget/account_mail_widget.dart';
import 'package:mobile/features/settings/views/widget/account_password_widget.dart';

class AccountView extends ConsumerStatefulWidget {
  const AccountView({super.key});

  @override
  ConsumerState<AccountView> createState() => _AccountViewState();
}

class _AccountViewState extends ConsumerState<AccountView> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Hesap',
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Color(0xFF910811),
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Hesap Bilgileri',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 20),
              AccountDepartmentWidget(),
              SizedBox(height: 20),
              AccountMailWidget(),
              SizedBox(height: 20),
              AccountPasswordWidget(),
            ],
          ),
        ),
      ),
    );
  }
}
