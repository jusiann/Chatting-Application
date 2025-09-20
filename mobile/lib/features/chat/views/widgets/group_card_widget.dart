import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class GroupCard extends StatelessWidget {
  const GroupCard({super.key});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        context.push('/group/page');
      },
      child: ListTile(
        leading: CircleAvatar(
          radius: 25,
          backgroundColor: Color(0xFF910811),
          child: Icon(Icons.group, size: 35, color: Colors.white),
        ),
        title: Text(
          'Grup oluştur',
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
