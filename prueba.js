const express = require("express")
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const restify = require('express-restify-mongoose')
const app = express()
const router = express.Router()
const cors = require('cors');
const jsonld = require('jsonld');
const fetch = require('node-fetch');
const sparqlupdate = "http://192.168.1.134:3030/fhir/?graph=http://hl7.org/fhir/"
//const autogen = require('swagger-autogen')({openapi: '3.0.0'});


app.use(bodyParser.json())
app.use(methodOverride())
app.use(cors())





// connect to database
//mongoose.Promise = global.Promise;
mongoose.connect('mongodb://10.0.2.15:27017/fhirs', {
  useNewUrlParser: true
});
const Schema = mongoose.Schema;

const HumanNameSchema = new Schema({
  use: { type: String },
  text: { type: String },
  family: { type: String },
  given: [{ type: String }],
  prefix: [{ type: String }],
  suffix: [{ type: String }],
  period: {
    start: { type: Date },
    end: { type: Date }
  }
});


const PatientSchema = new Schema({
  resourceType: { type: String, required: true },
  id: { type: String, required: true },
  name: [HumanNameSchema], // Aquí definimos name como un array de HumanName
  // otros campos del recurso Patient
});

const Patient = mongoose.model('Patient', PatientSchema);


let schema = require('mongoose').model('Patient').schema;

//console.log(JSON.stringify(schema, null, 2));

