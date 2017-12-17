var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var router = express.Router();
var path    = require("path");
var fs = require("fs");
var utility = require('../my_modules/utility.js');

var app  = express();

function checkAuth (req, res, next) {
	console.log('checkAuth ' + req.url);
	if (req.session == undefined)
	{
			req.session = {};
			req.session.authenticated = false;
	}
	console.log(req.session.authenticated);
	if (req.url === '/admin' && (!req.session || !req.session.authenticated)) {
		res.sendFile(path.join(__dirname+'/html/unauthorized.html'));
		return;
	}

	next();
}


app.use(express.static("./my_modules/html"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
	secret: process.env.SESSION_SECRET || fs.readFileSync(path.resolve(utility.DATA.dir,'./content/.secret'),{encoding:'utf8'}).trim(),
	resave: 'true',
	saveUninitialized:'true'
}));
app.use(checkAuth);
app.use(router);



app.get('/',function(req,res){
	res.sendFile(path.join(__dirname+'/html/index.html'));
});

app.get('/admin', function (req, res, next) {
	res.sendFile(path.join(__dirname+'/html/admin.html'));
});

app.get('/logout', function (req, res, next) {
	delete req.session.authenticated;
	res.redirect('/');
});

app.post('/login', function (req, res, next) {

	var user = process.env.CPANEL_USERNAME || fs.readFileSync(path.resolve(utility.DATA.dir,'./content/.username'),{encoding:'utf8'}).trim();
	var pass = process.env.CPANEL_PASSWORD || fs.readFileSync(path.resolve(utility.DATA.dir,'./content/.password'),{encoding:'utf8'}).trim()
	if (req.body.username && req.body.username === user && req.body.password && req.body.password === pass) {
		console.log('Logado');
		req.session.authenticated = true;
		res.redirect('/admin');
	} else {
		console.log('Não Logado');
		return res.json(
	    Object.assign({}, req.body, req.params)
	  );
	}

});

app.post('/approve', function (req, res) {
	if (req.body.url)
	{
		utility.approveProgress(req.body.url);
		res.end();
	}
});

app.post('/recuse', function (req, res) {
	if (req.body.url)
	{
		utility.recuseProgress(req.body.url);
		res.end();
	}
});

app.post('/get-progress', function (req, res) {
	res.send(utility.DATA.PROGRESS);
});

app.listen(3000);
