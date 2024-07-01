const mongoose = require('mongoose');
const { Schema } = mongoose;

function jsonldparse(conceptName, schema ,compacted, context, paramIn, paramAcum, jsonIn){
        console.log("****************************************")
        console.log("///////////////// ConceptName : "+conceptName); 
        //console.log("----------------------------- schema :" + JSON.stringify(schema));
        //console.log("=============== context : " + JSON.stringify(context));
        console.log("________________ paramIn : "+ paramIn);
        //console.log("#############################paramAcum"+paramAcum);
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ jsonIn : " + JSON.stringify(jsonIn));


        let jsonInObject = JSON.parse(JSON.stringify(jsonIn))[paramIn];
        var type = typeof jsonInObject;
        console.log("-----------------Type-----------:" + type)
        if (type == "number") {
            // To do: stuff
        }
        else if (type == "string") {            
            //console.log("------------String---------------------String---------------------");

            if (paramIn === "_id"){
              console.log("-----------1")
              if (schema != undefined){
                console.log("-----------2")
                compacted["@id"] = "fhir:"+schema.className+"#"+Array(jsonIn)[0]["_id"];
                compacted["@type"] = ["fhir:"+schema.className, "http://www.w3.org/2002/07/owl#Thing"];
              }
            }else{
              if ( schema.ref == undefined){
                //Clave valor {parametro: valor}
                console.log("-----------3")
                //console.log("--------------////////////--------------schema.ref == undefined")
                //console.log("---------------------------------paramAcum : " + paramAcum)
                context[paramIn] = "fhir:"+schema.className+"."+paramIn;
                compacted[paramIn] = Array(jsonIn)[0][paramIn];
              }else{
                console.log("-----------4")
                compacted["@id"] = "fhir:"+schema.className+"#"+Array(jsonIn)[0][paramIn];
                compacted["@type"] = ["fhir:"+schema.className, "http://www.w3.org/2002/07/owl#Thing"];
              }
            }
            // To do: stuff
        } else if (typeof jsonInObject[0] == "string"){
          console.log("//////////////////////// 5")
          context[paramIn] = "fhir:"+schema.className+"."+paramIn;
          compacted[paramIn] = jsonInObject;
        }
        else if (type == "object") { // either array or object
          //console.log("****************************Object***************************"); 

          //If isn't array inicialize object
          if (!/\d+/.test( paramIn )){
            console.log("##################### 6.0 paramIn : " + paramIn)
            //console.log("##################### schema" +  JSON.stringify(schema))
            if (schema.paths[paramIn].instance == 'Array' ){
              compacted[paramIn] = [];
            }else{
              compacted[paramIn] = {};
            }           
          }               
          let compactedObject = {};
          //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%jsonInObject  :  "+JSON.stringify(jsonInObject));
          Object.keys( jsonInObject ).forEach( function(param , index) {
            console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  Object.keys");
            let paramSchema;
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!  compacted : " + JSON.stringify(compacted));
            if ( schema.tree[param] != undefined ){
              console.log("schema.tree : " + paramIn);
              console.log("schema.tree param : " + param);
              //console.log("schema.paths[paramIn] : " + JSON.stringify(schema.paths[param]))
              if (schema.tree[param].schema != undefined ){
                console.log("(((((((((((((((((((( 6")
                jsonldparse(conceptName, schema.tree[param].schema, compactedObject, context, param, param,jsonInObject);
              }else if (/\d+/.test( paramIn ) ){
                //Array
                console.log("(((((((((((((((((((( 7")
                //console.log("######################## schema : " + JSON.stringify(schema))
                jsonldparse(schema.className, schema, compactedObject, context, param, paramAcum,jsonInObject);  
                console.log("***************************  compactedObject 7: " + JSON.stringify(compactedObject))        
              }else{
                console.log("(((((((((((((((((((( 8")
                jsonldparse(conceptName, schema.tree[paramIn], compactedObject, context, param, param,jsonInObject);
              }
              
            }
            else if ( schema.tree[paramAcum+"."+param] != undefined ){
             console.log("schema.tree paramAcum: "+paramAcum+"."+param);
             // paramSchema = schema.tree[paramAcum+"."+param].schema
              /*console.log("Schema schema.paths paramAcum:");
              console.log(schema.paths[paramAcum+"."+param]);*/
              //
              if (paramSchema == undefined ){
                paramSchema = schema.tree[paramAcum+"."+param].options 
              }
              jsonldparse(conceptName, paramSchema, compactedObject, context, param, paramAcum+"."+param,jsonInObject);
            }else{
              //The Object is a Array
              console.log("The Object is a Array.");
              let schemaNameIn = schema.tree[paramIn][0].match(/\[(.*?)\]/)[1];
              schemaIn = require('mongoose').model(schemaNameIn).schema;
              schemaIn["className"] = schemaNameIn;
              //console.log("''''''''''''''''''''''''''' SchemaIn" + JSON.stringify(schemaIn));
              //console.log("++++++++++++++++++++++++++ schemaIn : " require('mongoose').model(schema.tree[paramIn][0]).schema)
              //console.log("Schema -> "  + JSON.stringify(schema)  );
              /*console.log("paramIn -> "  + paramIn  );
              console.log("paramAcum -> "  + paramAcum  );
              console.log("param -> "  + param  );
              console.log("jsonInObject -> "  + jsonInObject);*/


              compactedObject = jsonldparse(conceptName, schemaIn, compactedObject, context, param, paramIn,jsonInObject);
              console.log("////////////////////////// 09")
            }
            console.log("?????????????????????????  compacted[paramIn] 10: " + JSON.stringify(compacted[paramIn]));  
            console.log("?????????????????????????  paramIn 10: " + paramIn);
            if (/\d+/.test( paramIn)){
              // Array

              //Inicialize compacted Array
              if (!compacted[0] ) {
                console.log("#$#$#%#$%#%#")
                console.log(compacted)
                compacted = [];
              }
              console.log("////////////////////////// 12")
              // Insertar 'compactedObject' al principio del array
              console.log("?????????????????????????  compacted 12.1: " + JSON.stringify(compacted));
              console.log("?????????????????????????  compactedObject 12.1: " + JSON.stringify(compactedObject));
              //compacted[paramIn].unshift(compactedObject);

              if (compacted[paramIn]) {
                console.log("////////////////////////// 12.3")
                // Si ya existe y es un objeto, combinar los objetos
                compacted[paramIn] = Object.assign({}, compacted[paramIn], compactedObject);
              } else {
                  console.log("////////////////////////// 12.4")
                  console.log("////////////////////////// 12.4  paramIn :  "+ paramIn);
                  // Si no existe, asignar compactedObject directamente
                  compacted[paramIn] = compactedObject;
              }
              console.log("?????????????????????????  compacted 12.5: " + JSON.stringify(compacted));
            }else{
              console.log("////////////////////////// 13.1  compacted :  "+ JSON.stringify(compacted));
              console.log("////////////////////////// 13.1  paramIn :  "+ paramIn);
              console.log("?????????????????????????  compactedObject 13.1 : " + JSON.stringify(compactedObject));
              //compacted[paramIn] = Object.assign({},compacted[paramIn],compactedObject);
              compacted[paramIn] = compactedObject;
            }
            
            console.log("?????????????????????????  compacted 13.2: " + JSON.stringify(compacted));

          });
          if (!/\d+/.test( paramIn)){
            context[paramIn] = "fhir:"+schema.className+"."+paramIn;  
          }
        }else{
          console.log("////////////Else/////////////////");
        }
        console.log("?????????????????????????  paramIn 14: " + paramIn);
        console.log("?????????????????????????  compacted[paramIn] 14: " + JSON.stringify(compacted[paramIn])); 
        console.log("?????????????????????????  compacted 14: " + JSON.stringify(compacted)); 
        //Elimina parametros vacios
        if ((compacted[paramIn] == undefined) || (compacted[paramIn].length === 0)) {
          delete compacted[paramIn];
          delete context[paramIn];
        }
        
        return compacted;
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
    
    let valParameter;
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
        //console.log("• Matched code Code");
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
        //console.log(parameter)
        //console.log(multiplicityParameter == ", ...")
        if ( multiplicityParameter == ", ..."){
          valParameter = {type: ['[String]']};
          schemaParameter = {type: "array",
                             items: {type: "string"
                           }};
        }else{
          valParameter = {type: String};
          schemaParameter = {type: "string"};
        }
        jsonObj[parameter] = valParameter;
        //console.log("--------------------------parameter :" + parameter);
        //console.log(jsonObj);

        schemaJsonPointer[parameter] = schemaParameter;
        break;
      case /boolean/.test(parameterType):
        //console.log("• Matched code string");
        if ( multiplicityParameter == ", ..."){
          valParameter = {type: [Boolean]};
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
          valParameter = {type: [Number]};
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
          valParameter = {type: [Number]};
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
          valParameter = {type: [Number]};
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
          valParameter = {type: [Number]};
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
        if ( multiplicityParameter == ", ..."){
          valParameter = {type: [Date]};
          schemaParameter = {type: "array",
                             itmes: {type: "string", format: "date-time"
                           }};
        }else{
          //console.log("• Matched code string");
          valParameter = {type: Date};
          schemaParameter = {type: "string", format: "date-time"};
        }
        jsonObj[parameter] = valParameter;
        schemaJsonPointer[parameter] = schemaParameter;

        break;
      case /date/.test(parameterType):
        //console.log("• Matched code string");
        if ( multiplicityParameter == ", ..."){
          valParameter = {type: [Date]};
          schemaParameter = {type: "array",
                             itmes: {type: "string", format: "date"
                           }};
        }else{
          valParameter = {type: Date};
          schemaParameter = {type: "string", format: "date"}
        }
        jsonObj[parameter] = valParameter;
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
        if ( multiplicityParameter == ", ..."){
          valParameter = {type: [String]}
          schemaParameter = {type: "array",
                             items:{type: "string", format: "data-url", title:parameter}
                           };

        }else{
          valParameter = {type: String}
          schemaParameter = {type: "string", format: "data-url", title:parameter};                           
        }
        jsonObj[parameter] = valParameter;
        schemaJsonPointer[parameter] = schemaParameter;

        break;
      case /Reference.*/.test(parameterType):
        //console.log("• Matched Reference");
        let objectReference = parameterType.match(new RegExp("Reference.(.*)."))[1];
        //console.log(objectReference);
        refs = objectReference.match(new RegExp("([A-Za-z]*\\|[A-Za-z]*)"));
        //console.log("*****************Refs*******************");
        //console.log(refs);

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
                                            "url": "http://192.168.1.134:4000/api/v/" + conceptRequest + "?select=id",
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
                                    "url": "http://192.168.1.134:4000/api/v/" + domRequest + "?select=id",
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
            let ruteURL = "http://192.168.1.134:4000/api/v/"+conceptURL+"?select=id";            
            let parameterEvent = {};
            parameterEvent[parameter] = { "asyncTypeahead": { "url": ruteURL}}; 
            ruleConcept["event"] = { "type": "uiAppend", "params": parameterEvent};

            rules.push(ruleConcept);

            sentenceRefs.push("fhir:"+element);

          });


          schemaJson["references"].push({"title": " fhir:" + conceptName + "."+ resultParam[1], "concept":sentenceRefs});



          //console.log("schemaJson[rules] " + schemaJson["rules"]);
          schemaJson["rules"] = rules;

        }
        //console.log(valParameter);
        break;          
      default:
        //Is a dataType
        //console.log("• Didn't match first level");
        valParameter = require('mongoose').model(parameterType).schema
        if ( valParameter == null ){
          valParameter = String;
        } else {
          //console.log("• Is DataType Valid.");
          //console.log(parameterType);

          //console.log("////////** ira aca ??? ***  "+parameterType +"//////////");
          //Set the class name.
            
          if ( multiplicityParameter == ", ..."){
            //console.log("• Is Multiple DataType Valid.");
            //console.log("-------------------------- parameterType :" + parameterType)
            jsonObj[parameter] = ['['+parameterType+']'];
            //console.log("-------------------------- valParameter :" + valParameter)
            schemaParameter = {type: 'array',
                               ref: parameterType
                              }
            /*{type: "array",
                               items: {$ref: "#/definitions/"+parameterType, title: parameter}
                              };*/
          }else{
            jsonObj= {parameter :[parameterType]};
            schemaParameter = {$ref: "#/definitions/"+parameterType, title: parameter};
          }            
          //Add reference at schema UI          
          schemaJsonPointer[parameter] = schemaParameter;

          //Add definitions of the reference.
          schemaJson["definitions"] = {};
          schemaJson["definitions"][parameterType] = {};         
          
        }
        break;
    }

    if (jsonObj != {}){
      //console.log("Add parameter " + JSON.stringify(jsonObj, null, 2));
      //To do : Se podria hacer fuera el agregado al schema mongo
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

module.exports = {
  jsonldparse,
  fhirsConceptTurtleToSchemaLine
};