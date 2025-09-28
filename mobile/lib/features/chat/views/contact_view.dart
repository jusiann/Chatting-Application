import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/chat/controllers/user_service.dart';
import 'package:mobile/features/chat/models/chat_model.dart';
import 'package:mobile/features/chat/views/individual_view.dart';
import 'package:mobile/features/chat/views/widgets/contact_card_widget.dart';
import 'package:mobile/features/chat/views/widgets/department_card_widget.dart';
import 'package:mobile/features/chat/views/widgets/group_card_widget.dart';
import 'package:mobile/main.dart';

class ContactPage extends ConsumerStatefulWidget {
  const ContactPage({super.key});

  @override
  ConsumerState<ContactPage> createState() => _ContactPageState();
}

class _ContactPageState extends ConsumerState<ContactPage> with RouteAware {
  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      if (ref.read(userServiceProvider).contactUsers.isEmpty) {
        await ref.read(userServiceProvider.notifier).fetchUsers();
      }
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    routeObserver.subscribe(this, ModalRoute.of(context)! as PageRoute);
  }

  @override
  void dispose() {
    routeObserver.unsubscribe(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final userState = ref.watch(userServiceProvider);
    if (userState.fetchingUsers) {
      return Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(userServiceProvider.notifier).fetchUsers();
      },
      child: ListView.builder(
        itemCount: userState.contactUsers.length + 2,
        itemBuilder: (context, index) {
          if (index == 0) {
            return GroupCard();
          } else if (index == 1) {
            return DepartmentCard();
          }
          return InkWell(
            onTap: () {
              ChatModel chat = ChatModel.fromUser(
                userState.contactUsers[index - 2],
              );
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => IndividualPage(chat: chat),
                ),
              );
            },
            child: ContactCard(user: userState.contactUsers[index - 2]),
          );
        },
      ),
    );
  }
}
