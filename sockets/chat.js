module.exports = function (io) {
    var crypto = require('crypto')
		, md5 = crypto.createHash('md5')
		, redis = require('redis').createClient()
		, sockets = io.sockets;
	onlines = [];	
    sockets.on('connection', function (client) {
       
        var session = client.handshake.session;
        var usuario = session.usuario;
			
		function consultarIdUsuario(nome){
			 for(i = 0 ; i < onlines.length ; i++){
				if( onlines[i] != null && onlines[i].nome === nome ){
					return onlines[i].id;
				}
			}
			return "0";
		}
				
		onlines.push({nome: usuario.nome, id:client.id});
		onlines.forEach(function(online) {
			client.emit('notify-onlines', online.nome);
			client.broadcast.emit('notify-onlines', online.nome);		
		});
	
		client.on('join', function(sala,contato) {
			if(!sala) {
				sala = gerarNomeSala(usuario.nome, contato);
			}
			var idContato = consultarIdUsuario(usuario.nome);
			session.sala = sala;
			client.join(sala);
			redis.lrange(sala, 0, -1, function(erro, msgs) {
				for( i = msgs.length ; i > 0 ; i-- ){
					sockets.connected[idContato].emit('send-client', {msg: msgs[i-1], contato: contato});
				}
			});
			
		});
				
		client.on('disconnect', function () {
			var sala = session.sala;
			 client.broadcast.emit('notify-offlines', usuario.nome);
			 client.leave(sala);
			 
			 for(i = 0 ; i < onlines.length ; i++){
				if( onlines[i] != null && onlines[i].nome === usuario.nome ){
					delete onlines[i];
				}
			}
			
		});
		
       client.on('send-server', function (msg,contato) {
			  var sala = session.sala
			  , data = {nome: usuario.nome, sala: sala};
			  var idContato = consultarIdUsuario(contato);
			  msg = "<b>"+usuario.nome+":</b> "+msg+"<br>";
			  redis.lpush(sala, msg);
			  if( idContato != 0 ){
				sockets.connected[idContato].emit('new-message', data);
			  }
			  sockets.in(sala).emit('send-client', {msg: msg, contato: contato});			
		});
		
    });
}