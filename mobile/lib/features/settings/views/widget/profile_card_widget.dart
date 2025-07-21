import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';

class ProfileCardWidget extends ConsumerWidget {
  const ProfileCardWidget({super.key, this.status = 'Durum Bildirimi'});
  final String status;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider);
    return InkWell(
      onTap: () => context.push('/profile'),
      child: Padding(
        padding: const EdgeInsets.only(left: 20, right: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 25,
                  backgroundColor: Colors.blueGrey,
                  child: user.authUser!.profilepic != null
                      ? CachedNetworkImage(
                          imageUrl: user.authUser!.profilepic!,
                          imageBuilder: (context, imageProvider) =>
                              CircleAvatar(
                                radius: 25,
                                backgroundImage: imageProvider,
                              ),
                          placeholder: (context, url) => CircleAvatar(
                            radius: 25,
                            backgroundColor: Colors.grey.shade200,
                            child: SvgPicture.asset(
                              'assets/svg_files/person.svg',
                              height: 40,
                            ),
                          ),
                        )
                      : SvgPicture.asset(
                          'assets/svg_files/person.svg',
                          width: 40,
                        ),
                ),
                SizedBox(width: 15),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user.authUser!.fullname,
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF910811),
                      ),
                    ),
                    Text(
                      status,
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
            Divider(thickness: 2),
          ],
        ),
      ),
    );
  }
}
