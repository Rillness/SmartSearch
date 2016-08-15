var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var colors = require('colors');
var wikipedia = require("wikipedia-js");
var Client = require('node-wolfram');
var mongoose = require('mongoose');

//Connects your mongoDB account.
mongoose.connect('mongodb://localhost/smart-search');

// mongoose schema.
var searchSchema = new mongoose.Schema({
  title : String
});
//Searches model using searchSchema.
var Searches = mongoose.model('Searches', searchSchema);

//Enter a wolfram API key.
var Wolfram = new Client('ENTER A WOLFRAM ALPHA API KEY');

//Sets up the bodyParser, and the view engine.
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

//Main page, this is the place where you can query your database, and find things that are needed in there.
app.get('/', function(req,res){
  Searches.find({}, function(err,body){
    if(err){
      console.log(err);
    }else{
      res.render('index', {searches : body});
    }
  });
});

//This is the thing
app.get('/wiki-search', function(req,res){
  var search = req.query.wikiSearch;
  var options = {query: search, format: 'html', summaryOnly: false};
  wikipedia.searchArticle(options, function(err, htmlWikiText){
    if(err){
      console.log("An error occurred[query=%s, error=%s]", query, err);
      return;
    }else{
        //console.log(query, htmlWikiText);
        res.render('wikisearch', {body : htmlWikiText, name : search});
    }
  });
});

//Gets the question typed in, and searches it with the wolfram alpha api.
app.get('/question-search', function(req,res){
  var search = req.query.wikiSearch;
  Wolfram.query(search, function(err, result) {
      if(err)
          console.log(err);
      else{

          res.render('questionsearch', {result : result, query : search});

      }
  });
});

//The logic for the save button.
app.get("/wiki-search/:id/saved" , function(req,res){
  var title = req.params.id;
console.log(title);
    var newTitle = new Searches({
      title : title
    }).save(function(err,body){
      if(err){
        console.log(err);
      }else{
        console.log('The body is saved: ' + body.title);
        res.redirect('/wiki-search/?wikiSearch=' + title);
      }
    });

});

//The logic for the 'I read them all button'
app.get('/delete', function(req,res){
  Searches.remove({}, function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect('/');
    }
  });
});

//The button that deletes the queries in the list of saved topics.
app.get('/delete/:id', function(req,res){
var id = req.params.id;
  Searches.findByIdAndRemove(id, function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect('/');
    }
  });
});

//Turns the server on, and allows you to listen on port 3000.
app.listen('3000', function(req,res){
  console.log('========================'.red);
  console.log(' Listening on PORT 3000'.blue);
  console.log('========================'.red);

});
