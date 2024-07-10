const express = require("express")
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const router = express.Router()
const cors = require('cors');
const jsonld = require('jsonld');
const fetch = require('node-fetch');

const config = require('./config');
const models = require('./models');
const {routerFhir} = require('./routes');
//const sparqlupdate = "http://192.168.1.134:3030/fhir/?graph=http://hl7.org/fhir/"
//const autogen = require('swagger-autogen')({openapi: '3.0.0'});


const app = express()
app.use(bodyParser.json())
app.use(methodOverride())
app.use(cors())


// Conectar a la base de datos
mongoose.connect(config.db.uri, config.db.options);

// Añadir modelos
models.addModels('./definitions/', router);


router.get('/schema/identifier', (req, res) => {
    let schema = mongoose.model('Identifier').schema;
    var jsonSchemaGenerator = require('json-schema-generator'),
        obj = { some: { object: true } },
        schemaObj;
   
    schemaObj = jsonSchemaGenerator(schema);
    if (schemaObj) {
      res.json({ schema });
    } else {
      res.json({ error: "No existe el schema" });
    }
  });

router.get('/schema/humanname', (req, res) => {
    let schema = mongoose.model('HumanName').schema;
    var jsonSchemaGenerator = require('json-schema-generator'),
        obj = { some: { object: true } },
        schemaObj;
   
    schemaObj = jsonSchemaGenerator(schema);
    if (schemaObj) {
      res.json({ schema });
    } else {
      res.json({ error: "No existe el schema" });
    }
  });

router.get('/schema/geo', (req, res) => {
    let schema = mongoose.model('Geo').schema;
    var jsonSchemaGenerator = require('json-schema-generator'),
        obj = { some: { object: true } },
        schemaObj;
   
    schemaObj = jsonSchemaGenerator(schema);
    if (schemaObj) {
      res.json({ schema });
    } else {
      res.json({ error: "No existe el schema" });
    }
  });

router.get('/schema/address', (req, res) => {
    let schema = mongoose.model('Address').schema;
    var jsonSchemaGenerator = require('json-schema-generator'),
        obj = { some: { object: true } },
        schemaObj;
   
    schemaObj = jsonSchemaGenerator(schema);
    if (schemaObj) {
      res.json({ schema });
    } else {
      res.json({ error: "No existe el schema" });
    }
  });

router.get('/schema/patient', (req, res) => {
    let schema = mongoose.model('Patient').schema;
    var jsonSchemaGenerator = require('json-schema-generator'),
        obj = { some: { object: true } },
        schemaObj;
   
    schemaObj = jsonSchemaGenerator(schema);
    if (schemaObj) {
      res.json({ schema });
    } else {
      res.json({ error: "No existe el schema" });
    }
  });

// Configurar rutas
app.use(router);


app.listen(4000, () => {
  console.log('Express server listening on port 4000')
})




app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    //console.log(r.route.path)
  }
})





