import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/svg.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/chat/controllers/custom_card_controller.dart';
import 'package:mobile/features/chat/controllers/message_controller.dart';
import 'package:mobile/features/chat/controllers/providers.dart';
import 'package:mobile/features/chat/controllers/socket_service.dart';
import 'package:mobile/features/chat/controllers/unread_message_controller.dart';
import 'package:mobile/features/chat/models/chat_model.dart';
import 'package:mobile/features/chat/views/camera_view.dart';
import 'package:mobile/features/chat/views/widgets/emoji_select_widget.dart';
import 'package:mobile/features/chat/views/widgets/received_message_widget.dart';
import 'package:mobile/features/chat/views/widgets/send_message_widget.dart';
// ignore: library_prefixes
import 'package:socket_io_client/socket_io_client.dart' as IO;

class IndividualPage extends ConsumerStatefulWidget {
  const IndividualPage({super.key, required this.chat});
  final ChatModel chat;

  @override
  ConsumerState<IndividualPage> createState() => _IndividualPageState();
}

class _IndividualPageState extends ConsumerState<IndividualPage>
    with WidgetsBindingObserver {
  bool _showemoji = false;
  final _controller = TextEditingController();
  IO.Socket? socket;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref
          .read(messageControllerProvider.notifier)
          .fetchMore(widget.chat.id);
      final currentUserId = ref.read(authControllerProvider).authUser!.id;
      final messages = ref
          .watch(messageControllerProvider.notifier)
          .forChat(widget.chat.id, currentUserId);
      final unreadIds = messages
          .where((m) => m.senderid == widget.chat.id && m.status != 'read')
          .map((m) => m.id)
          .toList();
      if (unreadIds.isNotEmpty) {
        ref.read(socketServiceProvider.notifier).emit('message_read', {
          'ids': unreadIds,
          'readerId': currentUserId,
        });
      }
      ref
          .read(unreadMessageControllerProvider.notifier)
          .clearUnread(widget.chat.id);

      ref.read(openChatIdProvider.notifier).state = widget.chat.id;
    });

    _scrollController.addListener(() async {
      if (_scrollController.position.pixels <=
          _scrollController.position.minScrollExtent + 100) {
        await ref
            .read(messageControllerProvider.notifier)
            .fetchMore(widget.chat.id);
        final currentUserId = ref.read(authControllerProvider).authUser!.id;
        final messages = ref
            .watch(messageControllerProvider.notifier)
            .forChat(widget.chat.id, currentUserId);
        final unreadIds = messages
            .where((m) => m.senderid == widget.chat.id && m.status != 'read')
            .map((m) => m.id)
            .toList();
        if (unreadIds.isNotEmpty) {
          ref.read(socketServiceProvider.notifier).emit('message_read', {
            'ids': unreadIds,
            'readerId': currentUserId,
          });
        }
      }
    });

    super.initState();
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
    final currentUserId = ref.watch(authControllerProvider).authUser!.id;
    final messages = ref.watch(messageControllerProvider);
    return PopScope(
      canPop: !_showemoji,
      onPopInvokedWithResult: (didPop, result) {
        if (_showemoji) {
          setState(() {
            _showemoji = false;
          });
          return;
        }
        ref.read(openChatIdProvider.notifier).state = null;
        if (!didPop) Navigator.of(context).pop(result);
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
                  '${widget.chat.title ?? ''} ${widget.chat.fullname}',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.white,
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Son görülme: ',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      formatMessageTime(widget.chat.time),
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: Colors.white,
                      ),
                    ),
                  ],
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
                  widget.chat.isGroup
                      ? 'assets/svg_files/group.svg'
                      : 'assets/svg_files/person.svg',
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
                    final reversedIndex = messages.length - 1 - index;
                    final message = messages[reversedIndex];
                    if (message.senderid == widget.chat.id) {
                      return ReceivedMessageWidget(message: message);
                    } else {
                      return SendMessageWidget(message: message);
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
                                        onPressed: () {},
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
                                                  CameraView(),
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
                              if (_controller.text.isNotEmpty) {
                                final msg = {
                                  'content': _controller.text,
                                  'time': DateTime.now().toIso8601String(),
                                  'sender_id': currentUserId,
                                  'receiver_id': widget.chat.id,
                                };
                                ref
                                    .read(socketServiceProvider.notifier)
                                    .emit('message', msg);
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
