var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var router = express.Router();
var request = require('request');

var options = {
  uri: 'https://hampster.atlassian.net/rest/api/2/issue',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic aGFyc2hhZ21AZ21haWwuY29tOmhhbXBzdGVyQDEyMw=='
  },
  method: 'POST', 
  json: {
    "fields": {
       "project":
       { 
          "key": "HAM"
       },	
       "summary": "212333",
       "description": "TEST222",
       "issuetype": {
          "name": "Bug"
      }
    }
  }
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    console.log(info);
  }
  else
    console.log(response);
}

//app.use(express.static('public'))

app.get('/', function(req, res){
  request(options, callback);
  res.send('Message Sent');

  //res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  socket.on('hamster', function(msg){
    console.log('hamster said: ' + msg);
  });});

http.listen(3000, function(){
  console.log('listening on *:3000');
});