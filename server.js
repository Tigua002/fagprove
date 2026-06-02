// Load all necessary Node.js modules
require("dotenv").config();
const express = require("express");
const app = express();
const testing = process.env.TEST;
const path = require("path");
const md5 = require("md5");
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is live at port: ${PORT}`));

// Middleware for parsing request bodies
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const mysql = require("mysql2");
const database = process.env.DB;
// Test database connection
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: database,
});
console.log("DB: " + database);

app.use(express.static("public"));

// Connect to the database with error handling
connection.connect();

// Serve the index.html file
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});
// Serve the index.html file
app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});
app.get("/bestillinger/:id", (req, res) => {
    connection.query(
        "SELECT * FROM ??.Soknader WHERE Navn = ? AND status != 'Draft'",
        [database, req.params.id],
        (err, result) => {
            res.status(200).send({
                data: JSON.parse(JSON.stringify(result)),
                code: 200,
                message: "Successfully retrieved items",
            });
        },
    );
});
app.get("/soknader", (req, res) => {
    connection.query(
        "SELECT * FROM ??.Soknader WHERE status != 'Draft'",
        [database],
        (err, result) => {
            res.status(200).send({
                data: JSON.parse(JSON.stringify(result)),
                code: 200,
                message: "Successfully retrieved items",
            });
        },
    );
});
app.get("/drafts/:id", (req, res) => {
    connection.query(
        "SELECT * FROM ??.Soknader WHERE status != 'Godkjent' AND Navn = ? AND status != 'Venter på godkjenning'",
        [database, req.params.id],
        (err, result) => {
            if (!result) {
                res.status(200).send({
                    data: null,
                    code: 200,
                    message: "Successfully retrieved items",
                });
                return;
            }
            res.status(200).send({
                data: JSON.parse(JSON.stringify(result)),
                code: 200,
                message: "Successfully retrieved items",
            });
            return;
        },
    );
});

app.post("/send/soknad", (req, res) => {
    const body = req.body;

    const name = body.navn;
    const amount = body.antall;
    const valuta = body.valuta;
    const date = body.dato;
    const description = body.beskrivelse;
    const attendees = body.deltagere;
    const country = body.land;
    const type = body.type;
    let expense;
    if (body.expense == "Draft"){
        expense = "Draft"
    } else {
        expense = "Venter på godkjenning"
    }

    connection.query(
        "INSERT INTO ??.Soknader (Navn, Beskrivelse, Land, Deltagere, Dato, Type, Antall, Valuta, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            database,
            name,
            description,
            country,
            attendees,
            date,
            type,
            amount,
            valuta,
            expense,
        ],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send({
                    message: "Unknown error occured, please try again later",
                    code: 500,
                });
            }
            res.status(200).send({
                message: "Successfully sent request",
                code: 200,
            });
        },
    );
});
app.post("/oppdater/soknad", (req, res) => {
    console.log(req.body);
    const body = req.body;

    const id = body.id
    const status = body.status

    connection.query(
        "UPDATE ??.Soknader SET Status = ? WHERE ID = ?",
        [
            database,
            status,
            id
        ],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send({
                    message: "Unknown error occured, please try again later",
                    code: 500,
                });
            }
            res.status(200).send({
                message: "Successfully sent request",
                code: 200,
            });
        },
    );
});
