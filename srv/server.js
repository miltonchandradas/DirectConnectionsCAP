/*eslint no-console: 0*/
"use strict";

const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const colors = require("colors");
const cors = require("cors");
const errorHandler = require("./middleware/error");
const xsHDBConn = require("@sap/hdbext");
const xsenv = require("@sap/xsenv");
const cds = require('@sap/cds');
const webpush = require("web-push");


// Load environment variables
dotenv.config({ path: "./srv/config/config.env" });

xsenv.loadEnv();
let hanaOptions = xsenv.getServices({
	hana: {
		tag: "hana"
	}
});

const auth = require("./routes/auth");
const products = require("./routes/products");
const push = require("./routes/push");
const path = require("path");

const app = express();

// Set static path
app.use(express.static(path.join(__dirname, "client")));

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enabling CORS for frontend browser request
app.use(cors());

// Logging
app.use(morgan("dev"));

// Web push details
webpush.setVapidDetails(
    "mailto:test@test.com",
    process.env.PUBLIC_VAPID_KEY,
    process.env.PRIVATE_VAPID_KEY
);


app.use(xsHDBConn.middleware(hanaOptions.hana));

app.use("/api/v1/products", products);
app.use("/api/v1/auth", auth);
app.use("/api/v1/push", push);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const nodeEnv = process.env.NODE_ENV || "dev";

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "docs", "index.html"));
});

cds.connect();
cds.serve ('TechService').in(app);

app.listen(PORT, console.log(`Server running in ${nodeEnv} mode on port ${PORT}`.yellow.inverse));