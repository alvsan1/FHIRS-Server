const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
function routerFhir(){
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
	return router
}
module.exports = routerFhir;

