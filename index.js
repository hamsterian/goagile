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
    var message = encodeURIComponent(msg);
    var username = "8d5c4ce6-ea24-4fba-9540-bd98d45585a6";
    var password = "4FN2t82l4KuY";
    var url = "https://gateway.watsonplatform.net/natural-language-understanding/api/v1/analyze?version=2017-02-27&text="
      + message + "&features=keywords";

    var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

    request(
      {
        url: url,
        headers: {
          "Authorization": auth
        }
      },

      function (error, response, body) {
        // Do more stuff with 'body' here.
        var bod = JSON.parse(body);

        console.log(bod);

        var i = 0;

        for (i = 0; i < bod.keywords.length; i++) {
          console.log(bod.keywords[i]);
        }

        for (i = 0; i < bod.keywords.length; i++) {
          console.log("Searching for Promethius" + bod.keywords[i].text);

          request({
            uri: encodeURI('https://hampster.atlassian.net/rest/api/2/search?jql=summary~' + bod.keywords[i].text),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic aGFyc2hhZ21AZ21haWwuY29tOmhhbXBzdGVyQDEyMw=='
            }
          },
            function (error, response, body) {
              // Do more stuff with 'body' here.
              var bod = JSON.parse(body);

              console.log(bod);

              for (i = 0; i < bod.issues.length; i++) {
                console.log('attempting to write comment ' + message + 'to jira');
                request({
                  uri: 'https://hampster.atlassian.net/rest/api/2/issue/' + bod.issues[i].key,
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
                            "body": message
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
              }
            }
          );
        }
      });
  })
})

http.listen(3000, function () {
  console.log('listening on *:3000');
});