class UserModel {
  int id;
  String name;
  String surname;
  String email;
  String? status;
  String? department;
  String? avatar;
  String? time;
  bool selected;

  UserModel({
    required this.name,
    required this.surname,
    required this.id,
    required this.email,
    this.status,
    this.department,
    this.avatar,
    this.time,
    this.selected = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      name: json['name'],
      surname: json['surname'],
      id: json['id'],
      email: json['email'],
    );
  }
}
