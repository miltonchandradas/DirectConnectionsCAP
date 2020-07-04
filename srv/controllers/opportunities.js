const asyncHandler = require("../middleware/async");
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
	
	const sql = `SELECT * FROM "DEMO_OPPORTUNITY"`;
	console.log(sql);
	
	const statement = await db.preparePromisified(sql);
	
	const results = await db.statementExecPromisified(statement, []);
	
	res.status(200).json({success: true, data: results});
			
});



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
	
	res.status(201).json({success: true, message: "Successfully added opportunity to database..."});
	
});