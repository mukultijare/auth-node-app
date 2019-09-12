var express = require('express'),
    bodyParser = require('body-parser'),
    
    app = express();
    

const session = require('express-session');
var port = process.env.PORT || 3000;

app.use(session({
	secret: 'secret',
	resave: true,
    saveUninitialized: true,
    cookie: {
        expires: 60000
    }
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

var pg = require('pg');  
      

var conString = process.env.DATABASE_URL || "postgres://ucbzlrpomwzmlg:899fc4bcde05cead89e80a824437956c7aa8696238ad6d6887edffab3352ae14@ec2-174-129-227-51.compute-1.amazonaws.com:5432/dd4fv7nr6k8v95";
var client = new pg.Client(conString);

client.connect();   


app.get('/' , function(req,res) {
    res.sendfile(__dirname + 'index.html');
}); 

app.post('/auth', function(request, response) { 
    var username = request.body.user;
	var password = request.body.upwd;
    if (username == "Mukul") 
    {
		response.redirect('/dash');
	}
});

app.get('/dash', function(request, response) {
    res.sendfile(__dirname + 'home.html');
});

app.get('/logout', function(request, response) {
    
});


app.listen(port, function () {
    console.log('Express server listening on port');
});