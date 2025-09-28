import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:mobile/features/chat/models/user_model.dart';

class ContactCard extends StatelessWidget {
  const ContactCard({super.key, required this.user});
  final UserModel user;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: SizedBox(
        height: 60,
        width: 55,
        child: Stack(
          children: [
            CircleAvatar(
              radius: 25,
              backgroundColor: Colors.blueGrey,
              child: user.profilepic != null
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
                  : SvgPicture.asset('assets/svg_files/person.svg', width: 40),
            ),
            Positioned(
              bottom: 4,
              right: 5,
              child: user.selected
                  ? CircleAvatar(
                      radius: 13,
                      backgroundColor: Color(0xFF910811),
                      child: Icon(Icons.check, color: Colors.white),
                    )
                  : Container(),
            ),
          ],
        ),
      ),
      title: Text(
        user.title != null ? '${user.title} ${user.fullname}' : user.fullname,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: Text(
        user.department ?? 'bilinmiyor',
        style: TextStyle(
          fontFamily: 'Inter',
          fontSize: 12,
          color: Color(0xFF910811),
        ),
      ),
    );
  }
}
