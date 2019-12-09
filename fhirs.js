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

  //
  var pathDataType = path.match((new RegExp("(.*)definitions\/")))[1]+"datatypes/";
  addDataTypes(pathDataType);

  var fs = require('fs'),
    readline = require('readline');


  fs.readdir(path, function(err, items) {
   
      for (var i=0; i<items.length; i++) {
          //console.log(items[i]);

          var ConceptName = items[i].replace(/\.ttl/, '');
          var modelo = new Schema()

          mongoose.model(ConceptName, modelo);
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

  //var fs = require('fs'),
    //readline = require('readline');

  options={version:"/v" , postCreate: (req, res, next) => {
      //console.log("ldldl");
      //console.log(req.erm.result);
//let context = {"fhir":"http://hl7.org/fhir/",
//"identifier": "fhir:Specimen.identifier",
//"status": "fhir:Specimen.status",
  //"subject":"fhir:Specimen.subject",
  //"request": "fhir:Specimen.request",
  //"processing": "fhir:Specimen.processing",
  //"processing.additive": "fhir:Specimen.processing.additive"};

  //////////////////////////////////////////////////////////////////////////
  //**************************************************************************
      ///////////////////////Asincronico///////////////////////////////
//*******************************************************************************
//////////////////////////////////////////////////////////////////////////////
      //console.log(req['originalUrl']);
      //let compacted = JSON.stringify(req.erm.result);
      //let compacted = req.erm.result;
      //console.log(compacted);

      let regexp = new RegExp(".*\/(.*)$");
      let result = req['originalUrl'].match(regexp);
      //console.log(result);
      let conceptName = result[1];

      /*

      function jsonldparse(conceptName, compacted, context, param, jsonIn){
        console.log("****************************************")
        console.log(ConceptName);
        console.log(param);
        //console.log(JSON.parse(JSON.stringify(req.erm.result))[param]);

        ------>>> let conceptSchema = require('mongoose').model(conceptName).schema;
        ------>>> console.log(conceptSchema.paths[param].path);


        //var type = typeof JSON.parse(JSON.stringify(req.erm.result))[param];
        var type = typeof JSON.parse(JSON.stringify(jsonIn))[param];
        if (type == "number") {
            // do stuff
        }
        else if (type == "string") {
            console.log("------------String---------------------String---------------------");
            console.log(param);
            if (param === "_id"){
              console.log("------------Id---------------------Id---------------------");
              compacted["@id"] = "fhir:"+conceptName+"#"+Array(req.erm.result)[0]["_id"];
            }else{
              context[param] = "fhir:"+conceptName+"."+param;
            }
            // do stuff
        }
        else if (type == "object") { // either array or object
          console.log("*****************************Object***************************");
          let compactedObject = {};

          Object.keys( param ).forEach( function(paramObject , index) {
            jsonldparse(conceptName, compactedObject, context, paramObject);
          });
          //if (elem instanceof Buffer) {
          //}
        }
        return param;
      }


      let context = {};
      let jsonIn = JSON.parse(JSON.stringify(req.erm.result));
      Object.keys(jsonIn).forEach( function(param , index) {
          jsonldparse(conceptName, compacted, context,param, jsonIn);
      });
      */


      function jsonldparse(conceptName, schema ,compacted, context, paramIn, paramAcum, jsonIn){
        console.log("****************************************")
        console.log(paramIn);
        console.log(paramAcum);
        console.log(conceptName);
        //console.log("************jsonIn*********************")
        //console.log(jsonIn);

        //console.log("************Schema*********************")
        //console.log(schema);
        //console.log("****************************************")
        
        


        let jsonInObject = JSON.parse(JSON.stringify(jsonIn))[paramIn];
        //console.log(paramIn);
        //console.log(jsonInObject);

        //var type = typeof JSON.parse(JSON.stringify(req.erm.result))[param];
        var type = typeof jsonInObject;
        if (type == "number") {
            // do stuff
        }
        else if (type == "string") {            
            console.log("------------String---------------------String---------------------");

            //console.log(paramIn);
            if (paramIn === "_id"){
              //console.log("------------Id---------------------Id---------------------");
              //console.log(conceptName);              
              
              //compacted["@type"]= "fhir:"+conceptName;
              compacted["@id"] = "fhir:"+schema.className+"#"+Array(jsonIn)[0]["_id"];
              compacted["@type"] = "fhir:"+schema.className;
            }else{
              if ( schema.ref == undefined){
                context[paramIn] = "fhir:"+schema.className+"."+paramIn;
                compacted[paramIn] = Array(jsonIn)[0][paramIn];
              }else{
                compacted["@id"] = "fhir:"+schema.className+"#"+Array(jsonIn)[0][paramIn];
                compacted["@type"] = "fhir:"+schema.className;
              }
            }
            // do stuff
        }
        else if (type == "object") { // either array or object
          console.log("****************************Object***************************");
                    
          compacted[paramIn] = {};          
          //let conceptSchema = require('mongoose').model(conceptName).schema;



          //let conceptSchema = require('mongoose').model(conceptName).schema;
          //console.log(paramIn);
          //console.log(jsonInObject);
          

          //console.log(conceptSchema.paths[paramIn].schema.className);


          //let classNameObject;
          //if ( conceptSchema.paths[paramIn].schema != undefined ){
          //    classNameObject = conceptSchema.paths[paramIn].schema.className;  
          //}



          Object.keys( jsonInObject ).forEach( function(param , index) {

            let compactedObject = {};
            let paramSchema;

            //Sentencia que debe ser corregida para que se pueda extraer el type desde el esquema.

            //let conceptNameObject = paramIn[0].toUpperCase() + paramIn.substring(1);

  //        console.log("--------PATH------------------");
            
            //compactedObject["@type"]= "fhir:"+param[0].toUpperCase() + param.substring(1);
            
            //console.log("-------- schema.paths ------------------");                        
            //console.log(param);
            //console.log("-----------------------------");
            //console.log(schema.paths);
            //console.log("-----------------------------");
            

            if ( schema.paths[paramIn] != undefined ){
              console.log("schema.paths : " + paramIn);
              paramSchema = schema.paths[paramIn].schema;
              
              jsonldparse(conceptName, paramSchema, compactedObject, context, param, param,jsonInObject);
            }
            else if ( schema.paths[paramAcum+"."+param] != undefined ){
              console.log("schema.paths paramAcum: "+paramAcum+"."+param);
              //console.log(paramAcum+"."+param);
              paramSchema = schema.paths[paramAcum+"."+param].schema
              console.log("Schema schema.paths paramAcum:");
              console.log(schema.paths[paramAcum+"."+param]);
              //
              if (paramSchema == undefined ){
                paramSchema = schema.paths[paramAcum+"."+param].options 
              }
              jsonldparse(conceptName, paramSchema, compactedObject, context, param, paramAcum+"."+param,jsonInObject);
            }else{
              console.log("Object.keys( jsonInObject ).forEach( function(param , index) { -> else")
              console.log("Schema -> "  + schema  );
              console.log("Schema -> "  + paramIn  );
              console.log("Schema -> "  + paramAcum  );
              console.log("Schema -> "  + param  );
              console.log("Schema -> "  + jsonInObject);

              jsonldparse(conceptName, schema, compactedObject, context, param, param,jsonInObject);
            }            
            compacted[paramIn] = Object.assign(compacted[paramIn],compactedObject);
          });
          //console.log("**********"+paramIn+"*******************Object***************************");
          //console.log(compactedObject);
          context[paramIn] = "fhir:"+schema.className+"."+paramIn;
          
          //compacted[paramIn]= JSON.parse(JSON.stringify(compactedObject));


          //if (elem instanceof Buffer) {
          //}
        }else{
          console.log("////////////Else/////////////////");
        }
        return compacted;
      }


      let context = {};
      let compacted = {};
      
      //Have the Json request
      let jsonIn = JSON.parse(JSON.stringify(req.erm.result));
      //Have the Schema of documents
      let conceptSchema = require('mongoose').model(conceptName).schema;
      conceptSchema.className = conceptName;
      //console.log(conceptSchema);
      Object.keys(jsonIn).forEach( function(param , index) {
          jsonldparse( conceptName, conceptSchema, compacted, context, param, param ,jsonIn);
      });

      //context = {"fhir":"http://hl7.org/fhir/", "status": "fhir:Specimen.status"};
      context["fhir"] = "http://hl7.org/fhir/";

      //console.log(req.erm.result);
      //compacted["@type"]= "fhir:"+conceptName;
      //console.log(Array(req.erm.result))
      //compacted["@id"]= "fhir:"+conceptName+"#"+Array(req.erm.result)[0]["_id"];
      compacted["@context"]= context;
      


      console.log(compacted);

      jsonld.expand(compacted, function(err, expanded) {
        /* Output:
        {
          "http://schema.org/name": [{"@value": "Manu Sporny"}],
          "http://schema.org/url": [{"@id": "http://manu.sporny.org/"}],
          "http://schema.org/image": [{"@id": "http://manu.sporny.org/images/manu.png"}]
        }
        */



        console.log(JSON.stringify(expanded));

        fetch("http://192.168.0.108:8080/rdf4j-server/repositories/fhir/statements", {
          method: 'post',
          headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': "application/ld+json;charset=UTF-8"
        },
          body: JSON.stringify(expanded)})
          .then(response => response)
          .then(jsondata => {
          console.log(jsondata);
            //this.setState({ text: jsondata.text });
          });
      });

      next()
    },
    postProcess: (req, res) => {
      const result = req.erm.result         // filtered object
      const statusCode = req.erm.statusCode // 200 or 201

      //console.info(`${req.method} ${req.path} request completed with status code ${statusCode}`)
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
  var referencesFile = "@prefix fhir:  <http://hl7.org/fhir/> . \n" +
  "@prefix owl:   <http://www.w3.org/2002/07/owl#> . \n" +
  "@prefix xsd:   <http://www.w3.org/2001/XMLSchema#> . \n" +
  "@prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#> . \n" +
  "@prefix dt:    <http://hl7.org/orim/datatype/> . \n" +
  "@prefix cs:    <http://hl7.org/orim/codesystem/> . \n" +
  "@prefix fhir-vs: <http://hl7.org/fhir/ValueSet/> . \n" +
  "@prefix ex:    <http://hl7.org/fhir/StructureDefinition/> . \n" +
  "@prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \n" +
  "@prefix rim:   <http://hl7.org/owl/rim/> . \n" +
  "@prefix dcterms: <http://purl.org/dc/terms/> . \n" +
  "@prefix vs:    <http://hl7.org/orim/valueset/> . \n" +
  "@prefix loinc: <http://loinc.org/rdf#> . \n" +
  "@prefix w5:    <http://hl7.org/fhir/w5#> . \n" +
  "@prefix dc:    <http://purl.org/dc/elements/1.1/> . \n\n";

  rd.on('line', function(line) {
      let resultJson = fhirsConceptTurtleToSchemaLine(conceptName, modelo, line);
      /*console.log((resultJson != undefined) ? resultJson : "Result null ");
      console.log((resultJson != undefined) ? JSON.parce(resultJson) : "Result null ");
      console.log((resultJson != undefined) ? resultJson.lenght !== undefined : "Result null ");*/
      //console.log(resultJson.lenght !== undefined)
      if (resultJson != null ){
        if ( jsonFile.properties != undefined && jsonFile.properties.length != 0 ){
      //    console.log(jsonFile);
      //    console.log(Object.keys(jsonFile).lenght);
          //console.log("****************hhhhhhhhhhhhhhhhhhhh      "+ conceptName +"   " + line + "**********************************");
          let jsonFilePointer = jsonFile.properties;
          let resultJsonPointer = resultJson.properties;
          //console.log("resultJsonPointer  :"+resultJsonPointer);
          let endParameter = false;
          while (!endParameter){
            if (jsonFilePointer[Object.keys(resultJsonPointer)[0]] != undefined && resultJsonPointer[Object.keys(resultJsonPointer)[0]]["items"] != undefined){
              jsonFilePointer = jsonFilePointer[Object.keys(resultJsonPointer)[0]]["items"]["properties"];
              resultJsonPointer = resultJsonPointer[Object.keys(resultJsonPointer)[0]]["items"]["properties"];
            }else{
              endParameter = true;
            }
          }

          Object.assign(jsonFilePointer, resultJsonPointer);
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
         
            let uiFilePointer = uiFile;
            let resultUIPointer = resultJson.ui;
            //console.log("resultJsonPointer  :"+resultJsonPointer);
            let endParameter = false;
            while (!endParameter){
              if (uiFilePointer[Object.keys(resultUIPointer)[0]] != undefined && resultUIPointer[Object.keys(resultUIPointer)[0]]["items"] != undefined){
                uiFilePointer = uiFilePointer[Object.keys(resultUIPointer)[0]]["items"];
                resultUIPointer = resultUIPointer[Object.keys(resultUIPointer)[0]]["items"];
              }else{
                endParameter = true;
              }
            }
            Object.assign(uiFilePointer, resultUIPointer);
            //Object.assign(uiFile , resultJson.ui);
          }else{
            uiFile = resultJson.ui;
          }
          //console.log("****************" +"definitions" +"**********************************");          
        }
        //console.log("****************" +"definitions" +"**********************************");          
        //console.log(jsonFile)

        if (resultJson.rules  != undefined ){
          if (resultJson.rules.length == 0 ){
            
          } 
          ///////////REVISA SI YA TENIA REGLAS /////////////////////////////
          if ( rulesFile != undefined ){
            rulesFile = rulesFile.concat(resultJson.rules);
          }else{
            rulesFile = resultJson.rules;
          }
          //console.log("*************RULESSSSSSSSSSS*************SSSSS****************");
//          console.log("*************RULESSSSSSSSSSS*************SSSSS****************");
//          console.log("*************RULESSSSSSSSSSS*************SSSSS****************");
//          console.log(resultJson.rules);
          //console.log("****************" +"definitions" +"**********************************");          
        }


        if (resultJson.references  != undefined ){
          //console.log("referencesFile---------------------------------------------------");
          //console.log(referencesFile);
          for (var i=0; i<resultJson.references.length; i++){
              var parameterReference = resultJson.references[i].title +".type a owl:ObjectProperty ;\n\towl:propertyChainAxiom ( "+ resultJson.references[i].title +"  fhir:Reference.type ) .\n";
              var restrictionReference = resultJson.references[i].title +" rdfs:subClassOf [ \n\ta owl:Restriction ;\n\towl:onProperty "+ resultJson.references[i].title +".type "
              
              console.log("references---------------------------------------------------");
              console.log(referencesFile);
          

              for (var j=0; j<resultJson.references[i].concept.length; j++){
                restrictionReference = restrictionReference.concat(" ;\n\towl:someValuesFrom " + resultJson.references[i].concept[j]);
              }
              restrictionReference = restrictionReference.concat( " ] . \n\n");

              referencesFile = referencesFile.concat(parameterReference +"\n" + restrictionReference);
          };
          console.log(referencesFile);
                   
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

    //console.log("*************RULESSSSSSSSSSSSSSSS****************");
    //console.log("*************RULESSSSSSSSSSSSSSSS****************");
    //console.log("*************RULESSSSSSSSSSSSSSSS****************");
    //console.log(rulesFile);
    let dataRules = JSON.stringify(rulesFile); 
    //console.log("*************RULESSSSSSSSSSSSSSSS****************");
    //console.log("*************RULESSSSSSSSSSSSSSSS****************");
    //console.log("*************RULESSSSSSSSSSSSSSSS****************");
    //console.log(dataRules); 
    fs.writeFileSync("../FHIRS_Client/rules/"+conceptName+'.json', dataRules);

    var server = restify.serve(router, mongoose.model(conceptName, modelo), options);


    //console.log("*************References****************");
    //console.log("*************References****************");
    //console.log("*************References****************");
    fs.writeFileSync("references/"+conceptName+'.ttl', referencesFile);

  });
 

}


function addDataType(path){
  var fs = require('fs'),
    readline = require('readline');

  console.log(path)
  let regexp = new RegExp("^.*\/(.*)\.ttl");
  let result = path.match(regexp);
  var dataTypeName = result[1];
  //
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
    jsonFile = Object.assign(jsonFile, {title: dataTypeName, type: "object"});


    'use strict';
    let data = JSON.stringify(jsonFile);  
    fs.writeFileSync("../FHIRS_Client/definitions/"+dataTypeName+'.json', data);
    //process.exit(0);



  });

}


function fhirsConceptTurtleToSchemaLine(conceptName,schema, line){
  //console.log("#########fhirsConceptTurtleToSchemaLine###############");
  //console.log(conceptName);


  let regexpParam = new RegExp("^\\s*fhir:"+conceptName+"\\.(.*) \\[ ((.*) \\]((, \\.\\.\\.|;) .*# (.*)?)?)?");
  let resultParam = line.match(regexpParam);
  if (!(resultParam == null || resultParam == undefined)) {
    //console.log(result);
    //console.log(result[1]);
    

    //Definition of parse line.
    let stringExp = resultParam[0];
    let parameter = resultParam[1];//Parameter in line of conceptName.
    let parameterType = resultParam[3];//Type of parameter, it will be definition or datatype.
    let multiplicityParameter = resultParam[5];//Multiplicity of parmeter.
    let codesParameter = resultParam[6];



    //Definition the objects of definitions by the schemas
    let jsonObj = {}; //Object by mongodb.
    
    let valParameter = null;
    let schemaParameter = null;
    


    let schemaJson = {};
    schemaJson["properties"] = {};
    schemaJson["ui"] = {};
    schemaJson["references"] = [];
    let schemaJsonPointer = schemaJson["properties"];
    let schemaJsonUIPointer = schemaJson["ui"];

    ////////////////////////////////////////////////////////////
    // Mejorar la redaccion
    ///////////////////////////////////////////////////////////
    //Analyze subparameters and pointer in the jsons place.
    let parametersLeft = parameter.split(".");
    if(parametersLeft.length > 1) {
      for (var indexParameterLeft in parametersLeft ){
        if( indexParameterLeft < (parametersLeft.length-1) ){
          schemaJsonPointer[parametersLeft[indexParameterLeft]]={};
          schemaJsonPointer[parametersLeft[indexParameterLeft]]["items"] = {};
          schemaJsonPointer[parametersLeft[indexParameterLeft]]["items"]["properties"] = {};
          schemaJsonPointer = schemaJsonPointer[parametersLeft[indexParameterLeft]]["items"]["properties"];  

          schemaJsonUIPointer[parametersLeft[indexParameterLeft]]={};
          schemaJsonUIPointer[parametersLeft[indexParameterLeft]]["items"] = {};
          schemaJsonUIPointer = schemaJsonUIPointer[parametersLeft[indexParameterLeft]]["items"];       
        }else if (indexParameterLeft == (parametersLeft.length-1) ) {
          //Revisar por que seteo el parametro de entrada.
          parameter = parametersLeft[indexParameterLeft];
        }
      };
    }

//    if (parametersLeft.length > 1 ){

//    }

    switch (true) {
      case (parameterType == undefined ):
        //console.log("• Array =???????????????????????????");
//        console.log(stringExp);
//        console.log(parameter);
        schemaParameter = {"type": "array",  "items": {"type": "object" , "properties":{} }};
//        console.log(schemaParameter);
        schemaJsonPointer[parameter] = schemaParameter;

        break;
      case /^ *#.*/.test(stringExp):
        //////////////////////////////
        ////   PRINT BY SÉE result
        //////////////////////////////
        //console.log("• Matched Commment in code");
        break;
      case /code/.test(parameterType):
        console.log("• Matched code Code");
        //console.log(codesParameter);
        let matchResult = codesParameter.match(/\d (.*)/);
        let codes = [];
        if (matchResult != null){
          codes = matchResult[1].split(" | ");
        }
        if ( codes.length > 1 ){//Si es uno no tengo el enumerado aunque sea 1.
          if ( multiplicityParameter == ", ..."){
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
        jsonObj[parameter] = valParameter;
        
        schemaJsonPointer[parameter] = schemaParameter;
        break;
      case /string/.test(parameterType):
        //console.log("• Matched code string");
        if ( multiplicityParameter == ", ..."){
          valParameter = {type: [String]}
          schemaParameter = {type: "array",
                             items: {type: "string"
                           }};
        }else{
          valParameter = {type: String};
          schemaParameter = {type: "string"};
        }
        jsonObj[parameter] = valParameter;
        schemaJsonPointer[parameter] = schemaParameter;
        break;
      case /boolean/.test(parameterType):
        //console.log("• Matched code string");
        if ( multiplicityParameter == ", ..."){
          valParameter = {type: Boolean};
          schemaParameter = {type: "array",
                             itmes: {type: "boolean"
                           }};
        }else{
          valParameter = {type: Boolean};
          schemaParameter = {type: "boolean"};
        }
        
        jsonObj[parameter] = valParameter;
        schemaJsonPointer[parameter] = schemaParameter;
        break;
      case /decimal/.test(parameterType):
        //console.log("• Matched code string");
        if ( multiplicityParameter == ", ..."){
          valParameter = {type: Number};
          schemaParameter = {type: "array",
                             itmes: {type: "number"
                           }};
        }else{
          valParameter = {type: Number};
          schemaParameter = {type: "number"};
        }
        
        jsonObj[parameter] = valParameter;
        schemaJsonPointer[parameter] = schemaParameter;
        break;
      case /integer/.test(parameterType):
        //console.log("• Matched code string");
        if ( multiplicityParameter == ", ..."){
          valParameter = {type: Number};
          schemaParameter = {type: "array",
                             itmes: {type: "number"
                           }};
        }else{
          valParameter = {type: Number};
          schemaParameter = {type: "number"};
        }
        
        jsonObj[parameter] = valParameter;
        schemaJsonPointer[parameter] = schemaParameter;
        break;
      case /positiveInt/.test(parameterType):
        //console.log("• Matched code string");
        if ( multiplicityParameter == ", ..."){
          valParameter = {type: Number};
          schemaParameter = {type: "array",
                             itmes: {type: "number"
                           }};
        }else{
          valParameter = {type: Number};
          schemaParameter = {type: "number"};
        }
        
        jsonObj[parameter] = valParameter;
        schemaJsonPointer[parameter] = schemaParameter;
        break;
      case /unsignedInt/.test(parameterType):
        //console.log("• Matched code string");
        if ( multiplicityParameter == ", ..."){
          valParameter = {type: Number};
          schemaParameter = {type: "array",
                             itmes: {type: "number"
                           }};
        }else{
          valParameter = {type: Number};
          schemaParameter = {type: "number"};
        }
        
        jsonObj[parameter] = valParameter;
        schemaJsonPointer[parameter] = schemaParameter;
        break;
      case /dateTime/.test(parameterType):
        //console.log("• Matched code string");
        valParameter = {type: Date};
        schemaParameter = {type: "string", format: "date-time"}

        jsonObj[parameter] = valParameter;
        schemaJsonPointer[parameter] = schemaParameter;

        break;
      case /date/.test(parameterType):
        //console.log("• Matched code string");
        valParameter = {type: Date};
        

        jsonObj[parameter] = valParameter;
        schemaParameter = {type: "string", format: "date"}
        schemaJsonPointer[parameter] = schemaParameter;

        break;        
      case /uri/.test(parameterType):
        //console.log("• Matched uri DataType");
       if ( multiplicityParameter == ", ..."){
          valParameter = {type: [String]}
          schemaParameter = {type: "array",
                             items: {type: "string"
                           }};
        }else{
          valParameter = {type: String, 
                        validate: require('mongoose-validators').isURL()};
          schemaParameter = {type: "string"};
        }
        jsonObj[parameter] = valParameter;
        schemaJsonPointer[parameter] = schemaParameter;
        break;
      case /base64Binary/.test(parameterType):
        //console.log("• Matched uri DataType");
        valParameter = {type: String}
        jsonObj[parameter] = valParameter;

        schemaParameter = {type: "string", format: "data-url", title:parameter}
        schemaJsonPointer[parameter] = schemaParameter;

        break;
      case /Reference.*/.test(parameterType):
        console.log("• Matched Reference");
        let objectReference = parameterType.match(new RegExp("Reference.(.*)."))[1];
        console.log(objectReference);
        refs = objectReference.match(new RegExp("([A-Za-z]*\\|[A-Za-z]*)"));
        console.log("*****************Refs*******************");
        console.log(refs);

        //Si tiene mas de una referencia
        if (refs == null ){
          let autocomplete = {};

          if ( multiplicityParameter == ", ..."){
            valParameter = [{ type: Schema.Types.ObjectId, ref: objectReference }]
            valParameter["className"] = objectReference;
            jsonObj[parameter] = valParameter; 


            //Create the Schema client
            schemaParameter = {type: "string"};
            schemaJsonPointer[parameter] = { "type": "array",
                                                    "title": parameter, 
                                                    items: schemaParameter };

            //Create the UI Schema 
            let optionsAutocomplete;
            let conceptRequest = objectReference[0].toLowerCase() + objectReference.substring(1)
            //let paramMaps = parameter + "_id";
            autocomplete = { items: {"ui:field": "asyncTypeahead",
                                          "asyncTypeahead": {
                                            "url": "http://192.168.0.107:4000/api/v/" + conceptRequest + "?select=id",
                                            isLoading: false,
                                            options : optionsAutocomplete,
                                            labelKey: "_id",
                                            mapping: "_id"
                                          }
                                        }
                                      };

            
            schemaJson["references"].push({"title": " fhir:" + conceptName + "."+ resultParam[1], "concept":["fhir:"+objectReference]});

          }else{
            valParameter = { type: Schema.Types.ObjectId, ref: objectReference }
            valParameter["className"] = objectReference;
            jsonObj[parameter] = valParameter;

            //Create the Schema client
            schemaParameter = { type: "string"};
            schemaJsonPointer[parameter] = schemaParameter;

            //Create the UI Schema 
            let optionsAutocomplete;
            let domRequest = objectReference[0].toLowerCase() + objectReference.substring(1)
            //let paramMaps = parameter + "_id";
            autocomplete = {"ui:field": "asyncTypeahead",
                                  "asyncTypeahead": {
                                    "url": "http://192.168.0.107:4000/api/v/" + domRequest + "?select=id",
                                    isLoading: false,
                                    options : optionsAutocomplete,
                                    labelKey: "_id",
                                    mapping: "_id"
                                  }      
                                };

            schemaJson["references"].push({"title": " fhir:" + conceptName + "."+ resultParam[1], "concept":["fhir:"+objectReference]}); 

          }

                    
          schemaJsonUIPointer[parameter] = autocomplete;

          


        }else{ //Contains multiple references 
            
        //  valParameter = [{ type: Schema.Types.Mixed, refsList: refsList }]
        //  jsonObj[parameter] = [valParameter];

          //Create the schema server
          //valParameter = [{ type: Schema.Types.ObjectId, ref: objectReference }]

          let listRefs = objectReference.split("|")

          valParameter = { type: Schema.Types.ObjectId, refPath: 'dynamicModelType'+parameter};
          //Set the class name is "dynamicModelType".
          valParameter["className"] = "dynamicModelType";
          jsonObj[parameter] = valParameter; 

          let dmType = { type: String, enum:  listRefs };
          jsonObj["dynamicModelType"+parameter] = dmType;

          //Create the Schema client
          schemaDynamicParameter = {type: "string", "title": "Type of "+ parameter,enum: listRefs};
          schemaJsonPointer["dynamicModelType"+parameter] = schemaDynamicParameter;

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
            //nodeDp["properties"][parameter] =  { type: "string"};
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
          schemaJsonPointer[parameter] = schemaParameter;
          
         
          //Create the UI Schema 
          //Create the UI Schema 
          let optionsAutocomplete;

          autocomplete = { "ui:field": "asyncTypeahead",
                                "asyncTypeahead": {                                  
                                  isLoading: false,
                                  options : optionsAutocomplete,
                                  labelKey: "_id",
                                  mapping: "_id",
                                  //onChange: "dynamicModelType"
                                }
                              };

          schemaJsonUIPointer[parameter] = autocomplete;

          let sentenceRefs = [];
          //Create rules 
          let rules = [];
          listRefs.forEach( function(element){

            let parameterCond = {};
            parameterCond["dynamicModelType"+parameter] = { "is": element };
            let ruleConcept = {};          
            ruleConcept["conditions"] = parameterCond;

            let conceptURL = element[0].toLowerCase() + element.substring(1)
            let ruteURL = "http://192.168.0.7:4000/api/v/"+conceptURL+"?select=id";            
            let parameterEvent = {};
            parameterEvent[parameter] = { "asyncTypeahead": { "url": ruteURL}}; 
            ruleConcept["event"] = { "type": "uiAppend", "params": parameterEvent};

            rules.push(ruleConcept);

            sentenceRefs.push("fhir:"+element);

          });


          schemaJson["references"].push({"title": " fhir:" + conceptName + "."+ resultParam[1], "concept":sentenceRefs});



          console.log("schemaJson[rules] " + schemaJson["rules"]);
          schemaJson["rules"] = rules;

        }
        //console.log(valParameter);
        break;          
      default:
        //Is a dataType
        console.log("• Didn't match first level");
        valParameter = require('mongoose').model(parameterType).schema
        if ( valParameter == null ){
          valParameter = String;
        } else {
          //console.log("• Is DataType Valid.");
          console.log(parameterType);

          //console.log("////////** ira aca ??? ***  "+parameterType +"//////////");
          //Set the class name.
          valParameter["className"] = parameterType;
          jsonObj[parameter] = valParameter; 

          //Add reference at schema UI
          schemaParameter = {$ref: "#/definitions/"+parameterType, title: parameter};
          schemaJsonPointer[parameter] = schemaParameter;

          //Add definitions of the reference.
          schemaJson["definitions"] = {};
          schemaJson["definitions"][parameterType] = {};         
          
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


//Initial Script, 
/////////////////
//////////It must be parameterized
var pathDefinitions = "./definitions/"; //Parametro configurable
/////////////////
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
    //console.log(r.route.path)
  }
})





