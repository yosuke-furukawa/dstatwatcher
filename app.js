
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , mongoose = require('mongoose')
  , Tuppari = require('tuppari')
  , keys = require('./keys');

var app = express();

var tuppari = new Tuppari(keys);
var channel = tuppari.join('dstat');

var mongoUri = process.env.MONGOHQ_URL || 'mongodb://localhost/dstat';
mongoose.connect(mongoUri);
var oldItem = null;
setInterval(function(){
  mongoose.connection.db.collection('dstat', function(err, collection) {
    collection.find({}).sort({time: -1}).limit(1).toArray(function(err, results) {
      results.forEach(function(item){
        if (oldItem != item) {
          channel.send('stat_event', JSON.stringify(item), function (err, res, body) {
            if (err) {
              console.error(err);
            }
            console.log(res.statusCode, body);
          });
          oldItem = item;
        }
      });
    });
  });
},3000);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.get('/history', function(req,res){
  mongoose.connection.db.collection('dstat', function(err, collection) {
    collection.find({}).sort({time: -1}).limit(20).toArray(function(err, results) {
      res.json(JSON.stringify(results.reverse()));
  });
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
