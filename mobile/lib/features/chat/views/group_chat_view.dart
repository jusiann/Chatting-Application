import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/svg.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/chat/controllers/group_controller.dart';
import 'package:mobile/features/chat/controllers/providers.dart';
import 'package:mobile/features/chat/controllers/send_file_controller.dart';
import 'package:mobile/features/chat/controllers/socket_service.dart';
import 'package:mobile/features/chat/controllers/unread_group_messages.dart';
import 'package:mobile/features/chat/models/group_model.dart';
import 'package:mobile/features/chat/views/camera_view.dart';
import 'package:mobile/features/chat/views/widgets/emoji_select_widget.dart';
import 'package:mobile/features/chat/views/widgets/group_message_received.dart';
import 'package:mobile/features/chat/views/widgets/group_message_sended.dart';

class GroupChatView extends ConsumerStatefulWidget {
  final GroupModel group;

  const GroupChatView({super.key, required this.group});

  @override
  ConsumerState<GroupChatView> createState() => _GroupChatViewState();
}

class _GroupChatViewState extends ConsumerState<GroupChatView>
    with WidgetsBindingObserver {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _showemoji = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref
          .read(groupMessageControllerProvider.notifier)
          .fetchGroupMessages(widget.group.id);

      ref
          .read(openChatControllerProvider.notifier)
          .setOpenChat(widget.group.id, 'group');

      ref.read(socketServiceProvider.notifier).emit('group_read', {
        'groupId': widget.group.id,
      });

      ref
          .read(unreadGroupMessagesProvider.notifier)
          .clearUnread(widget.group.id);

      // Gruba katıl
      /* ref
          .read(socketServiceProvider.notifier)
          .emit('join_group', widget.group.id); */
    });
    _scrollController.addListener(() async {
      if (_scrollController.position.pixels <=
          _scrollController.position.minScrollExtent + 100) {
        /* await ref
            .read(groupMessageControllerProvider.notifier)
            .fetchGroupMessages(widget.group.id, 1, 20); */
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeMetrics() {
    super.didChangeMetrics();
    Future.delayed(Duration(milliseconds: 200), () {
      if (mounted) {
        _scrollController.animateTo(
          0,
          duration: Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final sendFileController = SendFileController(ref);
    final currentUser = ref.watch(authControllerProvider).authUser!;
    final allMessages = ref.watch(groupMessageControllerProvider);
    final messages =
        allMessages.where((msg) => msg.groupId == widget.group.id).toList()
          ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

    return PopScope(
      canPop: !_showemoji,
      onPopInvokedWithResult: (didPop, result) {
        if (_showemoji) {
          setState(() {
            _showemoji = false;
          });
          return;
        }
        ref.read(openChatControllerProvider.notifier).clearOpenChat();
        if (!didPop) {
          Navigator.of(context).pop(result);
        }
      },

      child: Scaffold(
        resizeToAvoidBottomInset: true,
        backgroundColor: Colors.white,
        appBar: AppBar(
          leading: IconButton(
            icon: Icon(Icons.arrow_back_ios_new, color: Colors.white),
            onPressed: () {
              Navigator.pop(context);
            },
          ),
          title: InkWell(
            onTap: () {},
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  widget.group.name,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          actions: [
            InkWell(
              onTap: () {},
              child: CircleAvatar(
                radius: 25,
                backgroundColor: Colors.blueGrey,
                child: SvgPicture.asset(
                  'assets/svg_files/groups.svg',
                  height: 40,
                ),
              ),
            ),
            SizedBox(width: 15),
          ],
          backgroundColor: Color(0xFF910811),
          actionsPadding: EdgeInsets.only(left: 10),
          bottom: PreferredSize(
            preferredSize: Size.fromHeight(5),
            child: SizedBox(),
          ),
        ),
        body: Container(
          decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage('assets/images/chat_background.png'),
              fit: BoxFit.cover,
            ),
          ),
          child: Column(
            children: [
              Expanded(
                child: ListView.builder(
                  reverse: true,
                  controller: _scrollController,
                  padding: EdgeInsets.only(bottom: 10),
                  keyboardDismissBehavior:
                      ScrollViewKeyboardDismissBehavior.onDrag,
                  itemBuilder: (context, index) {
                    final message = messages[index];
                    if (message.senderId != currentUser.id) {
                      return GroupMessageReceived(message: message);
                    } else {
                      return GroupMessageSended(message: message);
                    }
                  },
                  itemCount: messages.length,
                ),
              ),
              Align(
                alignment: Alignment.bottomCenter,
                child: Container(
                  padding: EdgeInsets.fromLTRB(5, 5, 5, 5),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Card(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadiusGeometry.circular(15),
                              ),
                              child: TextFormField(
                                onTap: () {
                                  setState(() {
                                    _showemoji = false;
                                  });
                                },
                                controller: _controller,
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 16,
                                ),
                                textAlignVertical: TextAlignVertical.center,
                                keyboardType: TextInputType.multiline,
                                maxLines: 5,
                                minLines: 1,
                                decoration: InputDecoration(
                                  border: InputBorder.none,
                                  hintText: 'Mesaj yazın.',
                                  contentPadding: EdgeInsets.only(left: 20),
                                  prefixIcon: IconButton(
                                    onPressed: () {
                                      setState(() {
                                        FocusScope.of(context).unfocus();
                                        _showemoji = !_showemoji;
                                      });
                                    },
                                    icon: Icon(
                                      Icons.emoji_emotions,
                                      color: Color(0xFF910811),
                                    ),
                                  ),
                                  suffixIcon: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      IconButton(
                                        onPressed: () {
                                          sendFileController.sendFileMessage(
                                            ref
                                                .read(authControllerProvider)
                                                .authUser!
                                                .id,
                                            widget.group.id,
                                            true,
                                          );
                                        },
                                        icon: Icon(
                                          Icons.attach_file,
                                          color: Color(0xFF910811),
                                        ),
                                      ),
                                      IconButton(
                                        onPressed: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (builder) =>
                                                  CameraView(
                                                senderId: ref
                                                    .read(
                                                      authControllerProvider,
                                                    )
                                                    .authUser!
                                                    .id,
                                                receiverId: widget.group.id,
                                                isGroup: true,
                                              ),
                                            ),
                                          );
                                        },
                                        icon: Icon(
                                          Icons.photo_camera,
                                          color: Color(0xFF910811),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                          IconButton(
                            onPressed: () async {
                              if (_controller.text.trim().isNotEmpty) {
                                final msg = {
                                  'content': _controller.text,
                                  'groupId': widget.group.id,
                                };
                                ref
                                    .read(socketServiceProvider.notifier)
                                    .emit('group_message', msg);
                                _controller.clear();
                                _scrollController.animateTo(
                                  0,
                                  duration: Duration(milliseconds: 300),
                                  curve: Curves.easeOut,
                                );
                              }
                            },
                            icon: Transform.rotate(
                              angle: 3.14 * 3 / 2,
                              child: CircleAvatar(
                                radius: 24,
                                backgroundColor: Colors.white,
                                child: Icon(
                                  Icons.send,
                                  color: Color(0xFF910811),
                                  size: 28,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              if (_showemoji)
                SizedBox(
                  height: 300,
                  child: EmojiSelectWidget(controller: _controller),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
