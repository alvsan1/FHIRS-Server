module.exports = {
  db: {
    uri: 'mongodb://10.0.2.15:27017/fhirs',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  server: {
    port: 4000
  },
  sparqlUpdate: "http://192.168.1.134:3030/fhir/?graph=http://hl7.org/fhir/"
};