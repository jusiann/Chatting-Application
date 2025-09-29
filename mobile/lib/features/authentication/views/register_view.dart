import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/authentication/controllers/auth_controller.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterState();
}

class _RegisterState extends ConsumerState<RegisterPage> {
  final _nameController = TextEditingController();
  final _surnameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _passwordReplyController = TextEditingController();
  bool _obscureText1 = true;
  bool _obscureText2 = true;
  String? selectedTitle;
  String? selectedDepartment;
  final List<String> titleItems = [
    "Prof.Dr",
    "Dr. Öğretim Üyesi",
    "Araştırma Görevlisi",
  ];
  final List<String> departmentItems = [
    "Bilgisayar Mühendisliği",
    "Endüstri Mühendisliği",
    "İnşaat Mühendisliği",
  ];
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    return Scaffold(
      appBar: AppBar(),
      body: LayoutBuilder(
        builder: (context, constrainst) {
          return SingleChildScrollView(
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: constrainst.maxHeight),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Image.asset(
                      'assets/images/Logo1.png',
                      height: 150,
                      width: 150,
                    ),
                    SizedBox(height: 30),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _nameController,
                              decoration: InputDecoration(
                                hintText: 'Adınız',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(15),
                                ),
                              ),
                            ),
                          ),
                          SizedBox(width: 15),
                          Expanded(
                            child: TextField(
                              controller: _surnameController,
                              decoration: InputDecoration(
                                hintText: 'Soyadınız',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(15),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.fromLTRB(20, 0, 20, 0),
                      child: TextField(
                        controller: _emailController,
                        decoration: InputDecoration(
                          hintText: 'Email adresiniz',
                          prefixIcon: Icon(Icons.email),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(15),
                          ),
                        ),
                        keyboardType: TextInputType.emailAddress,
                      ),
                    ),
                    SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      height: 64,
                      padding: EdgeInsets.fromLTRB(20, 0, 20, 0),
                      child: Container(
                        padding: EdgeInsets.only(left: 10),
                        decoration: BoxDecoration(
                          border: Border.all(color: Color(0xFF444444)),
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.school, color: Color(0xFF444444)),
                            SizedBox(width: 15),
                            DropdownButton<String>(
                              value: selectedTitle,
                              hint: Text('Ünvanınızı seçiniz.'),
                              items: titleItems.map((String value) {
                                return DropdownMenuItem<String>(
                                  value: value,
                                  child: Text(value),
                                );
                              }).toList(),
                              onChanged: (String? newValue) {
                                setState(() {
                                  selectedTitle = newValue;
                                });
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      height: 64,
                      padding: EdgeInsets.fromLTRB(20, 0, 20, 0),
                      child: Container(
                        padding: EdgeInsets.only(left: 10),
                        decoration: BoxDecoration(
                          border: Border.all(color: Color(0xFF444444)),
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.apartment, color: Color(0xFF444444)),
                            SizedBox(width: 15),
                            DropdownButton<String>(
                              value: selectedDepartment,
                              hint: Text('Bölümünüzü seçiniz.'),
                              items: departmentItems.map((String value) {
                                return DropdownMenuItem<String>(
                                  value: value,
                                  child: Text(value),
                                );
                              }).toList(),
                              onChanged: (String? newValue) {
                                setState(() {
                                  selectedDepartment = newValue;
                                });
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      height: 64,
                      padding: EdgeInsets.fromLTRB(20, 0, 20, 0),
                      child: TextField(
                        controller: _passwordController,
                        obscureText: _obscureText1,
                        decoration: InputDecoration(
                          hintText: 'Şifreniz',
                          prefixIcon: Icon(Icons.lock),
                          suffixIcon: IconButton(
                            onPressed: () {
                              setState(() {
                                _obscureText1 = !_obscureText1;
                              });
                            },
                            icon: Icon(
                              _obscureText1
                                  ? (Icons.visibility_off)
                                  : (Icons.visibility),
                            ),
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(15),
                          ),
                        ),
                      ),
                    ),
                    Container(
                      width: double.infinity,
                      height: 64,
                      padding: EdgeInsets.fromLTRB(20, 0, 20, 0),
                      child: TextField(
                        controller: _passwordReplyController,
                        obscureText: _obscureText2,
                        decoration: InputDecoration(
                          hintText: 'Şifreniz tekrar',
                          prefixIcon: Icon(Icons.lock),
                          suffixIcon: IconButton(
                            onPressed: () {
                              setState(() {
                                _obscureText2 = !_obscureText2;
                              });
                            },
                            icon: Icon(
                              _obscureText2
                                  ? (Icons.visibility_off)
                                  : (Icons.visibility),
                            ),
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(15),
                          ),
                        ),
                      ),
                    ),
                    SizedBox(height: 20),
                    Container(
                      height: 64,
                      width: double.infinity,
                      padding: EdgeInsets.fromLTRB(20, 0, 20, 0),
                      child: FilledButton(
                        onPressed: () {
                          String firstName = _nameController.text;
                          String lastName = _surnameController.text;
                          String email = _emailController.text;
                          String password = _passwordController.text;
                          String passwordRep = _passwordReplyController.text;
                          if (password != passwordRep) {
                            print('Şifreler eşleşmiyor.');
                          } else {
                            ref
                                .read(authControllerProvider.notifier)
                                .signupUser(
                                  firstName: firstName,
                                  lastName: lastName,
                                  email: email,
                                  password: password,
                                  title: selectedTitle,
                                  department: selectedDepartment,
                                );
                          }
                        },

                        style: FilledButton.styleFrom(
                          backgroundColor: Color(0xFF910811),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(15),
                          ),
                        ),
                        child: authState.registering
                            ? CircularProgressIndicator(color: Colors.white)
                            : Text('Kayıt ol'),
                      ),
                    ),
                    SizedBox(height: 15),
                    SizedBox(
                      width: double.infinity,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Zaten hesabın var mı? ',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                              color: Colors.black,
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.pop(context);
                            },
                            child: Text(
                              'Giriş yap',
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                                color: Color(0xFF910811),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
