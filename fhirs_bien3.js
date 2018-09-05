const express = require("express")
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const restify = require('express-restify-mongoose')
const app = express()
const router = express.Router()

app.use(bodyParser.json())
app.use(methodOverride())



// connect to database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/fhirs', {
  useMongoClient: true,
});


Schema = mongoose.Schema;

function addModels(path){ 

  var pathDataType = path.match((new RegExp("(.*)definitions\/")))[1]+"datatypes/";
  addDataTypes(pathDataType);

  var fs = require('fs'),
    readline = require('readline');


  fs.readdir(path, function(err, items) {
   
      for (var i=0; i<items.length; i++) {
          //console.log(items[i]);

          var ConceptName = items[i].replace(/\.ttl/, '');
          var modelo = new Schema({
          })

          let dataType = mongoose.model(ConceptName, modelo);
      }
  });


  fs.readdir(path, function(err, items) {
   
      for (var i=0; i<items.length; i++) {

          addConcept(path + items[i]);          
      }
  });
}

function addDataTypes(path){ 
  var fs = require('fs'),
    readline = require('readline');


  fs.readdir(path, function(err, items) {
   
      for (var i=0; i<items.length; i++) {
          //console.log(items[i]);

          var dataTypeName = items[i].replace(/\.ttl/, '');
          var modelo = new Schema({
          })

          let dataType = mongoose.model(dataTypeName, modelo);
      }
  });

  fs.readdir(path, function(err, items) {
   
      for (var i=0; i<items.length; i++) {
          addDataType(path + items[i]);
      }
  });

}


function addConcept(path){

  var fs = require('fs'),
    readline = require('readline');

  options={version:"/v" , postRead: (req, res, next) => {
      console.log("ldldl")
      next()
    }
  }

  var fs = require('fs'),
    readline = require('readline');

  let regexp = new RegExp("^.*\/(.*)\.ttl");
  let result = path.match(regexp);
  var conceptName = result[1];
  console.log(path)
  console.log(conceptName);

  var modelo = require('mongoose').model(conceptName).schema;

  var rd = readline.createInterface({
      input: fs.createReadStream(path),
      output: process.stdout,
      console: false
  });

  rd.on('line', function(line) {
      fhirsConceptTurtleToSchemaLine(conceptName, modelo, line);
  });

  var server = restify.serve(router, mongoose.model(conceptName, modelo), options)

}


function addDataType(path){
  var fs = require('fs'),
    readline = require('readline');

  let regexp = new RegExp("^.*\/(.*)\.ttl");
  let result = path.match(regexp);
  var dataTypeName = result[1];
  console.log(path)
  console.log(dataTypeName);

  
  var modelo = require('mongoose').model(dataTypeName).schema;

  var rd = readline.createInterface({
      input: fs.createReadStream(path),
      output: process.stdout,
      console: false
  });

  rd.on('line', function(line) {
      fhirsConceptTurtleToSchemaLine(dataTypeName, modelo, line);
  });

}


function fhirsConceptTurtleToSchemaLine(conceptName,schema, line){
  console.log("#########fhirsConceptTurtleToSchemaLine###############");
  console.log(conceptName);


  let regexp = new RegExp(".*fhir:"+conceptName+"\\.(.*) \\[ (.*) \\](, \\.\\.\\.|;) .*# (.*)?");
  let result = line.match(regexp);
  if (!(result == null || result == undefined)) {
    console.log(result);
    console.log(result[1]);
    


    let parameter = result[1];
    let jsonObj = {};
    let valParameter = null;


    switch (true) {
      case /^ *#.*/.test(result[0]):
        console.log("• Matched Commment in code");
        break;
      case /code/.test(result[2]):
        console.log("• Matched code DataType");
        let codes = (result[4].match(/\d (.*)/)[1]).split(" | ");
        if ( codes.length > 1 ){
            valParameter = {type: String,
                            enum: codes};
        }else{
            valParameter = {type: String};
        }
        jsonObj[result[1]] = valParameter;
        break;
      case /string/.test(result[2]):
        console.log("• Matched code string");
        valParameter = {type: String};
        jsonObj[result[1]] = valParameter;
        break;
      case /boolean/.test(result[2]):
        console.log("• Matched code string");
        valParameter = {type: Boolean};
        jsonObj[result[1]] = valParameter;
        break;
      case /dateTime/.test(result[2]):
        console.log("• Matched code string");
        valParameter = {type: Date};
        jsonObj[result[1]] = valParameter;
        break;        
      case /uri/.test(result[2]):
        console.log("• Matched uri DataType");
        valParameter = {type: String, 
                        validate: require('mongoose-validators').isURL()};
        jsonObj[result[1]] = valParameter;
        break;
      case /Reference.*/.test(result[2]):
        console.log("• Matched Reference");
        let objectReference = result[2].match((new RegExp("Reference.(.*).")))[1];
        valParameter = [{ type: ObjectId, ref: objectReference }]
        jsonObj[result[1]] = [valParameter];
        break;       
      default:
        console.log("• Didn't match first level");
        valParameter = require('mongoose').model(result[2]).schema
        if ( valParameter == null ){
          console.log("• Didn't match any test");
          valParameter = String;
        } else {
          console.log("• Is DataType Valid.");
          jsonObj[result[1]] = valParameter;          
        }
        break;
    }

    if (jsonObj != {}){
      console.log("Add parameter " + jsonObj);

      let schemaVar = require('mongoose').model(conceptName).schema.add(jsonObj);
    }

  }
}

var pathDefinitions = "./definitions/"; //Parametro configurable
addModels(pathDefinitions);


/*

  BandSchema.virtual('members', {
    ref: 'Person', // The model to use
    localField: 'name', // Find people where `localField`
    foreignField: 'band', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false,
    options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
  });


*/


app.get('/', function (req, res, next) {

  let schema = require('mongoose').model('Specimen').schema.paths;  
  return res.json({ schema });

/*
   res.send({ hello: 'world' });
   next();*/
});

/*
app.get('/addParameter', function (req, res, next){
    //let specimenSchema = require('mongoose').model('Band').schema.add({fullName: String});
    let specimenSchema = require('mongoose').model('Band').schema.add({"fullName.descipton": String});
    return res.json({ specimenSchema });
});
*/


app.use(router)

app.listen(3000, () => {
  console.log('Express server listening on port 3000')
})




app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(r.route.path)
  }
})





