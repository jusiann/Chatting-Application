import 'package:flutter/material.dart';
import 'package:mobile/features/chat/models/user_model.dart';
import 'package:mobile/features/chat/views/widgets/contact_card_widget.dart';
import 'package:mobile/features/chat/views/widgets/department_card_widget.dart';
import 'package:mobile/features/chat/views/widgets/group_card_widget.dart';

class ContactPage extends StatelessWidget {
  ContactPage({super.key});
  final List<UserModel> users = [
    UserModel(
      name: 'Taner Çevik',
      status: 'Prof. Dr.',
      department: 'Bilgisayar Mühendisliği Bölüm Başkanı',
    ),
    UserModel(
      name: 'Emre Tanrıverdi',
      status: 'Doç. Dr.',
      department: 'Elektrik-Elektronik Mühendisliği',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: users.length + 2,
      itemBuilder: (context, index) {
        if (index == 0) {
          return GroupCard();
        } else if (index == 1) {
          return DepartmentCard();
        }
        return ContactCard(user: users[index - 2]);
      },
    );
  }
}
