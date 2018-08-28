module.exports = function (app) {
    var ContatoController = {
        index: function (req, res) {
            var usuario = req.session.usuario
			, contatos = usuario.contatos			
            , params = {
                usuario: usuario,
				contatos: contatos
            };
            res.render('contatos/index', params);
        },
		create: function(req, res) {
            var contato = req.body.contato
            , usuario = req.session.usuario;
            usuario.contatos.push(contato);
            res.redirect('/contatos');
        }
    }
    return ContatoController;
};