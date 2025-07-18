import 'package:flutter/material.dart';

class DepartmentCard extends StatelessWidget {
  const DepartmentCard({super.key});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {},
      child: Column(
        children: [
          ListTile(
            leading: CircleAvatar(
              radius: 25,
              backgroundColor: Color(0xFF910811),
              child: Icon(Icons.apartment, size: 35, color: Colors.white),
            ),
            title: Text(
              'Departman mesajı',
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 80, right: 20),
            child: Divider(thickness: 1, color: Color(0xFF910811)),
          ),
        ],
      ),
    );
  }
}
