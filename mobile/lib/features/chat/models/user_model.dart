class UserModel {
  String name;
  String? status;
  String department;
  String? avatar;
  bool selected;

  UserModel({
    required this.name,
    this.status,
    required this.department,
    this.avatar,
    this.selected = false,
  });
}
