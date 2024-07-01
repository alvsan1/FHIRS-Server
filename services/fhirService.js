const express = require('express');
const app = express()
const fs = require('fs');
const mongoose = require('mongoose');
const restify = require('express-restify-mongoose')
const fetch = require('node-fetch');
const jsonld = require('jsonld');
const config = require('../config');
const { jsonldparse, fhirsConceptTurtleToSchemaLine } = require('../utils/jsonldUtils');

function addDefinitions(conceptName){

  'use strict';

  const fs = require('fs');  

  let objJson = JSON.parse(fs.readFileSync("../FHIRS_Client/definitions/"+conceptName+'.json'));  
  for(var i in objJson.definitions){
    var key = i;
    let relationJson = JSON.parse(fs.readFileSync("../FHIRS_Client/definitions/"+i+'.json'));
    if (relationJson.definitions != undefined){
      for (var definition in relationJson.definitions ){
        objJson.definitions[definition] = relationJson.definitions[definition];

      }
      delete relationJson["definitions"];
    }
    objJson.definitions[i] = relationJson;
  }

  let data = JSON.stringify(objJson);  
  fs.writeFileSync("../FHIRS_Client/definitions/"+conceptName+'.json', data);
}

function addConcept(path, router){

  options={version:"/v" , postCreate: (req, res, next) => {

      let regexp = new RegExp(".*\/(.*)$");
      let result = req['originalUrl'].match(regexp);
      //console.log("---------------------------")
      //console.log(result[1])
      var conceptName = result[1];
      console.log("++++++++++++++++++++++++++ ConceptName" + conceptName)
      


      let context = {};
      let compacted = {};
      
      //Have the Json request
      let jsonIn = JSON.parse(JSON.stringify(req.erm.result));
      //Have the Schema of documents
      //console.log(conceptName);
      let conceptSchema = require('mongoose').model(conceptName).schema;
      //To do : why i can set tge className ?
      conceptSchema.className = conceptName;
      /*console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$44-conceptSchema");
      console.log(conceptSchema);*/
      //console.log(jsonIn);
      Object.keys(jsonIn).forEach( function(param , index) {
        //console.log("+++++++++++++++++ Param : " + param)
        jsonldparse( conceptName, conceptSchema, compacted, context, param, param ,jsonIn);
      });

      //context = {"fhir":"http://hl7.org/fhir/", "status": "fhir:Specimen.status"};
      context["fhir"] = "http://hl7.org/fhir/";

      //console.log(req.erm.result);
      //compacted["@type"]= "fhir:"+conceptName;
      //console.log(Array(req.erm.result))
      //compacted["@id"]= "fhir:"+conceptName+"#"+Array(req.erm.result)[0]["_id"];
      compacted["@context"]= context;
      

      console.log("++++++++++++++++++++++ Compacted");
      console.log(JSON.stringify(compacted));

      jsonld.expand(compacted, function(err, expanded) {
        console.log(JSON.stringify(expanded));
        fetch(config.sparqlUpdate, {
          method: 'post',
          headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': "application/ld+json;charset=UTF-8"
        },
          body: JSON.stringify(expanded)})
          .then(response => response)
          .then(jsondata => {
          // console.log(jsondata);
          });
      });

      next()
    }/*,
    postProcess: (req, res) => {
      const result = req.erm.result         // filtered object
      const statusCode = req.erm.statusCode // 200 or 201     
    }
    ,preMiddleware: (req, res, next) => {
     // console.log(req);
      console.log(res);
    }*/
    ,onError: (err, req, res, next) => {
      const statusCode = req.erm.statusCode // 400 or 404

      res.status(statusCode).json({
        message: err.message
      })    
    }

  }

  var fs = require('fs'),
    readline = require('readline');

  let regexp = new RegExp("^.*\/(.*)\.ttl");
  let result = path.match(regexp);
  var conceptName = result[1];

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
      if (resultJson != null ){
        if ( jsonFile.properties != undefined && jsonFile.properties.length != 0 ){
          let jsonFilePointer = jsonFile.properties;
          let resultJsonPointer = resultJson.properties;
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
        }

        if (resultJson.rules  != undefined ){
          if (resultJson.rules.length == 0 ){
            
          } 
          ///////////REVISA SI YA TENIA REGLAS /////////////////////////////
          if ( rulesFile != undefined ){
            rulesFile = rulesFile.concat(resultJson.rules);
          }else{
            rulesFile = resultJson.rules;
          }        
        }


        if (resultJson.references  != undefined ){
          for (var i=0; i<resultJson.references.length; i++){
              var parameterReference = resultJson.references[i].title +".type a owl:ObjectProperty ;\n\towl:propertyChainAxiom ( "+ resultJson.references[i].title +"  fhir:Reference.type ) .\n";
              var restrictionReference = resultJson.references[i].title +" rdfs:subClassOf [ \n\ta owl:Restriction ;\n\towl:onProperty "+ resultJson.references[i].title +".type "
              
              /*console.log("references---------------------------------------------------");
              console.log(referencesFile);*/
          

              for (var j=0; j<resultJson.references[i].concept.length; j++){
                restrictionReference = restrictionReference.concat(" ;\n\towl:someValuesFrom " + resultJson.references[i].concept[j]);
              }
              restrictionReference = restrictionReference.concat( " ] . \n\n");

              referencesFile = referencesFile.concat(parameterReference +"\n" + restrictionReference);
          };
          //console.log(referencesFile);
                   
        }

      }
  });

  rd.on('close', function() {
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


module.exports = {
  addDefinitions,
  addConcept
};