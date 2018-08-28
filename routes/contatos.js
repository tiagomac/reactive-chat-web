module.exports = function (app) {
    var autenticar = require('./../middleware/autenticador')
    , contatos = app.controllers.contatos;
    app.get('/contatos', autenticar, contatos.index);
    app.post('/contato', autenticar, contatos.create);
};