import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/settings/views/widget/profile_card_widget.dart';
import 'package:mobile/features/settings/views/widget/settings_item_widget.dart';

class SettingsView extends ConsumerWidget {
  const SettingsView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SingleChildScrollView(
      child: Padding(
        padding: EdgeInsets.only(top: 20),
        child: Column(
          children: [
            ProfileCardWidget(),
            SizedBox(height: 30),
            InkWell(
              onTap: () {
                context.push('/account');
              },
              child: SettingsItemWidget(
                leadIcon: Icons.key,
                itemHeader: 'Hesap',
                itemContent: 'Güvenlik bildirimleri, Hesap bilgileri',
              ),
            ),
            SizedBox(height: 30),
            SettingsItemWidget(
              leadIcon: Icons.lock,
              itemHeader: 'Gizlilik',
              itemContent: 'Hesap gizliliği',
            ),
            SizedBox(height: 30),
            SettingsItemWidget(
              leadIcon: Icons.notifications,
              itemHeader: 'Bildirimler',
              itemContent: 'Mesaj, grup ve arama sesleri',
            ),
            SizedBox(height: 30),
            SettingsItemWidget(
              leadIcon: Icons.language_sharp,
              itemHeader: 'Uygulama Dili',
              itemContent: 'Türkçe (cihaz dili)',
            ),
            SizedBox(height: 30),
            SettingsItemWidget(
              leadIcon: Icons.help,
              itemHeader: 'Yardım',
              itemContent: 'Yardım merkezi, bize ulaşın',
            ),
            SizedBox(height: 30),
            InkWell(
              onTap: () => ref.read(authControllerProvider.notifier).logout(),
              child: SettingsItemWidget(
                leadIcon: Icons.logout,
                itemHeader: 'Çıkış',
                itemContent: 'Çıkış yapmak için basınız.',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
