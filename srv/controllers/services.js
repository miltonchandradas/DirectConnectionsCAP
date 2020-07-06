const asyncHandler = require("../middleware/async");
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
	
	const sql = `SELECT * FROM "DEMO_SERVICE"`;
	console.log(sql);
	
	const statement = await db.preparePromisified(sql);
	
	const results = await db.statementExecPromisified(statement, []);
	
	res.status(200).json({success: true, data: results});
			
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
	
	console.log(req.body);
    req.body.id = uuidv4();
    req.body.userId = req.user.id;
    req.body.email = req.user.email;
    req.body.address = req.user.formattedAddress;

	const dbClass = require("../utils/dbPromises");
	let db = new dbClass(req.db);
	
	const sql = `INSERT INTO "DEMO_SERVICES" VALUES (?)`;
	console.log(sql);
	
	const statement = await db.preparePromisified(sql);
	
	await db.statementExecPromisified(statement, [JSON.stringify(req.body)]);
	
	res.status(201).json({success: true, message: "Successfully added service to database..."});
	
});