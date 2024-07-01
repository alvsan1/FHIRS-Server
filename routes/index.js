const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', (req, res) => {
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

module.exports = router;

