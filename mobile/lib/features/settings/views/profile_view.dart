import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/svg.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/settings/controllers/profile_controller.dart';
import 'package:mobile/features/settings/views/widget/profile_item_lastname.dart';
import 'package:mobile/features/settings/views/widget/profile_item_name.dart';
import 'package:mobile/features/settings/views/widget/profile_item_status.dart';

class ProfileView extends ConsumerWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider);
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Profil',
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Color(0xFF910811),
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(height: 30),
            GestureDetector(
              onTap: () async {
                await ref
                    .read(profileControllerProvider.notifier)
                    .updateProfileImage();
              },
              child: CircleAvatar(
                radius: 60,
                backgroundColor: Colors.blueGrey,
                child: user.authUser!.profilepic != null
                    ? CachedNetworkImage(
                        imageUrl: user.authUser!.profilepic!,
                        imageBuilder: (context, imageProvider) => CircleAvatar(
                          radius: 60,
                          backgroundImage: imageProvider,
                        ),
                        placeholder: (context, url) => CircleAvatar(
                          radius: 60,
                          backgroundColor: Colors.grey.shade200,
                          child: SvgPicture.asset(
                            'assets/svg_files/person.svg',
                            height: 100,
                          ),
                        ),
                      )
                    : SvgPicture.asset(
                        'assets/svg_files/person.svg',
                        width: 100,
                      ),
              ),
            ),
            SizedBox(height: 30),
            Text(
              'Profil resmini değiştirmek için üzerine tıklayın',
              style: TextStyle(fontFamily: 'Inter', fontSize: 12),
            ),
            SizedBox(height: 15),
            ProfileItemNameWidget(),
            SizedBox(height: 15),
            ProfileItemLastNameWidget(),
            SizedBox(height: 15),
            ProfileItemTitleWidget(),
          ],
        ),
      ),
    );
  }
}
