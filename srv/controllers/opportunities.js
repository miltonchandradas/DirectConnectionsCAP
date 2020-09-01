const asyncHandler = require("../middleware/async");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

/**
 * @swagger
 * /api/v1/auth/categories:
 *    get:
 *      description: Get all volunteering categories
 *    responses:
 *      -  '200':
 *          description: Get all volunteering categories
 */
exports.getOpportunities = asyncHandler(async (req, res) => {

    const dbClass = require("../utils/dbPromises");
    let db = new dbClass(req.db);

    let active = req.query.active;
    console.log("Active: ", active);

    let userId = req.query.userId;
    console.log("UserId: ", userId);

    let self = req.query.self;
    console.log("Self: ", self);

    let sql = "";

    if (active) {
        let today = moment().format('YYYY-MM-DD');
        console.log("Today: ", today);

        if (userId && self == "true") {
            sql = `SELECT * FROM "TECHSERVICE_OPPORTUNITIES" WHERE "STARTDATE" > '${today}' AND "BENEFICIARY_ID" = '${userId}'`;
        } else if (userId && self == "false") {
            sql = `SELECT * FROM "TECHSERVICE_OPPORTUNITIES" WHERE "STARTDATE" > '${today}' AND "BENEFICIARY_ID" != '${userId}'`;
        }  else {
            sql = `SELECT * FROM "TECHSERVICE_OPPORTUNITIES" WHERE "STARTDATE" > '${today}'`;
        }      
    } else {
        sql = `SELECT * FROM "TECHSERVICE_OPPORTUNITIES"`;
    }

    console.log(sql);

    const statement = await db.preparePromisified(sql);

    const results = await db.statementExecPromisified(statement, []);

    res.status(200).json({ success: true, data: results });

});


// @desc    Subscribe to opportunities
// @route   PUT /api/v1/opportunities
// @access  Private
exports.subscribeOpportunity = asyncHandler(async (req, res) => {

    req.body.id = uuidv4();

    const {
        id,
        startDate,
        initiatedBy,
        providerId,
        beneficiaryId
    } = req.body;

    let opportunityId = req.params.id;
    console.log("Opportunity ID: ", opportunityId);

    const dbClass = require("../utils/dbPromises");
    let db = new dbClass(req.db);

    let sql = `UPDATE "DEMO_OPPORTUNITY" SET "STATE" = 'subscribed', "ACTIVITY_ID" = '${id}' WHERE "ID" = ?`;
    console.log(sql);

    let statement = await db.preparePromisified(sql);

    await db.statementExecPromisified(statement, [opportunityId]);

    sql = 'SELECT * FROM "DEMO_ACTIVITY" WHERE "OPPORTUNITY_ID" = ?';
    console.log(sql);

    statement = await db.preparePromisified(sql);

    let results = await db.statementExecPromisified(statement, [opportunityId]);

    if (results.length < 1) {

        sql = `INSERT INTO "DEMO_ACTIVITY" 
        ("ID", "ACTIVITYDATE", "INITIATEDBY", "PROVIDER_ID", "BENEFICIARY_ID", "OPPORTUNITY_ID")
        VALUES (?, ?, ?, ?, ?, ?)`;
        console.log(sql);

        statement = await db.preparePromisified(sql);

        await db.statementExecPromisified(statement, [id, startDate, initiatedBy, providerId, beneficiaryId, opportunityId]);
    }

    res.status(200).json({ success: true, data: {} });
})



// @desc	Add opportunity
// @route	POST /api/v1/opportunities
// @access	Private
exports.addOpportunity = asyncHandler(async (req, res) => {

    req.body.id = uuidv4();

    const {
        id,
        beneficiaryId,
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

    const sql = `INSERT INTO "DEMO_OPPORTUNITY" 
            ("ID", "BENEFICIARY_ID", "CATEGORY_ID", "DESCRIPTION", "STARTDATE", "ENDDATE", "ESTIMATEDHOURS", "ADDITIONALCOMMENTS", "DIFFICULTYLEVEL") 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    console.log(sql);

    const statement = await db.preparePromisified(sql);

    await db.statementExecPromisified(statement, [id, beneficiaryId, categoryId, description, startDate, endDate, estimatedHours, additionalComments, difficultyLevel]);

    res.status(201).json({ success: true, message: "Successfully added opportunity to database..." });

});