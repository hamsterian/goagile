var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var router = express.Router();
var request = require('request');
var bodyParser = require("body-parser");

app.use(express.static('public'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/hamster', function (req, res) {
  var comments = req.body.comments;

  console.log(comments);

  request({
    uri: 'https://hampster.atlassian.net/rest/api/2/issue/HAM-4',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic aGFyc2hhZ21AZ21haWwuY29tOmhhbXBzdGVyQDEyMw=='
    },
    method: 'PUT',
    json: {
      "update": {
        "description": [
          {
            "set": "JIRA should also come with a free pony"
          }
        ],
        "comment": [
          {
            "add": {
              "body": comments
            }
          }
        ]
      }
    }
  }, function (error, response, body) {
    if (!error && response.statusCode == 201) {
      console.log("Success");
      var info = JSON.parse(body);
      console.log(info);
    }
    else {
      console.log("Fail");
      console.log(error);
    }
  });

  res.send("Facebook");
});

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    console.log(info);
  }
  else
    console.log(response);
}

var message = "";

io.on('connection', function (socket) {
  console.log('user connected');

  socket.on('hamster', function (msg) {
    
    request({
      uri: 'https://hampster.atlassian.net/rest/api/2/issue/HAM-4',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic aGFyc2hhZ21AZ21haWwuY29tOmhhbXBzdGVyQDEyMw=='
      },
      method: 'PUT',
      json: {
        "update": {
          "description": [
            {
              "set": "JIRA should also come with a free pony"
            }
          ],
          "comment": [
            {
              "add": {
                "body": msg
              }
            }
          ]
        }
      }
    }, function (error, response, body) {
      if (!error && response.statusCode == 204) {
        console.log("Success");
      }
      else {
        console.log("Fail");
      }
    });
  });
});
http.listen(3000, function () {
  console.log('listening on *:3000');
});