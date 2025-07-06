import 'package:flutter/material.dart';
import 'package:mobile/features/chat/models/user_model.dart';
import 'package:mobile/features/chat/views/widgets/avatar_group_widget.dart';
import 'package:mobile/features/chat/views/widgets/contact_card_widget.dart';

class GroupPage extends StatefulWidget {
  GroupPage({super.key});

  @override
  State<GroupPage> createState() => _GroupPageState();
}

class _GroupPageState extends State<GroupPage> {
  final List<UserModel> groupMember = [];
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
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Color(0xFF910811),
        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },
          icon: Icon(Icons.arrow_back_ios_new, color: Colors.white),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Yeni grup',
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: Colors.white,
              ),
            ),
            Text(
              'katılımcı ekle.',
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          groupMember.length > 0
              ? Container(
                  height: 75,
                  color: Colors.white,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: groupMember.length,
                    itemBuilder: (context, index) {
                      return InkWell(
                        onTap: () {
                          setState(() {
                            groupMember[index].selected = false;
                            groupMember.remove(groupMember[index]);
                          });
                        },
                        child: AvatarGroup(user: groupMember[index]),
                      );
                    },
                  ),
                )
              : Container(),
          Divider(thickness: 1),
          Expanded(
            child: ListView.builder(
              itemCount: users.length,
              itemBuilder: (context, index) {
                return InkWell(
                  onTap: () {
                    setState(() {
                      if (!users[index].selected) {
                        users[index].selected = true;
                        groupMember.add(users[index]);
                      } else {
                        users[index].selected = false;
                        groupMember.remove(users[index]);
                      }
                    });
                  },
                  child: ContactCard(user: users[index]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
