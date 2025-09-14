import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:mobile/features/chat/models/user_model.dart';

class AvatarGroup extends StatelessWidget {
  const AvatarGroup({super.key, required this.user});
  final UserModel user;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2, horizontal: 8),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Stack(
            children: [
              user.profilepic != null
                  ? CachedNetworkImage(
                      imageUrl: user.profilepic!,
                      imageBuilder: (context, imageProvider) => CircleAvatar(
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
                  : CircleAvatar(
                      radius: 21,
                      backgroundColor: Colors.blueGrey,
                      child: SvgPicture.asset(
                        'assets/svg_files/person.svg',
                        width: 40,
                      ),
                    ),
              Positioned(
                bottom: 0,
                right: 0,
                child: CircleAvatar(
                  radius: 11,
                  backgroundColor: Colors.grey,
                  child: Icon(Icons.clear, color: Colors.white, size: 13),
                ),
              ),
            ],
          ),
          Text(
            user.fullname,
            style: TextStyle(fontFamily: 'Inter', fontSize: 12),
          ),
        ],
      ),
    );
  }
}
