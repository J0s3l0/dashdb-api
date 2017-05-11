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
var queries = require('./json/queries.json');
var cors = require('cors');
var app = express();

app.use(cors());


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
  res.json({api_version: '1.0'});
})

app.get('/api/v1/engines/customers', routes.apicall(ibmdb,connString, queries.engines.customers));

app.get('/api/v1/engines/damage_per_flight', routes.apicall(ibmdb,connString, queries.engines.damage_per_flight));

app.get('/api/v1/engines/ex50b/core_speed', routes.apicall(ibmdb,connString, queries.engines.core_speed));

app.get('/api/v1/prosa/comercios', routes.apicall(ibmdb,connString, queries.prosa.comercios));

app.get('/api/v1/prosa/comercios/importe_promedio', routes.apicall(ibmdb,connString, queries.prosa.comercios_importe_promedio));

app.get('/api/v1/prosa/comercios/resumen', routes.apicall(ibmdb,connString, queries.prosa.comercios_resumen));

app.get('/api/v1/prosa/topten/comercios_mas_ventas', routes.apicall(ibmdb,connString, queries.prosa.comercios_top_ten));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
