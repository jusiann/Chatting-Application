import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/chat/controllers/user_service.dart';
import 'package:mobile/features/chat/models/user_model.dart';
import 'package:mobile/features/chat/views/widgets/avatar_group_widget.dart';
import 'package:mobile/features/chat/views/widgets/contact_card_widget.dart';
import 'package:go_router/go_router.dart';

class GroupPage extends ConsumerStatefulWidget {
  const GroupPage({super.key});

  @override
  ConsumerState<GroupPage> createState() => _GroupPageState();
}

class _GroupPageState extends ConsumerState<GroupPage> {
  final List<UserModel> groupMember = [];
  @override
  Widget build(BuildContext context) {
    final List<UserModel> userList = ref.read(userServiceProvider).contactUsers;
    return PopScope(
      canPop: groupMember.isEmpty,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && groupMember.isNotEmpty) {
          setState(() {
            for (var user in groupMember) {
              user.selected = false;
            }
            groupMember.clear();
          });
        }
      },
      child: Scaffold(
        floatingActionButton: groupMember.isNotEmpty
            ? FloatingActionButton(
                backgroundColor: Color(0xFF910811),
                onPressed: () {
                  context.push('/create-group', extra: groupMember);
                },
                child: Icon(Icons.check, color: Colors.white),
              )
            : null,
        appBar: AppBar(
          backgroundColor: Color(0xFF910811),
          leading: IconButton(
            onPressed: () {
              if (groupMember.isNotEmpty) {
                setState(() {
                  for (var user in groupMember) {
                    user.selected = false;
                  }
                  groupMember.clear();
                });
              }
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
            groupMember.isNotEmpty
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
      ),
    );
  }
}
