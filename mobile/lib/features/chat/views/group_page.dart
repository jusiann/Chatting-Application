import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/chat/controllers/user_service.dart';
import 'package:mobile/features/chat/models/user_model.dart';
import 'package:mobile/features/chat/views/widgets/avatar_group_widget.dart';
import 'package:mobile/features/chat/views/widgets/contact_card_widget.dart';

class GroupPage extends ConsumerStatefulWidget {
  GroupPage({super.key});

  @override
  ConsumerState<GroupPage> createState() => _GroupPageState();
}

class _GroupPageState extends ConsumerState<GroupPage> {
  final List<UserModel> groupMember = [];
  /*
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
  */
  @override
  Widget build(BuildContext context) {
    final List<UserModel> userList = ref.read(userServiceProvider).contactUsers;
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
              itemCount: userList.length,
              itemBuilder: (context, index) {
                return InkWell(
                  onTap: () {
                    setState(() {
                      if (!userList[index].selected) {
                        userList[index].selected = true;
                        groupMember.add(userList[index]);
                      } else {
                        userList[index].selected = false;
                        groupMember.remove(userList[index]);
                      }
                    });
                  },
                  child: ContactCard(user: userList[index]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
