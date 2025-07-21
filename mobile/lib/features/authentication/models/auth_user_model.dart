class AuthUserModel {
  int id;
  String name;
  String surname;
  String email;
  String? title;
  String? profilepic;
  String? department;

  AuthUserModel(
    this.id,
    this.name,
    this.surname,
    this.email,
    this.title,
    this.profilepic,
    this.department,
  );

  factory AuthUserModel.fromJwt(Map<String, dynamic> decoded) {
    return AuthUserModel(
      decoded['id'],
      decoded['first_name'],
      decoded['last_name'],
      decoded['email'],
      decoded['title'],
      decoded['profile_pic'],
      decoded['department'],
    );
  }

  String get fullname => '$name $surname';
}
