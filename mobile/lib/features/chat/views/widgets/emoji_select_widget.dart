import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:flutter/material.dart';

class EmojiSelectWidget extends StatelessWidget {
  const EmojiSelectWidget({super.key, required this.controller});
  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    return EmojiPicker(
      onEmojiSelected: (cat, emoji) {
        controller.text += emoji.emoji;
        controller.selection = TextSelection.fromPosition(
          TextPosition(offset: controller.text.length),
        );
      },
      config: Config(
        height: 260,
        emojiViewConfig: EmojiViewConfig(columns: 8, emojiSizeMax: 24),
      ),
    );
  }
}
