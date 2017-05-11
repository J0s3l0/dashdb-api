//------------------------------------------------------------------------------
// Copyright 2016 IBM Corp. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var ibmdb = require('ibm_db');
require('cf-deployment-tracker-client').track();

var cors = require('cors')
var app = express();

app.use(cors())


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
var db2;
var hasConnect = false;

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

if (process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
	if (env['dashDB']) {
        hasConnect = true;
		db2 = env['dashDB'][0].credentials;
	}

}

if ( hasConnect == false ) {

   db2 = {
        db: "BLUDB",
        hostname: "xxxx",
        port: 50000,
        username: "xxx",
        password: "xxx"
     };
}

var connString = "DRIVER={DB2};DATABASE=" + db2.db + ";UID=" + db2.username + ";PWD=" + db2.password + ";HOSTNAME=" + db2.hostname + ";port=" + db2.port;

//app.get('/', routes.listSysTables(ibmdb,connString));

app.get('/', function (req, res, next) {
  res.json({msg: 'This is CORS-enabled for all origins!'})
})


app.get('/api/v1/engines/customers', function(req, res, next){
  ibmdb.open(connString, function(err, conn){
    if(err){
      console.error("Error: ", err);
      return;
    }else{
      var query = "SELECT CUSTOMER, COUNT(*) AS TOTAL FROM DASH14467.BLADE_DAMAGE GROUP BY CUSTOMER";
      conn.query(query, function(err, rows){
        if(err){
          console.log("Error: ", err);
          return;
        }else {
          res.send(rows);
          conn.close(function(){
            console.log("Connection closed successfully");
          });
        }
      });
    }
  });
});

app.get('/api/v1/engines/damage_per_flight', function(req, res, next){
  ibmdb.open(connString, function(err, conn){
    if(err){
      console.error("Error: ", err);
      return;
    }else{
      var query = "SELECT FLIGHT_ID, SUM(DAMAGE) AS TOTAL_DAMAGE FROM DASH14467.BLADE_DAMAGE GROUP BY FLIGHT_ID";
      conn.query(query, function(err, rows){
        if(err){
          console.log("Error: ", err);
          return;
        }else {
          res.send(rows);
          conn.close(function(){
            console.log("Connection closed successfully");
          });
        }
      });
    }
  });
});

app.get('/api/v1/engines/ex50b/core_speed', function(req, res, next){
  ibmdb.open(connString, function(err, conn){
    if(err){
      console.error("Error: ", err);
      return;
    }else{
      var query = "SELECT CUSTOMER, FLIGHT_ID, FAILED, CORE_SPEED FROM DASH14467.BLADE_DAMAGE WHERE ENGINE_TYPEB=2 ORDER BY CORE_SPEED DESC FETCH FIRST 100 ROW ONLY";
      conn.query(query, function(err, rows){
        if(err){
          console.log("Error: ", err);
          return;
        }else {
          res.send(rows);
          conn.close(function(){
            console.log("Connection closed successfully");
          });
        }
      });
    }
  });
});

app.get('/api/v1/prosa/comercios', function(req, res, next){
  ibmdb.open(connString, function(err, conn){
    if(err){
      console.error("Error: ", err);
      return;
    }else{
      var query = "SELECT COMERCIO FROM DASH14467.PROSA GROUP BY COMERCIO";
      conn.query(query, function(err, rows){
        if(err){
          console.log("Error: ", err);
          return;
        }else {
          res.send(rows);
          conn.close(function(){
            console.log("Connection closed successfully");
          });
        }
      });
    }
  });
});

app.get('/api/v1/prosa/comercios/importe_promedio', function(req, res, next){
  ibmdb.open(connString, function(err, conn){
    if(err){
      console.error("Error: ", err);
      return;
    }else{
      var query = "SELECT COMERCIO, AVG(IMPORTE) AS IMPORTE_PROMEDIO FROM DASH14467.PROSA GROUP BY COMERCIO";
      conn.query(query, function(err, rows){
        if(err){
          console.log("Error: ", err);
          return;
        }else {
          res.send(rows);
          conn.close(function(){
            console.log("Connection closed successfully");
          });
        }
      });
    }
  });
});

app.get('/api/v1/prosa/comercios/resumen', function(req, res, next){
  ibmdb.open(connString, function(err, conn){
    if(err){
      console.error("Error: ", err);
      return;
    }else{
      var query = "SELECT COMERCIO, AVG(IMPORTE) AS IMPORTE_PROMEDIO, SUM(IMPORTE) AS IMPORTE_TOTAL FROM DASH14467.PROSA GROUP BY COMERCIO";
      conn.query(query, function(err, rows){
        if(err){
          console.log("Error: ", err);
          return;
        }else {
          res.send(rows);
          conn.close(function(){
            console.log("Connection closed successfully");
          });
        }
      });
    }
  });
});

app.get('/api/v1/prosa/topten/comercios_mas_ventas', function(req, res, next){
  ibmdb.open(connString, function(err, conn){
    if(err){
      console.error("Error: ", err);
      return;
    }else{
      var query = "SELECT COMERCIO, AVG(IMPORTE) AS IMPORTE_PROMEDIO, SUM(IMPORTE) AS IMPORTE_TOTAL FROM DASH14467.PROSA GROUP BY COMERCIO ORDER BY IMPORTE_TOTAL DESC FETCH FIRST 10 ROW ONLY";
      conn.query(query, function(err, rows){
        if(err){
          console.log("Error: ", err);
          return;
        }else {
          res.send(rows);
          conn.close(function(){
            console.log("Connection closed successfully");
          });
        }
      });
    }
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
