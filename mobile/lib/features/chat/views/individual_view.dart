import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:mobile/features/chat/models/chat_model.dart';
import 'package:mobile/features/chat/views/widgets/emoji_select_widget.dart';

class IndividualPage extends StatefulWidget {
  const IndividualPage({super.key, required this.chat});
  final ChatModel chat;

  @override
  State<IndividualPage> createState() => _IndividualPageState();
}

class _IndividualPageState extends State<IndividualPage> {
  bool _showemoji = false;
  final _controller = TextEditingController();
  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_showemoji,
      onPopInvokedWithResult: (didPop, result) {
        if (_showemoji) {
          setState(() {
            _showemoji = false;
          });
          return;
        }
        if (!didPop) Navigator.of(context).pop(result);
      },

      child: Scaffold(
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
            child: Container(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    widget.chat.name,
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
                        widget.chat.time,
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
          child: Column(
            children: [
              Expanded(child: ListView()),
              Align(
                alignment: Alignment.bottomCenter,
                child: Container(
                  color: const Color(0xFFE6EAEF),
                  padding: EdgeInsets.fromLTRB(10, 10, 10, 10),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.only(
                                left: 10,
                                right: 10,
                              ),
                              child: Card(
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadiusGeometry.circular(
                                    15,
                                  ),
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
                                    suffixIcon: IconButton(
                                      onPressed: () {},
                                      icon: Icon(
                                        Icons.attach_file,
                                        color: Color(0xFF910811),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          IconButton(
                            onPressed: () {},
                            icon: Transform.rotate(
                              angle: -45,
                              child: Icon(
                                Icons.send,
                                color: Color(0xFF910811),
                                size: 25,
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
