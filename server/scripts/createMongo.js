// Import Types
const types = require("./types.json");

// Import packages
const Handlebars = require("handlebars");
const xml2js = require('xml2js');
const fs = require('fs');
const parser = new xml2js.Parser({ attrkey: "attr" });
// Import Model template
const template = Handlebars.compile(fs.readFileSync("./templates/mongo-schema.template", "utf8"));

var objectName;
var jsonData= "{ ";
//XML Files anhand des uebergebenen Parameters einlesen
for (let i = 2; i < process.argv.length; i++) {
    let xmlString = fs.readFileSync("./objects/" + process.argv[i], "utf8");
    //Ergebnisse Parsen und SQL Statment erstellen
    parser.parseString(xmlString, function (error, result) {
        if (error === null) {
            objectName = result.object['attr'].name;
            result.object.section.forEach((element, index) => {
                element.input.forEach((input, index) => {
                    //name fuer Spalte in der Datenbank festlegen
                    let attributeName;
                    if (input['attr'].object) {
                        attributeName = input['attr'].object;
                    } else {
                        attributeName = input.label;
                    }
                    //label fuer die Datenbank zu LowerCase umwandeln
                    attributeName = attributeName.toString().toLowerCase();
                    //leerzeichen durch _ ersetzen
                    if (attributeName.includes(" ")) {
                        attributeName = attributeName.replace(" ", "_");
                    }
                    jsonData += attributeName + ": {";
                    jsonData += '"type": ' + input['attr'].type;
                    if (input['attr'].required === 'true') {
                        jsonData += ', "required": "{PATH} is required!"';
                    }
                    jsonData += "}";
                    if (index !== element.input.length - 1) {
                        jsonData += ","
                    }
                });
                if (index !== result.object.section.length - 1) {
                    jsonData += ","
                }
            });
        };
    });
};

jsonData += '}';

// Daten verpacken
var data = {
    "name": objectName,
    "nameLc": objectName.toLowerCase(),
    "jsonData": jsonData
}
// Template befüllen
var newModelFile = template(data);
// Model als Datei ausgeben
fs.writeFile(objectName +".js", newModelFile, (err) => {
    if (err) throw err;
    console.log('New Model saved!');
});