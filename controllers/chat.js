﻿module.exports = function(app) {

  var ChatController = {
    index: function(req, res){
      var params = {sala: req.query.sala, contato: req.params.nome, usuario: req.session.usuario};
      res.render('chat/index', params);
    }
  };

  return ChatController;

};