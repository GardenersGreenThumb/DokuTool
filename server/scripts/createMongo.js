// Import Types
const types = require("./types.json");

//XMLParser und Fileread
const xml2js = require('xml2js');
const fs = require('fs');
const parser = new xml2js.Parser({ attrkey: "attr" });

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
                    attributeName = JSON.stringify(attributeName).toLowerCase();
                    //leerzeichen durch _ ersetzen
                    if (attributeName.includes(" ")) {
                        attributeName = attributeName.replace(" ", "_");
                    }
                    jsonData += JSON.stringify(attributeName) + ": {";
                    jsonData += '"type": ' + JSON.stringify(input['attr'].type);
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

fs.writeFile(objectName +".js", "var mongoose = require('mongoose'); const " + JSON.stringify(objectName).toLowerCase() +"Model = mongoose.Schema(" + jsonData + "); module.exports = mongoose.model(" + objectName + ", " + JSON.stringify(objectName).toLowerCase()  +"Model);");