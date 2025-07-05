import 'package:flutter/material.dart';

class HomeState extends ChangeNotifier {
  int navBarIndex;

  HomeState({required this.navBarIndex});

  void setIndex(int index) {
    navBarIndex = index;
    notifyListeners();
  }
}
