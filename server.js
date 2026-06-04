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
// Serve the login.html file
app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});
// Serve the overview.html file
app.get("/admin", (req, res) => {
    res.sendFile(__dirname + "/public/overview.html");
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
        "SELECT * FROM ??.Soknader WHERE status = 'Draft' AND Navn = ?",
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
    console.log(body);
    console.log("testing");
    
    let id = body.id;
    const name = body.navn || null;
    const amount = body.antall || null;
    const valuta = body.valuta || null;
    const date = body.dato || null;
    const description = body.beskrivelse || null;
    const attendees = body.deltagere || null;
    const country = body.land || null;
    const type = body.type || null;
    let expense;
    if (body.expense == "Draft") {
        expense = "Draft";
    } else {
        expense = "Venter på godkjenning";
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
            "Venter på godkjenning",
        ],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send({
                    message: "Unknown error occured, please try again later",
                    code: 500,
                });
            }
        },
    );
    if (id  != null && id.isInteger()) {
        connection.query(
            "DELETE FROM ??.Soknader WHERE ID = ?",
            [database, id],
            (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        message:
                            "Unknown error occured, please try again later",
                        code: 500,
                    });
                }
                res.status(200).send({
                    message: "Successfully submitted draft",
                    code: 200,
                });
            },
        );
    }
});

app.post("/oppdater/status", (req, res) => {
    console.log(req.body);
    const body = req.body;
    const id = body.id;
    const status = body.status;
    connection.query(
        "UPDATE ??.Soknader SET Status = ? WHERE ID = ?",
        [database, status, id],
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

app.post("/login", (req, res) => {
    let email = req.body.email;
    let date = new Date();
    let time = `${date.getMonth()}/${date.getDay()}/${date.getFullYear()}-${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
    let token = md5(time + req.body.password);
    let password = md5(req.body.password);
    let existing;
    connection.query(
        "SELECT * FROM ??.users WHERE email = ?",
        [email],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send({
                    message: "Unknown error occured, please try again later",
                    code: 500,
                });
            }
            if (result) {
                existing = JSON.parse(JSON.stringify(result));
                if (existing[0].password != password) {
                    return res.status(403).send({
                        message: "Incorrect login credentials, try again",
                        code: 403,
                    });
                }
                connection.query(
                    "UPDATE ??.users SET session = ? WHERE email = ?",
                    [token, email],
                    (err, result) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send({
                                message:
                                    "Unknown error occured, please try again later",
                                code: 500,
                            });
                        }
                        res.status(200).send({
                            message: "Succesfully logged in",
                            code: 200,
                            token,
                            role: existing[0].role,
                        });
                        return
                    },
                );
            }
        },
    );
    connection.query(
        "INSERT INTO ??.users (role, email, session, password) VALUES (?, ?, ?, ?)",
        ["user", email, token, password],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send({
                    message: "Unknown error occured, please try again later",
                    code: 500,
                });
            } else {
                return res.status(200).send({
                    message: "Successfully registerd users",
                    code: 200,
                    token,
                    role: "user",
                });
            }
        },
    );
});

