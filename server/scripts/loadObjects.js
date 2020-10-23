//DB
var db = require('mysql');
var connection = db.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'dokutool'
})

// Import Types
const types = require("./types.json");

//XMLParser und Fileread
const xml2js = require('xml2js');
const fs = require('fs');
const parser = new xml2js.Parser({ attrkey: "attr" });

//XML Files anhand des uebergebenen Parameters einlesen
for (let i = 2; i < process.argv.length; i++) {
    let xmlString = fs.readFileSync("./objects/" + process.argv[i], "utf8");
    //Ergebnisse Parsen und SQL Statment erstellen
    parser.parseString(xmlString, function (error, result) {
        if (error === null) {
            var objectName = result.object['attr'].name;
            var sqlStatement = 'CREATE TABLE ' + objectName.toLowerCase() + "( id int NOT NULL AUTO_INCREMENT, ";
            var colums = [];
            result.object.section.forEach(element => {
                element.input.forEach(input => {
                    //name fuer Spalte in der Datenbank festlegen
                    let attributeName;
                    if (input['attr'].object) {
                        //ueberpruefen, ob Tabelle und damit Typ mit dem angegebenen Objectname existiert
                        connection.query("SHOW TABLES LIKE '" + JSON.parse(JSON.stringify(input['attr'].object).toLocaleLowerCase()) + "';", function (error, results) {
                            if (error) {
                                console.log(error);
                            } else {
                                if (results.length === 0) {
                                    console.log("Es existiert kein Typ mit dem Namen " + input['attr'].object + ". Bitte legen Sie zuerst einen Typen mit diesem Namen an bevor Sie ihn referenzieren.");
                                    process.exit();
                                }
                            }
                        });
                        attributeName = input['attr'].object;
                    } else {
                        attributeName = input.label;
                    }
                    //label fuer die Datenbank zu LowerCase umwandeln
                    attributeName = JSON.parse(JSON.stringify(attributeName).toLowerCase());
                    //leerzeichen durch _ ersetzen
                    if (JSON.stringify(attributeName).includes(" ")) {
                        attributeName = JSON.parse(JSON.stringify(attributeName).replace(" ", "_"));
                    }
                    var colum = attributeName + " ";
                    //angegebene Datentypen zu Datenbank Typen kovertieren
                    if (types[input['attr'].type] !== undefined) {
                        colum += types[input['attr'].type].sql;
                    } else {
                        throw "Es konnte kein Typ mit dem Namen " + input['attr'].type + " gefunden werden.";
                    }
                    if (input['attr'].required === 'true') {
                        colum += " NOT NULL"
                    }
                    colums.push(colum);
                });
            });
            // zu erstellende Colums dem SQLStatement anhängen
            colums.forEach(colum => {
                sqlStatement += colum + ", ";
            })
            sqlStatement += " PRIMARY KEY (id) );";
            // console.log(sqlStatement);
            //Tabelle mit Namen und Colums in der Db anglegen
            connection.query(sqlStatement, function (error, results) {
                if (error) {
                    if (error.errno === 1050) {
                        console.log('Fehler: Es existiert bereits eine Tabelle mit dem Namen ' + objectName + ' in der Datenbank.');
                    } else {
                        console.log(error);
                    }
                } else {
                    console.log('Tabelle mit dem Namen: ' + objectName + ' wurde erfolgreich angelegt');
                }
            });

        } else {
            console.log(error);
        }
    });
};

//Datenbank Verbindung beenden
connection.end();