import 'package:mobile/features/chat/controllers/message_controller.dart';
import 'package:mobile/features/chat/models/chat_model.dart';
import 'package:mobile/features/chat/models/message_model.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
part 'socket_service.g.dart';

class MySocket {
  IO.Socket? socket;
  MySocket({this.socket});
}

@Riverpod(keepAlive: true)
class SocketService extends _$SocketService {
  IO.Socket? _socket;
  String? _token;

  @override
  MySocket build() {
    return MySocket();
  }

  void connect(String token) {
    if (_token == token && _socket != null && _socket!.connected) {
      print('Zaten bağlı');
      return;
    }

    print('[SOCKET] Yeni bağlantı kuruluyor');
    _token = token;

    _socket?.disconnect();

    _socket = IO.io(
      'http://192.168.1.9:5001',
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .enableReconnection()
          .setExtraHeaders({'Authorization': 'Bearer $token'})
          .build(),
    );

    _socket!.onConnect((_) => print('[SOCKET] Bağlandı'));
    _socket!.onDisconnect((_) => print('[SOCKET] Bağlantı koptu'));

    _socket!.on('message', (data) {
      final msg = MessageModel.fromJson(data);
      ref.read(messageControllerProvider.notifier).addFromSocket(msg);
      ref.read(messageControllerProvider.notifier).handleIncomingMessages(data);
    });

    _socket!.on('message_delivered', (data) {
      final msgId = data['id'];
      final deliveredAt = data['deliveredAt'];
      ref
          .read(messageControllerProvider.notifier)
          .markAsDelivered(msgId, deliveredAt);
    });

    _socket!.on('message_read', (data) {
      final msgId = data['id'];
      final readAt = data['readAt'];
      ref.read(messageControllerProvider.notifier).markAsRead(msgId, readAt);
    });

    // State güncelle
    state = MySocket(socket: _socket);

    print('[SOCKET] Socket kurulumu tamamlandı');
  }

  void emit(String event, dynamic data) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit(event, data);
      print('[SOCKET] Mesaj gönderildi: $data');
    } else {
      print('[SOCKET] Socket bağlı değil, emit başarısız');
    }
  }

  void on(String event, Function(dynamic data) callback) {
    if (_socket != null) {
      _socket!.on(event, callback);
      print('[SOCKET] $event olayı dinleniyor');
    } else {
      print('[SOCKET] Socket null, $event olayı eklenemedi');
    }
  }

  void disconnect() {
    _socket?.disconnect();
    print('[SOCKET] Manuel bağlantı kesildi');
  }
}
