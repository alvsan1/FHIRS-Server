
const mongoose = require('mongoose');
const { Schema } = mongoose;
const fs = require('fs');
const {addConcept, addDefinitions} = require('../services/fhirService');
const {fhirsConceptTurtleToSchemaLine} = require('../utils/jsonldUtils')

function addModels(path, router){ 
	console.log("###################### " + path)
	console.log(path.match((new RegExp("(.*)definitions\/"))))
	var pathDataType = path.match((new RegExp("(.*)definitions\/")))[1]+"datatypes/";
	addDataTypes(pathDataType);

	var fs = require('fs'),
		readline = require('readline');


	fs.readdir(path, function(err, items) {   
		for (var i=0; i<items.length; i++) {
			var ConceptName = items[i].replace(/\.ttl/, '');
			var modelo = new Schema();
			mongoose.model(ConceptName, modelo);
	  	}
	});


	//To do : Por que no incluirlo en el for anterior
	fs.readdir(path, function(err, items) {   
		for (var i=0; i<items.length; i++) {
	    	addConcept(path + items[i], router);          
	  	}
	});

  	//This is 
  	setTimeout(function() {
		fs.readdir(path, function(err, items) {	   
	    	for (var i=0; i<items.length; i++) {
	          	//addConcept(path + items[i]);
	        	addDefinitions(items[i].replace(/\.ttl/, ''))
	      	}
		});
	},10000);
}

function addDataType(path){
  var fs = require('fs'),
    readline = require('readline');

  //console.log(path)
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

function addDataTypes(path){ 
	var fs = require('fs'),
	readline = require('readline');


	fs.readdir(path, function(err, items) {   
		for (var i=0; i<items.length; i++) {
			var dataTypeName = items[i].replace(/\.ttl/, '');
			var modelo = new Schema({});
			let dataType = mongoose.model(dataTypeName, modelo);
	  	}
	});

	fs.readdir(path, function(err, items) {
		for (var i=0; i<items.length; i++) {
	    	addDataType(path + items[i]);
	 	}
	});


	setTimeout(function() {
		fs.readdir(path, function(err, items) {
	       	for (var i=0; i<items.length; i++) {
				//addConcept(path + items[i]);
				addDefinitions(items[i].replace(/\.ttl/, ''))
			}
		});
	},5000);
}

module.exports = {
  addModels,
  addDataTypes
};