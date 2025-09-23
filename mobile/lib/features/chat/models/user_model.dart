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
  DateTime? lastSeen;
  bool isOnline = false;
  bool? typing = false;

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
    this.lastSeen,
    this.isOnline = false,
    this.typing = false,
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
      lastSeen: DateTime.tryParse(json['last_seen'].toString())?.toLocal(),
      isOnline: json['is_online'] ?? false,
    );
  }

  UserModel copyWith({
    int? id,
    String? firstName,
    String? lastName,
    String? email,
    String? status,
    String? department,
    String? avatar,
    String? time,
    bool? selected,
    String? title,
    String? profilepic,
    DateTime? lastSeen,
    bool? isOnline,
    bool? typing,
  }) {
    return UserModel(
      id: id ?? this.id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      status: status ?? this.status,
      department: department ?? this.department,
      avatar: avatar ?? this.avatar,
      time: time ?? this.time,
      selected: selected ?? this.selected,
      title: title ?? this.title,
      profilepic: profilepic ?? this.profilepic,
      lastSeen: lastSeen ?? this.lastSeen,
      isOnline: isOnline ?? this.isOnline,
      typing: typing ?? this.typing,
    );
  }

  String get fullname => '$firstName $lastName';
}
