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
	
	const sql = `SELECT * FROM "DEMO_ACTIVITY"`;
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

    /* entity Activity {
    key id            : mediumString50;
        opportunityId : mediumString50 not null;
        activityDate  : sDate;
        rating        : Integer default null;
        provider      : Association to User;
        beneficiary   : Association to User;


} */
    
    const {
        id,
        opportunityId,
        activityDate,
        rating,
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
	
	const results = await db.statementExecPromisified(statement, [id, opportunityId, activityDate, rating, providerId, beneficiaryId]);
	
	res.status(201).json({success: true, message: "Successfully added activity to database..."});
	
});