var express = require('express')
, app = express()
, load = require('express-load')
, error = require('./middleware/error')
, server = require('http').createServer(app)
, cookieParser = require('cookie-parser')
, session = require('express-session')
, bodyParser = require('body-parser')
, methodOverride = require('method-override')
, io = require('socket.io').listen(server);

const KEY = 'telegramCaixa.sid', SECRET = 'telegramCaixa';
var cookie = cookieParser(SECRET)
, store = new session.MemoryStore()
, sessOpts = { secret: SECRET, name: KEY, store: store, resave: true, saveUninitialized: true }
, session = session(sessOpts);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookie);
app.use(session);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride());
app.use(express.static(__dirname + '/public'));
//app.use(error.notFound);
app.use(error.serverError);

io.use(function (socket, next) {
    var data = socket.request;
    cookie(data, {}, function (err) {
        var sessionID = data.signedCookies[KEY];
        store.get(sessionID, function (err, session) {
            if (err || !session) {
                return next(new Error('Acesso negado!'));
            } else {
                socket.handshake.session = session;
                return next();
            }
        });
    });
});

load('models')
.then('controllers')
.then('routes')
.into(app);

server.listen(4000, function () {
    console.log("TelegramCaixa no ar.");
});
