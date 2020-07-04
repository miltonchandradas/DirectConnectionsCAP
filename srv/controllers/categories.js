const asyncHandler = require("../middleware/async");

/**
 * @swagger
 * /api/v1/auth/categories:
 *    get:
 *      description: Get all volunteering categories
 *    responses:
 *      -  '200':
 *          description: Get all volunteering categories
 */
exports.getCategories = asyncHandler(async (req, res) => {

	const dbClass = require("../utils/dbPromises");
	let db = new dbClass(req.db);
	
	const sql = `SELECT * FROM "DEMO_CATEGORY"`;
	console.log(sql);
	
	const statement = await db.preparePromisified(sql);
	
	const results = await db.statementExecPromisified(statement, []);
	
	res.status(200).json({success: true, data: results});
			
});



// @desc	Add category
// @route	POST /api/v1/categories
// @access	Private
/* exports.addCategory = asyncHandler(async (req, res, next) => {
	
	console.log(req.body);
	req.body.id = uuidv4();

	const dbClass = require("../utils/dbPromises");
	let db = new dbClass(req.db);
	
	const sql = `INSERT INTO "Category" VALUES (?)`;
	console.log(sql);
	
	const statement = await db.preparePromisified(sql);
	
	const results = await db.statementExecPromisified(statement, [JSON.stringify(req.body)]);
	
	res.status(201).json({success: true, message: "Successfully added category to database..."});
	
}); */