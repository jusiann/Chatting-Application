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

    // Eski bağlantıyı kapat
    _socket?.disconnect();

    // Yeni bağlantı
    _socket = IO.io(
      'http://192.168.1.9:5001',
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .enableReconnection()
          .setExtraHeaders({'Authorization': 'Bearer $token'})
          .build(),
    );

    // Event'ler
    _socket!.onConnect((_) => print('[SOCKET] Bağlandı'));
    _socket!.onDisconnect((_) => print('[SOCKET] Bağlantı koptu'));

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
