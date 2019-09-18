var express = require('express'),
    bodyParser = require('body-parser'),    
    errorHandler = require('express-error-handler'),    
    app = express();
var zlib = require("zlib");
var request = require("request");
let cookieParser = require('cookie-parser'); 
app.use(cookieParser()); 

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//Connection with Postgres Database
var pg = require('pg');
var conString = process.env.DATABASE_URL || "postgres://ucbzlrpomwzmlg:899fc4bcde05cead89e80a824437956c7aa8696238ad6d6887edffab3352ae14@ec2-174-129-227-51.compute-1.amazonaws.com:5432/dd4fv7nr6k8v95";
var client = new pg.Client(conString);
client.connect();
//----------------- Connection with Postgres Database -------------------

//Session Handler
//const session = require('express-session');
var session = require('client-sessions');
app.use(session({
    cookieName: 'session',
    secret: 'random_string_goes_here',
    duration: 60000,
    activeDuration : 30000   
}));
//-------------------------- Session handler End --------------------------------


app.get('/' , function(request,response) {
    response.redirect('/login');
}); 

app.get('/login', function(request, response){
    response.sendfile(__dirname + '/login.html');
});

var localStorage = require('localStorage');

app.post('/auth', function(request, response) { 
    var username = request.body.uname;
    var password = request.body.upwd;
    //response.redirect('/'+username.length);
    if (username.length > 0 && password.length > 0) 
    {
        //response.redirect('/home');

        client.query('select * from regiusers where email = $1 and password = $2 limit 1' , [username, password], function(error, results) 
        {
            if (results.rows.length > 0) 
            {
				//request.session.loggedin = true;
                request.session.user = username;
                //localStorage.setItem('myKey', request.session.user)
                response.cookie("userData", request.session.user);
				response.redirect('/home');
            }
            else 
            {
                response.redirect('/login');
            }
            response.end();	
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
            client.query('select * from regiusers where email = $1 and password = $2 limit 1', [email, pass], function(errors, result) 
            {
                if (result.rows.length > 0) 
                {
                    response.redirect('/login');
                } 
                else 
                {
                    response.redirect('/signup');
                }	
                response.end();	
            });
		});
    }
});


app.get('/signup', function(request, response) {
    response.sendfile(__dirname + '/signup.html');
});

app.get('/home', function(request, response) {
    if (request.session.user) 
    {

        response.sendfile(__dirname + '/home.html');
    }
    else
    {
        response.redirect('/login');
    }
});

app.get('/logout', function(request, response) {
    if (request.session.user) 
    {
        request.session.destroy();
        response.clearCookie('session');
        response.clearCookie('userData');
        response.redirect('/login');
    } 
    else 
    {
        response.redirect('/login');
	}
	response.end();
});

app.post('/abnConnect', function(req, res) {
    var abn = req.body.abnno;
    if(abn)
    {
        var options = {
            method: 'GET',
            url: 'http://www.abr.business.gov.au/ABN/View',
            qs: { id: abn },
            headers: 
            { 
                'cache-control': 'no-cache',
                Connection: 'keep-alive',
                'Accept-Encoding': 'gzip, deflate',
                Host: 'www.abr.business.gov.au',
                //'Postman-Token': '4e1879da-692f-499c-9948-de577e3b8b89,970dc90d-b5b0-48a5-bcb3-3f6cb81644c1',
                //'Cache-Control': 'no-cache',
                Accept: '*/*',
                'User-Agent': 'PostmanRuntime/7.16.3' 
            } 
        };
        
        request(options, function (error, response, body) 
        {
            if (error) throw new Error(error);
            //res.send(response);
            if(body)
            {
                /*zlib.gunzip(body, function(err, dezipped) 
                {
                    res.send("dezipped :" , dezipped.toString());
                    //callback(.toString());
                });*/
                
                res.send(response.status); 
                /*var deCompressedJSONFile = function(next, body, results) {
                    console.log("deCompressedJSONFile function started", body);
                    zlib.unzip(body, function(err, unZippedData) {
                        if (err) {
                            res.send("error in unzip decompress using zlib module", err);
                            next(err);
                        } else {
                            res.send("unZippedData", unZippedData);
                            //next(null, unZippedData);
                        }
                    })
                }  */
            }
            //console.log(body);
        });
    }
});



app.set('port', process.env.PORT || 3001);
app.use(errorHandler());
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});