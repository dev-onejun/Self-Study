var express = require('express')
var parseurl = require('parseurl')
var session = require('express-session')
var FileStore = require('session-file-store')(session)

var app = express()

app.use(session({
    secret: 'keyboard cat',   // github에 올리면 안됨.
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}))



app.get('/', function (req, res, next) {
    console.log(req.session);
    if(req.session.num === undefined)   req.session.num =   1;
    else                                req.session.num +=  1;
    res.send(`View : ${req.session.num}`);
})

app.listen(3000, function () {
    console.log('3000!');
});