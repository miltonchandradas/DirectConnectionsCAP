const asyncHandler = require("../middleware/async");
const { v4: uuidv4 } = require("uuid");

/**
 * @swagger
 * /api/v1/auth/activities:
 *    get:
 *      description: Get all activities
 *    responses:
 *      -  '200':
 *          description: Get all volunteering activities
 */
exports.getActivities = asyncHandler(async (req, res) => {

	const dbClass = require("../utils/dbPromises");
    let db = new dbClass(req.db);
    
    let userId = req.query.id;
    console.log("User Id: ", userId);
    
    let sql = "";

    if (userId) {
        sql = `SELECT * FROM "TECHSERVICE_ACTIVITIES" WHERE "PROVIDER_ID" = '${userId}' OR "BENEFICIARY_ID" = '${userId}'`;
    } else {
        sql = `SELECT * FROM "TECHSERVICE_ACTIVITIES"`;
    }
 
	console.log(sql);
	
	const statement = await db.preparePromisified(sql);
	
	const results = await db.statementExecPromisified(statement, []);
	
	res.status(200).json({success: true, data: results});
			
});



// @desc	Add activity
// @route	POST /api/v1/activities
// @access	Private
exports.addActivity = asyncHandler(async (req, res) => {
		
    req.body.id = uuidv4();
    
    const {
        id,
        opportunityId,
        activityDate,
        providerId,
		beneficiaryId
    } = req.body;

    console.log(req.body);

	const dbClass = require("../utils/dbPromises");
	let db = new dbClass(req.db);
	
    const sql = `INSERT INTO "DEMO_ACTIVITY" 
            ("ID", "OPPORTUNITY_ID", "ACTIVITYDATE", "RATING", "PROVIDER_ID", "BENEFICIARY_ID") 
            VALUES (?, ?, ?, ?, ?, ?)`;
	console.log(sql);
	
	const statement = await db.preparePromisified(sql);
	
	await db.statementExecPromisified(statement, [id, opportunityId, activityDate, providerId, beneficiaryId]);
	
	res.status(201).json({success: true, message: "Successfully added activity to database..."});
	
});

// @desc	Update activity
// @route	POST /api/v1/activities
// @access	Private
exports.updateRating = asyncHandler(async (req, res) => {
    
    const {
        rating
    } = req.body;

    console.log(req.body);

    let activityId = req.params.id;
    console.log("Activity ID: ", activityId);

	const dbClass = require("../utils/dbPromises");
	let db = new dbClass(req.db);
	
    const sql = `UPDATE "DEMO_ACTIVITY" 
            SET "RATING" = ?, 
            "STATE" = 'completed'
            WHERE "ID" = '${activityId}'`;
	console.log(sql);
	
	const statement = await db.preparePromisified(sql);
	
	await db.statementExecPromisified(statement, [rating]);
	
	res.status(201).json({success: true, message: "Successfully updated activity in database..."});
	
});
