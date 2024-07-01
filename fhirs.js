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
const routes = require('./routes');
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





