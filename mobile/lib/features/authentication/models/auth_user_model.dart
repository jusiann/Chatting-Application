class AuthUserModel {
  int id;
  String name;
  String surname;
  String email;

  AuthUserModel(this.id, this.name, this.surname, this.email);

  factory AuthUserModel.fromJwt(Map<String, dynamic> decoded) {
    return AuthUserModel(
      decoded['id'],
      decoded['name'],
      decoded['surname'],
      decoded['email'],
    );
  }
}
