import 'package:riverpod_annotation/riverpod_annotation.dart';
part 'unread_group_messages.g.dart';

@Riverpod(keepAlive: true)
class UnreadGroupMessages extends _$UnreadGroupMessages {
  @override
  Map<int, int> build() => {};

  void unReadcount(dynamic data) {
    for (var entry in data) {
      int groupId = int.parse(entry['id'].toString());
      int count = int.parse(entry['unread_count'].toString());
      state = {...state, groupId: count};
    }
  }

  void incrementUnread(int groupId) {
    state = {...state, groupId: (state[groupId] ?? 0) + 1};
  }

  void clearUnread(int groupId) {
    state = {...state, groupId: 0};
  }
}
