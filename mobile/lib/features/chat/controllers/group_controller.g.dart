// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'group_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$groupControllerHash() => r'b9ea5b8c006a4ddfb43b75b611607680957ff2a5';

/// See also [GroupController].
@ProviderFor(GroupController)
final groupControllerProvider =
    NotifierProvider<GroupController, List<GroupModel>>.internal(
      GroupController.new,
      name: r'groupControllerProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$groupControllerHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$GroupController = Notifier<List<GroupModel>>;
String _$groupMessageControllerHash() =>
    r'2ebc496648c5f8d8c05f06f002b0408d944de730';

/// See also [GroupMessageController].
@ProviderFor(GroupMessageController)
final groupMessageControllerProvider =
    AutoDisposeNotifierProvider<
      GroupMessageController,
      List<GroupMessageModel>
    >.internal(
      GroupMessageController.new,
      name: r'groupMessageControllerProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$groupMessageControllerHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$GroupMessageController = AutoDisposeNotifier<List<GroupMessageModel>>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
