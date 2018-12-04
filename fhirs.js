const express = require("express")
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const restify = require('express-restify-mongoose')
const app = express()
const router = express.Router()
const cors = require('cors');

app.use(bodyParser.json())
app.use(methodOverride())
app.use(cors())




// connect to database
//mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/fhirs', {
  useNewUrlParser: true
});
//mongoose.connect('mongodb://localhost:27017/fhirs');


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

  setTimeout(function()
    {
      fs.readdir(path, function(err, items) {
       
          for (var i=0; i<items.length; i++) {

              //addConcept(path + items[i]);
              addDefinitions(items[i].replace(/\.ttl/, ''))
          }
      });
    },10000);

}


function addDefinitions(conceptName){

  'use strict';

  const fs = require('fs');  

  let rawdata = fs.readFileSync("../FHIRS_Client/definitions/"+conceptName+'.json');  
  let objJson = JSON.parse(rawdata);  
  //console.log("*************************************************");
  //console.log(conceptName);  
  //console.log(objJson.definitions);  

  for(var i in objJson.definitions){
    var key = i;
    //console.log(i);
    let relationJson = JSON.parse(fs.readFileSync("../FHIRS_Client/definitions/"+i+'.json'));
    //console.log(relationJson);
    if (relationJson.definitions != undefined){
      for (var definition in relationJson.definitions ){
        //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
        //console.log(definition)
        //let definitionJson = JSON.parse(fs.readFileSync("../FHIRS_Client/definitions/"+definition+'.json'));     
            
        objJson.definitions[definition] = relationJson.definitions[definition];


/*
        if (definitiosAux != undefined ){
                
        }
        
        objJson.definitions[i] = definitionJson;
        
        if (definitiosAux != undefined ){
          for(var i in definitiosAux){
            objJson.definitions[i] = definitiosAux[i];
          }
        }

        */
        //console.log(definitiosAux);

      }
      delete relationJson["definitions"];
    }
    objJson.definitions[i] = relationJson;
    /*for(var j in val){
        var sub_key = j;
        var sub_val = val[j];
        console.log(sub_key);
    }*/
  }

  //console.log("****************addDefinitions**********************************");
  //console.log(objJson);


    'use strict';
    let data = JSON.stringify(objJson);  
    
    fs.writeFileSync("../FHIRS_Client/definitions/"+conceptName+'.json', data);
  //console.log(jsonFile);
  


  /*jsonFile = Object.assign(jsonFile, {title: conceptName, type: "object"})


  
*/
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


  setTimeout(function()
    {
      fs.readdir(path, function(err, items) {
       
          for (var i=0; i<items.length; i++) {

              //addConcept(path + items[i]);
              addDefinitions(items[i].replace(/\.ttl/, ''))
          }
      });
    },5000);


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
  //console.log(path)
  //console.log(conceptName);

  var modelo = require('mongoose').model(conceptName).schema;

  var rd = readline.createInterface({
      input: fs.createReadStream(path),
      output: process.stdout,
      console: false
  });

  var jsonFile = {};
  var uiFile = {};
  var rulesFile = [];

  rd.on('line', function(line) {
      let resultJson = fhirsConceptTurtleToSchemaLine(conceptName, modelo, line);
      /*console.log((resultJson != undefined) ? resultJson : "Result null ");
      console.log((resultJson != undefined) ? JSON.parce(resultJson) : "Result null ");
      console.log((resultJson != undefined) ? resultJson.lenght !== undefined : "Result null ");*/
      //console.log(resultJson.lenght !== undefined)
      if (resultJson != null ){
        if ( jsonFile.properties != undefined && jsonFile.properties.length != 0 ){
    //      console.log(jsonFile);
      //    console.log(Object.keys(jsonFile).lenght);
          //console.log("****************hhhhhhhhhhhhhhhhhhhh      "+ conceptName +"   " + line + "**********************************");
          Object.assign(jsonFile.properties, resultJson.properties)
        }
        else {
          //console.log("****************kkkkkkkkkkkkkkkkkkkkkkkkk      "+ conceptName +"   " + line + "**********************************");
          //console.log(resultJson);
          //console.log(resultJson.length);
          jsonFile.properties = resultJson.properties ;          
        }

        if (resultJson.definitions  != undefined ){
          if (resultJson.definitions.length == 0 ){
            
          } 
          ///////////REVISA SI YA TENIA UNA DEFINICIONES /////////////////////////////
          if ( jsonFile.definitions != undefined ){
            Object.assign(jsonFile.definitions , resultJson.definitions);
          }else{
            jsonFile.definitions = resultJson.definitions;
          }
          //console.log("****************" +"definitions" +"**********************************");          
        }

        //Add Dependecies Schema
        if (resultJson.dependencies  != undefined ){
          if (resultJson.dependencies.length == 0 ){
            
          } 
          ///////////REVISA SI YA TENIA UNA DEFINICIONES /////////////////////////////
          if ( jsonFile.dependencies != undefined ){
            Object.assign(jsonFile.dependencies , resultJson.dependencies);
          }else{
            jsonFile.dependencies = resultJson.dependencies;
          }
          //console.log("****************" +"definitions" +"**********************************");          
        }

        //Add UI Schema
        if (resultJson.ui  != undefined ){
          if (resultJson.ui.length == 0 ){
            
          } 
          ///////////REVISA SI YA TENIA UNA DEFINICIONES /////////////////////////////
          if ( uiFile != undefined ){
            Object.assign(uiFile , resultJson.ui);
          }else{
            uiFile = resultJson.ui;
          }
          //console.log("****************" +"definitions" +"**********************************");          
        }
        //console.log("****************" +"definitions" +"**********************************");          
        //console.log(jsonFile)d

        if (resultJson.rules  != undefined ){
          if (resultJson.rules.length == 0 ){
            
          } 
          ///////////REVISA SI YA TENIA UNA DEFINICIONES /////////////////////////////
          if ( rulesFile != undefined ){
            Object.assign(rulesFile , resultJson.rules);
          }else{
            rulesFile = resultJson.rules;
          }
          console.log("*************RULESSSSSSSSSSS*************SSSSS****************");
          console.log("*************RULESSSSSSSSSSS*************SSSSS****************");
          console.log("*************RULESSSSSSSSSSS*************SSSSS****************");
          console.log(resultJson.rules);
          //console.log("****************" +"definitions" +"**********************************");          
        }

      }
  });

  rd.on('close', function() {
    //console.log("****************hhhhhhhhhhhhhhhhhhhh**********************************");
    //console.log(jsonFile);
    jsonFile = Object.assign(jsonFile, {title: conceptName, type: "object"})

    'use strict';
    let data = JSON.stringify(jsonFile);  
    fs.writeFileSync("../FHIRS_Client/definitions/"+conceptName+'.json', data);
    //process.exit(0);

    let dataUi = JSON.stringify(uiFile);  
    fs.writeFileSync("../FHIRS_Client/ui/"+conceptName+'.json', dataUi);

    console.log("*************RULESSSSSSSSSSSSSSSS****************");
    console.log("*************RULESSSSSSSSSSSSSSSS****************");
    console.log("*************RULESSSSSSSSSSSSSSSS****************");
    console.log(rulesFile);
    let dataRules = JSON.stringify(rulesFile); 
    console.log("*************RULESSSSSSSSSSSSSSSS****************");
    console.log("*************RULESSSSSSSSSSSSSSSS****************");
    console.log("*************RULESSSSSSSSSSSSSSSS****************");
    console.log(dataRules); 
    fs.writeFileSync("../FHIRS_Client/rules/"+conceptName+'.json', dataRules);

    var server = restify.serve(router, mongoose.model(conceptName, modelo), options)

  });
 

}


function addDataType(path){
  var fs = require('fs'),
    readline = require('readline');

  let regexp = new RegExp("^.*\/(.*)\.ttl");
  let result = path.match(regexp);
  var dataTypeName = result[1];
  //console.log(path)
  //console.log(dataTypeName);

  
  let modelo = require('mongoose').model(dataTypeName).schema;

  let rd = readline.createInterface({
      input: fs.createReadStream(path),
      output: process.stdout,
      console: false
  });
  let jsonFile = {};
  rd.on('line', function(line) {
      let resultJson = fhirsConceptTurtleToSchemaLine(dataTypeName, modelo, line);
      //jsonFile = Object.assign(jsonFile, resultJson)



      if (resultJson != null ){
        if ( jsonFile.properties != undefined && jsonFile.properties.length != 0 ){
    //      console.log(jsonFile);
      //    console.log(Object.keys(jsonFile).lenght);
          //console.log("****************hhhhhhhhhhhhhhhhhhhh      "+ dataTypeName +"   " + line + "**********************************");
          Object.assign(jsonFile.properties, resultJson.properties)
        }
        else {
          //console.log("****************kkkkkkkkkkkkkkkkkkkkkkkkk      "+ dataTypeName +"   " + line + "**********************************");
          //console.log(resultJson);
          //console.log(resultJson.length);
          jsonFile.properties = resultJson.properties ;
        }

        if (resultJson.definitions  != undefined ){
          if (resultJson.definitions.length == 0 ){

          } 
          ///////////REVISAR SI YA TENIA UNA DEFINICION /////////////////////////////
          if ( jsonFile.definitions != undefined ){
            Object.assign(jsonFile.definitions , resultJson.definitions);
          }else{
            jsonFile.definitions = resultJson.definitions;
          }
          //console.log("****************" +"definitions" +"**********************************");          
        }
        //console.log("****************" +"definitions" +"**********************************");          
        //console.log(jsonFile)
        
      }





      //jsonFile.concat(resultJson);      
  })

  rd.on('close', function() {
    //console.log("****************hhhhhhhhhhhhhhhhhhhh**********************************");
    //console.log(jsonFile);
    jsonFile = Object.assign(jsonFile, {title: dataTypeName, type: "object"})


    'use strict';
    let data = JSON.stringify(jsonFile);  
    fs.writeFileSync("../FHIRS_Client/definitions/"+dataTypeName+'.json', data);
    //process.exit(0);



  });

}


function fhirsConceptTurtleToSchemaLine(conceptName,schema, line){
  //console.log("#########fhirsConceptTurtleToSchemaLine###############");
  //console.log(conceptName);


  let regexp = new RegExp(".*fhir:"+conceptName+"\\.(.*) \\[ (.*) \\](, \\.\\.\\.|;) .*# (.*)?");
  let result = line.match(regexp);
  if (!(result == null || result == undefined)) {
    //console.log(result);
    //console.log(result[1]);
    


    let parameter = result[1];
    let jsonObj = {};
    let schemaJson = {};
    let valParameter = null;
    let schemaParameter = null;


    switch (true) {
      case /^ *#.*/.test(result[0]):
        //console.log("• Matched Commment in code");
        break;
      case /code/.test(result[2]):
        //console.log("• Matched code DataType");
        let codes = (result[4].match(/\d (.*)/)[1]).split(" | ");
        if ( codes.length > 1 ){
          if ( result[3] == ", ..."){
            valParameter = {type: [String],
                            enum: codes};
            schemaParameter = {type: "array",
                               itmes: {type: "string",
                            enum: codes}};
          } else {
            valParameter = {type: String,
                            enum: codes};
            schemaParameter = {type: "string",
                            enum: codes};
          }
        }else{
            valParameter = {type: String};
            schemaParameter = {type: "string"};
        }
        jsonObj[result[1]] = valParameter;
        schemaJson["properties"] = {};
        schemaJson["properties"][result[1]] = schemaParameter;
        break;
      case /string/.test(result[2]):
        //console.log("• Matched code string");
        if ( result[3] == ", ..."){
          valParameter = {type: [String]}
          schemaParameter = {type: "array",
                             itmes: {type: "string"
                           }};
        }else{
          valParameter = {type: String};
          schemaParameter = {type: "string"};
        }
        jsonObj[result[1]] = valParameter;
        schemaJson["properties"] = {};
        schemaJson["properties"][result[1]] = schemaParameter;
        break;
      case /boolean/.test(result[2]):
        //console.log("• Matched code string");
        if ( result[3] == ", ..."){
          valParameter = {type: Boolean};
          schemaParameter = {type: "array",
                             itmes: {type: "boolean"
                           }};
        }else{
          valParameter = {type: Boolean};
          schemaParameter = {type: "boolean"};
        }
        
        jsonObj[result[1]] = valParameter;
        schemaJson["properties"] = {};
        schemaJson["properties"][result[1]] = schemaParameter;
        break;
      case /decimal/.test(result[2]):
        //console.log("• Matched code string");
        if ( result[3] == ", ..."){
          valParameter = {type: Number};
          schemaParameter = {type: "array",
                             itmes: {type: "number"
                           }};
        }else{
          valParameter = {type: Number};
          schemaParameter = {type: "number"};
        }
        
        jsonObj[result[1]] = valParameter;
        schemaJson["properties"] = {};
        schemaJson["properties"][result[1]] = schemaParameter;
        break;
      case /dateTime/.test(result[2]):
        //console.log("• Matched code string");
        valParameter = {type: Date};
        schemaParameter = {type: "string", format: "date"}

        jsonObj[result[1]] = valParameter;
        schemaJson["properties"] = {};
        schemaJson["properties"][result[1]] = schemaParameter;

        break;        
      case /uri/.test(result[2]):
        //console.log("• Matched uri DataType");
        valParameter = {type: String, 
                        validate: require('mongoose-validators').isURL()};
        jsonObj[result[1]] = valParameter;
        break;
      case /Reference.*/.test(result[2]):
        console.log("• Matched Reference");
        let objectReference = result[2].match(new RegExp("Reference.(.*)."))[1];
        //console.log(objectReference);
        refs = objectReference.match(new RegExp("([A-Za-z]*\\|[A-Za-z]*)"));
        console.log("*****************Refs*******************");
        console.log(refs);

        if (refs == null ){
          let autocomplete = {};
          if ( result[3] == ", ..."){
                        valParameter = [{ type: Schema.Types.ObjectId, ref: objectReference }]
            jsonObj[result[1]] = valParameter; 


            //Create the Schema client
            schemaParameter = {type: "string"};
            schemaJson["properties"] = {};
            schemaJson["properties"][result[1]] = { "type": "array",
                                                    "title": result[1], 
                                                    items: schemaParameter };




            //Create the UI Schema 
            let optionsAutocomplete;
            let domRequest = objectReference[0].toLowerCase() + objectReference.substring(1)
            //let paramMaps = result[1] + "_id";
            autocomplete = { items: {"ui:field": "asyncTypeahead",
                                          "asyncTypeahead": {
                                            "url": "http://192.168.56.1:4000/api/v/" + domRequest + "?select=id",
                                            isLoading: false,
                                            options : optionsAutocomplete,
                                            labelKey: "_id",
                                            mapping: "_id"
                                          }
                                        }
                                      };
            
          }else{
            //Create the schema server          
            valParameter = { type: Schema.Types.ObjectId, ref: objectReference }
            jsonObj[result[1]] = valParameter;

            //Create the Schema client
            schemaParameter = { type: "string"};
            schemaJson["properties"] = {};
            schemaJson["properties"][result[1]] = schemaParameter;

            //Create the UI Schema 
            let optionsAutocomplete;
            let domRequest = objectReference[0].toLowerCase() + objectReference.substring(1)
            //let paramMaps = result[1] + "_id";
            autocomplete = {"ui:field": "asyncTypeahead",
                                  "asyncTypeahead": {
                                    "url": "http://192.168.56.1:4000/api/v/" + domRequest + "?select=id",
                                    isLoading: false,
                                    options : optionsAutocomplete,
                                    labelKey: "_id",
                                    mapping: "_id"
                                  }      
                                };

          }

          
          
          schemaJson["ui"] = {};
          schemaJson["ui"][result[1]] = autocomplete;


        }else{
            
        //  valParameter = [{ type: Schema.Types.Mixed, refsList: refsList }]
        //  jsonObj[result[1]] = [valParameter];

          //Create the schema server
          //valParameter = [{ type: Schema.Types.ObjectId, ref: objectReference }]

          let listRefs = objectReference.split("|")

          valParameter = { type: Schema.Types.ObjectId, refPath: 'dynamicModelType'};
          jsonObj[result[1]] = valParameter; 

          let dmType = { type: String, enum:  listRefs };
          jsonObj["dynamicModelType"] = dmType;

          //Create the Schema client
          schemaDynamicParameter = {type: "string", enum: listRefs};
          schemaJson["properties"] = {};
          schemaJson["properties"]["dynamicModelType"] = schemaDynamicParameter;

          //Dynamic Parameter
          //schemaJson["properties"]["dynamicModelType"]["onChange"] = onChangeDynamic;

          //Dependencies
          //let dependencies = {};
          //let listDependecies = [];
          //let indixDp = 0;
          //for ( let dp in listRefs ){ 
            //let nodeDp = {"properties": { 
                //"dynamicModelType": {
                    //"enum": [ listRefs[dp] ]
                //}
              //}
            //}
            //nodeDp["properties"][result[1]] =  { type: "string"};
            //listDependecies[indixDp] = nodeDp;
            //indixDp++;  
          //}
//
          //let oneOfDp = {};
          //oneOfDp["oneOf"] = listDependecies;
          //dependencies["dynamicModelType"] = oneOfDp; 
//          schemaJson["dependencies"] = dependencies;

          //Rules

          schemaParameter = { type: "string"};         
          schemaJson["properties"][result[1]] = schemaParameter;
          
         
          //Create the UI Schema 
          //Create the UI Schema 
          let optionsAutocomplete;

          //let domRequest = objectReference[0].toLowerCase() + objectReference.substring(1)
          //let paramMaps = result[1] + "_id";
          autocomplete = { "ui:field": "asyncTypeahead",
                                "asyncTypeahead": {                                  
                                  isLoading: false,
                                  options : optionsAutocomplete,
                                  labelKey: "_id",
                                  mapping: "_id",
                                  //onChange: "dynamicModelType"
                                }
                              };

          schemaJson["ui"] = {};
          schemaJson["ui"][result[1]] = autocomplete;

          

          //Create rules 
          let rules = [];
          listRefs.forEach( function(element){

            let parameterCond = {};
            parameterCond["dynamicModelType"] = { "is": element };
            let ruleConcept = {};          
            ruleConcept["conditions"] = parameterCond;


            let conceptURL = element[0].toLowerCase() + element.substring(1)
            let ruteURL = "http://192.168.56.1:4000/api/v/"+conceptURL+"?select=id";            
            let parameterEvent = {};
            parameterEvent[result[1]] = { "asyncTypeahead": { "url": ruteURL}}; 
            ruleConcept["event"] = { "type": "uiAppend", "params": parameterEvent};

            rules.push(ruleConcept);
          });

          schemaJson["rules"] = rules;

        }
        //console.log(valParameter);
        break;       
      default:
        //console.log("• Didn't match first level");
        valParameter = require('mongoose').model(result[2]).schema
        if ( valParameter == null ){
          //console.log("• Didn't match any test");
          valParameter = String;
        } else {
          //console.log("• Is DataType Valid.");
          //console.log(result[2]);
          jsonObj[result[1]] = valParameter; 

          schemaParameter = {$ref: "#/definitions/"+result[2], title: result[2]};
          schemaJson["properties"] = {};
          schemaJson["properties"][result[1]] = schemaParameter;

          
          schemaJson["definitions"] = {};
          schemaJson["definitions"][result[2]] = {};         
          
        }
        break;
    }

    if (jsonObj != {}){
      //console.log("Add parameter " + jsonObj);

      let schemaVar = require('mongoose').model(conceptName).schema.add(jsonObj);
    }

    //console.log(schemaJson);
    //console.log(Object.keys(schemaJson).length );
    if (Object.keys(schemaJson).length != 0 ) {
        //console.log(schemaJson);
        return schemaJson;  
    }else{
      return null;
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

  let schema = require('mongoose').model('Specimen').schema;
  

  var jsonSchemaGenerator = require('json-schema-generator'),
    obj = { some: { object: true } },
    schemaObj;
 
  schemaObj = jsonSchemaGenerator(schema);

  if ( schemaObj != null )
    return res.json({ schema });
  else
    return res.json({error:"No existe el schema"})
  


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

app.listen(4000, () => {
  console.log('Express server listening on port 4000')
})




app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(r.route.path)
  }
})





