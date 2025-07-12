import 'package:intl/intl.dart';

String formatMessageTime(String time) {
  final dateTime = DateTime.parse(time);
  final now = DateTime.now();
  final difference = now.difference(dateTime);

  if (difference.inDays == 0) {
    return DateFormat.Hm().format(dateTime);
  } else if (difference.inDays == 1) {
    return "Dün ${DateFormat.Hm().format(dateTime)}";
  } else if (difference.inDays < 7) {
    final weekDay = DateFormat.EEEE('tr_TR').format(dateTime);
    return "$weekDay ${DateFormat.Hm().format(dateTime)}";
  } else {
    return DateFormat('dd.MM.yyyy HH:mm').format(dateTime);
  }
}
