import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/svg.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';
import 'package:mobile/features/chat/controllers/custom_card_controller.dart';
import 'package:mobile/features/chat/controllers/message_controller.dart';
import 'package:mobile/features/chat/controllers/providers.dart';
import 'package:mobile/features/chat/controllers/send_file_controller.dart';
import 'package:mobile/features/chat/controllers/socket_service.dart';
import 'package:mobile/features/chat/controllers/unread_message_controller.dart';
import 'package:mobile/features/chat/controllers/user_service.dart';
import 'package:mobile/features/chat/models/chat_model.dart';
import 'package:mobile/features/chat/models/user_model.dart';
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
  Timer? _typingDebounce;
  Timer? _typingClearTimer;

  @override
  void initState() {
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref
          .read(messageControllerProvider.notifier)
          .fetchInitial(widget.chat.id);
      final currentUserId = ref.read(authControllerProvider).authUser!.id;
      ref.read(socketServiceProvider.notifier).emit('mark_read', {
        'receiver_id': currentUserId,
        'sender_id': widget.chat.id,
      });

      ref.read(socketServiceProvider.notifier).emit('join_chat', {
        'userId': currentUserId,
        'chatWith': widget.chat.id,
      });

      ref
          .read(unreadMessageControllerProvider.notifier)
          .clearUnread(widget.chat.id);

      ref
          .read(openChatControllerProvider.notifier)
          .setOpenChat(widget.chat.id, 'individual');
    });

    _scrollController.addListener(() async {
      final pos = _scrollController.position;
      // For reverse: true, scrolling "up" increases pixels toward maxScrollExtent
      if (pos.pixels >= (pos.maxScrollExtent - 100) &&
          pos.maxScrollExtent > 0) {
        await ref
            .read(messageControllerProvider.notifier)
            .fetchMore(widget.chat.id);
      }
    });

    super.initState();
  }

  @override
  void dispose() {
    final socket = ref.read(socketServiceProvider.notifier);
    _typingDebounce?.cancel();
    _typingClearTimer?.cancel();
    _scrollController.dispose();
    WidgetsBinding.instance.removeObserver(this);
    socket.emit('leave_chat', {});
    super.dispose();
  }

  @override
  void didChangeMetrics() {
    super.didChangeMetrics();
    Future.delayed(const Duration(milliseconds: 200), () {
      if (mounted) {
        _scrollController.animateTo(
          0,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final sendFileController = SendFileController(ref);
    final typingUser = ref
        .watch(userServiceProvider)
        .contactUsers
        .where((user) => user.id == widget.chat.id)
        .first;

    final currentUserId = ref.watch(authControllerProvider).authUser!.id;
    final allMessages = ref.watch(messageControllerProvider);
    final UserModel messagingUser = ref
        .watch(userServiceProvider)
        .contactUsers
        .firstWhere((user) => user.id == widget.chat.id);
    final messages = allMessages
        .where(
          (m) =>
              (m.senderid == widget.chat.id && m.receiverid == currentUserId) ||
              (m.senderid == currentUserId && m.receiverid == widget.chat.id),
        )
        .toList();
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
        if (!didPop) Navigator.of(context).pop(result);
      },

      child: Scaffold(
        resizeToAvoidBottomInset: true,
        backgroundColor: Colors.white,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
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
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.white,
                  ),
                ),
                typingUser.typing!
                    ? const Align(
                        alignment: Alignment.center,
                        child: Text(
                          'Yazıyor...',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 12,
                            color: Colors.white,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'Son görülme: ',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 12,
                              color: Colors.white,
                            ),
                          ),
                          messagingUser.isOnline
                              ? const Text(
                                  'Çevrimiçi',
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 12,
                                    color: Colors.white,
                                  ),
                                )
                              : messagingUser.lastSeen != null
                              ? Text(
                                  formatMessageTime(messagingUser.lastSeen!),
                                  style: const TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 12,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text(
                                  'Bilinmiyor.',
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
                child: widget.chat.profilepic != null
                    ? CachedNetworkImage(
                        imageUrl: widget.chat.profilepic!,
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
                    : SvgPicture.asset(
                        'assets/svg_files/person.svg',
                        width: 40,
                      ),
              ),
            ),
            SizedBox(width: 15),
          ],
          backgroundColor: Color(0xFF910811),
          actionsPadding: EdgeInsets.only(left: 10),
          bottom: const PreferredSize(
            preferredSize: Size.fromHeight(5),
            child: SizedBox(),
          ),
        ),
        body: Container(
          decoration: const BoxDecoration(
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
                  padding: const EdgeInsets.only(bottom: 10),
                  keyboardDismissBehavior:
                      ScrollViewKeyboardDismissBehavior.onDrag,
                  itemBuilder: (context, index) {
                    final reversedIndex = messages.length - 1 - index;
                    if (messages[reversedIndex].senderid == widget.chat.id) {
                      return ReceivedMessageWidget(
                        key: ValueKey(messages[reversedIndex].id),
                        message: messages[reversedIndex],
                      );
                    } else {
                      return SendMessageWidget(
                        message: messages[reversedIndex],
                      );
                    }
                  },
                  itemCount: messages.length,
                ),
              ),
              Align(
                alignment: Alignment.bottomCenter,
                child: Container(
                  padding: const EdgeInsets.fromLTRB(5, 5, 5, 5),
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
                                onChanged: (val) {
                                  // Emit typing and debounce stop
                                  ref.read(socketServiceProvider.notifier).emit(
                                    'typing',
                                    {'receiver_id': widget.chat.id},
                                  );
                                  _typingDebounce?.cancel();
                                  _typingDebounce = Timer(
                                    const Duration(seconds: 2),
                                    () {
                                      ref
                                          .read(socketServiceProvider.notifier)
                                          .emit('stop_typing', {
                                            'receiver_id': widget.chat.id,
                                          });
                                    },
                                  );
                                },
                                style: const TextStyle(
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
                                    icon: const Icon(
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
                                            widget.chat.id,
                                            false,
                                          );
                                        },
                                        icon: const Icon(
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
                                                receiverId: widget.chat.id,
                                                isGroup: false,
                                              ),
                                            ),
                                          );
                                        },
                                        icon: const Icon(
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
                                  'receiver_id': widget.chat.id,
                                };
                                ref
                                    .read(socketServiceProvider.notifier)
                                    .emit('send_message', msg);
                                _controller.clear();
                                // stop typing when message is sent
                                ref.read(socketServiceProvider.notifier).emit(
                                  'stop_typing',
                                  {'receiver_id': widget.chat.id},
                                );
                                _scrollController.animateTo(
                                  0,
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeOut,
                                );
                              }
                            },
                            icon: Transform.rotate(
                              angle: 3.14 * 3 / 2,
                              child: const CircleAvatar(
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
