'use strict';

const mongo = require('mongodb');
const http = require('http');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const nconf = require('nconf');
const mongoose = require('mongoose');
const mongoDatabase = nconf.get('mongoDatabase');
let uri = `mongodb://admin:12345@rentcross-shard-00-00-216zg.gcp.mongodb.net:27017,rentcross-shard-00-01-216zg.gcp.mongodb.net:27017,rentcross-shard-00-02-216zg.gcp.mongodb.net:27017/test?ssl=true&replicaSet=rentcross-shard-0&authSource=admin&retryWrites=true`;
if (mongoDatabase) {
    uri = `${uri}/${mongoDatabase}`;
}
console.log(uri);

mongo.MongoClient.connect(uri, (err, db) => {
    if (err) {
        throw err;
    }

    mongoose.connect(uri, { useNewUrlParser: true });

    var db = mongoose.connection;

    var routes = require('./routes/index');
    var users = require('./routes/users');

    var app = express();

    app.set('views', path.join(__dirname, 'views'));
    app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
    app.set('view engine', 'handlebars');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());


    app.use(express.static(path.join(__dirname, 'public')));

    app.use(session({

        secret: 'secret',
        saveUninitialized: true,
        resave: true


    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(expressValidator({

        errorFormatter: function(param, msg, value) {

            var namespace = param.split('.'),
                root = namespace.shift(),
                formParam = root;

            while (namespace.length) {

                formParam += '[' + namespace.shift() + ']';


            }
            return {

                param: formParam,
                msg: msg,
                value: value



            };

        }




    }));

    app.use(flash());

    app.use(function(req, res, next) {

        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        res.locals.error = req.flash('error');
        res.locals.user = req.user || null;
        next();
    });


  
    app.use('/', routes);
    app.use('/users', users);

    var User = require('./models/user')

    app.get('/api/users', function(req,res){
        User.getUsers(function(err,users){
            if(err){
                throw err;
            }
            res.json(users);
        });

    });

    app.post('/api/users', (req, res) => {
        var user = req.body;
        User.addUser(user, (err, user) => {
            if(err){
                throw err;
            }
            res.json(user);
        });
    });

    app.put('/api/users/:_id', (req, res) => {
        var id = req.params._id;
        var user = req.body;
        User.updateUser(id,user,{}, (err, user) => {
            if(err){
                throw err;
            }
            res.json(user);
        });
    });

    app.delete('/api/users/:_id', (req, res) => {
        var id = req.params._id;
        User.deleteUser(id, (err, user) => {
            if(err){
                throw err;
            }
            res.json(user);
        });
    });

    app.get('/api/users/:_id', (req,res) => {
        User.getUserById(req.params._id, (err,user) => {
            if(err){
                throw err;
            }
            res.json(user);
        });

    });


    app.set('port', (process.env.PORT || 3000));
    app.listen(app.get('port'), function() {

        console.log('Server started on port', +app.get('port'));

    });
});