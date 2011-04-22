var http = require('http'),
    faye = require('faye');
    sys = require("sys"); 
    url = require("url");
    path = require("path");
    fs = require("fs");
        
var bayeux = new faye.NodeAdapter({
  mount:    '/faye',
  timeout:  45
});

// The server's builtin Faye Client
var events = bayeux.getClient()

// Handle non-Bayeux requests
var server = http.createServer(function(request, response) {

  if(request.method == "PUT") {

    // Extract channel name 
    var channel = url.parse(request.url).pathname.substr(1);
    
    console.log("Opening channel " + channel);
    
    var lineNumber = 0;
    request.on("data", function(chunk) {
      events.publish('/' + channel, {
        id: lineNumber++,
        text: chunk.toString()
      });
    });
  } 
  else {
      fs.readFile("index.htm", "binary", function(err, file) {  
          if(err) {  
              response.writeHeader(500, {"Content-Type": "text/plain"});  
              response.write(err + "\n");  
              return response.end();  
          }  
          response.writeHeader(200);  
          response.write(file, "binary");  
          response.end();  
      });  
  };
});

console.log("Starting up")

bayeux.attach(server);
server.listen(8000);