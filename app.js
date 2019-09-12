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

app.get('/' , function(request,response) {
    response.redirect('/login');
}); 

app.get('/login', function(request, response){
    response.sendfile(__dirname + '/login.html');
});


app.post('/auth', function(request, response) { 
    var username = request.body.uname;
    var password = request.body.upwd;
    //response.redirect('/'+username.length);
    if (username.length > 0 && password.length > 0) 
    {
        //response.redirect('/home');

        client.query('select * from regiusers where email = $1 and password = $2', [username, password], function(error, results) 
        {
            if (results.rows.length > 0) 
            {
				request.session.loggedin = true;
				request.session.user = username;
				response.redirect('/home');
            } 
            else 
            {
                response.redirect('/login');
			}		
		});
    }
    else
    {

    }
    //response.end();
});

app.post('/register', function(request, response) { 
    var name = request.body.name;
    var email = request.body.email;
    var pass = request.body.pwd;
    if (name && email) 
    {
        client.query('insert into regiusers(name, email, password) values($1, $2, $3)', [name, email, pass], function(error, results, fields) 
        {
            if (!error) 
            {
                response.redirect('/signup');
				/*request.session.loggedin = true;
				request.session.user = username;
				response.redirect('/home');*/
            } 
            else 
            {
                response.redirect('/login');
			}			
		});
    }
    response.end();
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