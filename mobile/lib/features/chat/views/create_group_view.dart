import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/svg.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/chat/controllers/group_controller.dart';
import 'package:mobile/features/chat/controllers/providers.dart';
import 'package:mobile/features/chat/models/user_model.dart';
import 'package:mobile/features/chat/views/widgets/create_group_card.dart';

class CreateGroupView extends ConsumerWidget {
  const CreateGroupView({super.key, required this.groupMembers});
  final List<UserModel> groupMembers;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final descController = TextEditingController();
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        backgroundColor: Color(0xFF910811),
        onPressed: () async {
          final router = GoRouter.of(context);
          final List<int> memberIds = groupMembers
              .map((user) => user.id)
              .toList();
          final String name = nameController.text.trim().isNotEmpty
              ? nameController.text
              : 'Yeni grup';
          final String? description = descController.text.trim().isNotEmpty
              ? descController.text
              : null;
          final bool success = await ref
              .read(groupControllerProvider.notifier)
              .createGroup(
                name: name,
                description: description,
                memberIds: memberIds,
              );
          if (success) {
            for (var member in groupMembers) {
              member.selected = false;
            }
            Fluttertoast.showToast(
              msg: 'Grup başarıyla oluşturuldu',
              toastLength: Toast.LENGTH_SHORT,
              gravity: ToastGravity.BOTTOM,
              backgroundColor: Colors.green,
              textColor: Colors.white,
              fontSize: 16.0,
            );
            ref.read(homeShellControllerProvider.notifier).setNavbarId(0);
            router.go('/home');
          } else {
            Fluttertoast.showToast(
              msg: 'Hata: Grup oluşturulamadı.',
              toastLength: Toast.LENGTH_SHORT,
              gravity: ToastGravity.BOTTOM,
              backgroundColor: Colors.green,
              textColor: Colors.red,
              fontSize: 16.0,
            );
          }
        },
        child: Icon(Icons.check, color: Colors.white),
      ),
      appBar: AppBar(
        title: Text(
          'Yeni grup',
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: Colors.white,
          ),
        ),
        backgroundColor: Color(0xFF910811),
      ),
      body: SingleChildScrollView(
        child: Container(
          padding: EdgeInsets.all(20),
          width: double.infinity,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 60,
                backgroundColor: Colors.blueGrey,
                child: SvgPicture.asset(
                  'assets/svg_files/person.svg',
                  width: 100,
                ),
              ),
              SizedBox(height: 20),
              Container(
                width: double.infinity,
                padding: EdgeInsets.only(left: 20, right: 20),
                child: TextField(
                  controller: nameController,
                  decoration: InputDecoration(
                    hintText: 'Grup Adı',
                    border: OutlineInputBorder(),
                    focusedBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: Color(0xFF910811)),
                    ),
                  ),
                ),
              ),
              SizedBox(height: 20),
              Container(
                width: double.infinity,
                padding: EdgeInsets.only(left: 20, right: 20),
                child: TextField(
                  controller: descController,
                  decoration: InputDecoration(
                    hintText: 'Grup Açıklaması',
                    border: OutlineInputBorder(),
                    focusedBorder: OutlineInputBorder(
                      borderSide: BorderSide(color: Color(0xFF910811)),
                    ),
                  ),
                ),
              ),
              SizedBox(height: 20),
              Text('Grup Üyeleri'),
              Divider(thickness: 1),
              Wrap(
                spacing: 1,
                runSpacing: 10,
                children: groupMembers.map((user) {
                  return SizedBox(
                    width: 90, // Set a fixed width for each card
                    child: CreateGroupCard(user: user),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
