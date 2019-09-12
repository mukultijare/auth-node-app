var express = require('express'),
    bodyParser = require('body-parser'),    
    errorHandler = require('express-error-handler'),    
    app = express();


app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//Connection with Postgres Database
var pg = require('pg');
var conString = process.env.DATABASE_URL || "postgres://ucbzlrpomwzmlg:899fc4bcde05cead89e80a824437956c7aa8696238ad6d6887edffab3352ae14@ec2-174-129-227-51.compute-1.amazonaws.com:5432/dd4fv7nr6k8v95";
var client = new pg.Client(conString);
client.connect(); 

//Session Handler
const session = require('express-session');
app.use(session({
	secret: 'secret',
	resave: true,
    saveUninitialized: true,
    cookie: {
        expires: 60000
    }
}));

app.get('/' , function(req,res) {
    res.redirect(307, '/login');
}); 



app.post('/login', function(request, response) { 
    var username = request.body.uname;
	var password = request.body.upwd;
    if (username && password) 
    {

        
		response.redirect('/home');
    }
    else
    {
        response.sendfile(__dirname + '/login.html');
    }
});



app.get('/signup', function(request, response) {
    response.sendfile(__dirname + '/signup.html');
});

app.get('/home', function(request, response) {
    response.sendfile(__dirname + '/home.html');
});

app.get('/logout', function(request, response) {
    
});

app.set('port', process.env.PORT || 3001);
app.use(errorHandler());
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});