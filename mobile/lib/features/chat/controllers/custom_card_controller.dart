import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

String formatMessageTime(DateTime dateTime) {
  final now = DateTime.now();
  final difference = now.difference(dateTime);

  if (difference.inDays == 0) {
    print(dateTime);
    return DateFormat.Hm().format(dateTime);
  } else if (difference.inDays == 1) {
    return "Dün";
  } else if (difference.inDays < 7) {
    final weekDay = DateFormat.EEEE('tr_TR').format(dateTime);
    return weekDay;
  } else {
    return DateFormat('dd.MM.yyyy').format(dateTime);
  }
}

String formatStringTime(String time) {
  final dateTime = DateTime.parse(time);
  final now = DateTime.now();
  final difference = now.difference(dateTime);

  if (difference.inDays == 0) {
    print(dateTime);
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

Widget buildStatusIcon(String status) {
  switch (status) {
    case 'sent':
      return Icon(Icons.check, size: 16, color: Colors.grey);
    case 'delivered':
      return Icon(Icons.done_all, size: 16, color: Colors.grey);
    case 'read':
      return Icon(Icons.done_all, size: 16, color: Colors.lightBlue);
    default:
      return SizedBox();
  }
}

Widget currentTextIcon(int userId, int senderId, String status) {
  if (userId == senderId) {
    switch (status) {
      case 'sent':
        return Icon(Icons.check, size: 18, color: Colors.grey);
      case 'delivered':
        return Icon(Icons.done_all, size: 18, color: Colors.grey);
      case 'read':
        return Icon(Icons.done_all, size: 18, color: Colors.lightBlue);
      default:
        return SizedBox();
    }
  }
  return SizedBox();
}

Widget unReadCountWidget(int? unRead) {
  if (unRead != null && unRead > 0) {
    return CircleAvatar(
      radius: 11,
      backgroundColor: Color(0xFF910811),
      child: Center(
        child: Text(
          unRead.toString(),
          style: TextStyle(
            fontSize: 10,
            fontFamily: 'Inter',
            color: Colors.white,
          ),
          textAlign: TextAlign.right,
        ),
      ),
    );
  }
  return SizedBox();
}
