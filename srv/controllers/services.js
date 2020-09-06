const asyncHandler = require("../middleware/async");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

/**
 * @swagger
 * /api/v1/services:
 *    get:
 *      tags:
 *      - Services
 *      description: Get all services
 *      produces:
 *      - application/json
 *      responses:
 *        200:
 *          description: Get all services
 */
exports.getServices = asyncHandler(async (req, res) => {

    const dbClass = require("../utils/dbPromises");
    let db = new dbClass(req.db);

    let active = req.query.active;
    console.log("Active: ", active);

    let id = req.query.id;
    console.log("UserId: ", id);

    let sql = "";

    if (active) {
        let today = moment().format('YYYY-MM-DD');
        console.log("Today: ", today);

        if (id) {
            sql = `SELECT * FROM "TECHSERVICE_SERVICES" WHERE "STARTDATE" > '${today}' AND "PROVIDER_ID" = '${id}'`;
        } else {
            sql = `SELECT * FROM "TECHSERVICE_SERVICES" WHERE "STARTDATE" > '${today}'`;
        }


    } else {
        if (id) {
            sql = `SELECT * FROM "TECHSERVICE_SERVICES" WHERE "PROVIDER_ID" = '${id}'`;
        } else {
            sql = `SELECT * FROM "TECHSERVICE_SERVICES"`;
        }
    }

    console.log(sql);

    const statement = await db.preparePromisified(sql);

    const results = await db.statementExecPromisified(statement, []);

    res.status(200).json({ success: true, data: results });

});



/**
 * @swagger
 * /api/v1/services:
 *    post:
 *      tags:
 *      - Services
 *      description: Add new service (**Protected - Need JSON Web Token**)
 *      consumes:
 *      - application/json
 *      produces:
 *      - application/json
 *      parameters:
 *      - in: body
 *        name: body
 *        description: Service in Json format
 *      responses:
 *        200:
 *          description: Add new service
 */
exports.addService = asyncHandler(async (req, res) => {

    req.body.id = uuidv4();

    const {
        id,
        providerId,
        categoryId,
        description,
        startDate,
        endDate,
        estimatedHours,
        additionalComments,
        difficultyLevel
    } = req.body;

    console.log(req.body);

    const dbClass = require("../utils/dbPromises");
    let db = new dbClass(req.db);

    const sql = `INSERT INTO "DEMO_SERVICE" 
            ("ID", "PROVIDER_ID", "CATEGORY_ID", "DESCRIPTION", "STARTDATE", "ENDDATE", "ESTIMATEDHOURS", "ADDITIONALCOMMENTS", "DIFFICULTYLEVEL") 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    console.log(sql);

    const statement = await db.preparePromisified(sql);

    await db.statementExecPromisified(statement, [id, providerId, categoryId, description, startDate, endDate, estimatedHours, additionalComments, difficultyLevel]);

    res.status(201).json({ success: true, message: "Successfully added service to database..." });

});


// @desc    Subscribe to services
// @route   PUT /api/v1/services
// @access  Private
exports.subscribeService = asyncHandler(async (req, res) => {

    req.body.id = uuidv4();

    const {
        id,
        startDate,
        initiatedBy,
        providerId,
        beneficiaryId
    } = req.body;

    let serviceId = req.params.id;
    console.log("Service ID: ", serviceId);

    const dbClass = require("../utils/dbPromises");
    let db = new dbClass(req.db);

    let sql = `UPDATE "DEMO_SERVICE" SET "STATE" = 'subscribed', "ACTIVITY_ID" = '${id}' WHERE "ID" = ?`;
    console.log(sql);

    let statement = await db.preparePromisified(sql);

    await db.statementExecPromisified(statement, [serviceId]);

    sql = 'SELECT * FROM "DEMO_ACTIVITY" WHERE "SERVICE_ID" = ?';
    console.log(sql);

    statement = await db.preparePromisified(sql);

    let results = await db.statementExecPromisified(statement, [serviceId]);

    if (results.length < 1) {

        sql = `INSERT INTO "DEMO_ACTIVITY" 
        ("ID", "ACTIVITYDATE", "INITIATEDBY", "PROVIDER_ID", "BENEFICIARY_ID", "SERVICE_ID")
        VALUES (?, ?, ?, ?, ?, ?)`;
        console.log(sql);

        statement = await db.preparePromisified(sql);

        await db.statementExecPromisified(statement, [id, startDate, initiatedBy, providerId, beneficiaryId, serviceId]);

    }

    res.status(200).json({ success: true, data: {} });

});
