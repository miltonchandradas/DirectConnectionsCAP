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

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const path = require("path");


// Load environment variables
dotenv.config({ path: "./srv/config/config.env" });

xsenv.loadEnv();
let hanaOptions = xsenv.getServices({
	hana: {
		tag: "hana"
	}
});

// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            version: "1.0.0",
            title: "Direct Connections REST API",
            description: "Direct Connections REST API - Innovator Challenge 2020",
            contact: {
                name: "Team 209"
            },
            servers: ["https://ic-cf-2020-workspaces-ws-9wfzb-app2.eu10.applicationstudio.cloud.sap", "https://myfullstack-srv-courteous-ratel-kz.cfapps.eu10.hana.ondemand.com"]
        }
    },
    apis: ["srv/controllers/*.js"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const auth = require("./routes/auth");
const categories = require("./routes/categories");
const products = require("./routes/products");
const services = require("./routes/services");
const opportunities = require("./routes/opportunities");
const activities = require("./routes/activities");
const push = require("./routes/push");

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

// HANA connections
app.use(xsHDBConn.middleware(hanaOptions.hana));

app.use("/api/v1/auth", auth);
app.use("/api/v1/categories", categories);
app.use("/api/v1/products", products);
app.use("/api/v1/services", services);
app.use("/api/v1/opportunities", opportunities);
app.use("/api/v1/activities", activities);
app.use("/api/v1/push", push);

// CAP CDS routes
cds.connect();
cds.serve ('TechService').in(app);

// Swagger documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error handler
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
const nodeEnv = process.env.NODE_ENV || "dev";

app.listen(PORT, console.log(`Server running in ${nodeEnv} mode on port ${PORT}`.yellow.inverse));