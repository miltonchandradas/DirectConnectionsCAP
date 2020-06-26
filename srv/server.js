/*eslint no-console: 0*/
"use strict";

const express = require("express");
const cds = require('@sap/cds')

const app = express();

app.get("/", (req, res) => res.send("Hello from express"));

cds.connect.to ('db');
cds.serve ('TechService').in(app);

app.listen(5000);