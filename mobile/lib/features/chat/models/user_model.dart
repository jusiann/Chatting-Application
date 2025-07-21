class UserModel {
  int id;
  String firstName;
  String lastName;
  String email;
  String? status;
  String? department;
  String? avatar;
  String? time;
  bool selected;
  String? title;
  String? profilepic;

  UserModel({
    required this.firstName,
    required this.lastName,
    required this.id,
    required this.email,
    this.status,
    this.department,
    this.avatar,
    this.time,
    this.selected = false,
    this.title,
    this.profilepic,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      firstName: json['first_name'],
      lastName: json['last_name'],
      id: json['id'],
      email: json['email'],
      title: json['title'],
      department: json['department'],
      profilepic: json['profile_pic'],
    );
  }

  String get fullname => '$firstName $lastName';
}
