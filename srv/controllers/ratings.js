const asyncHandler = require("../middleware/async");


// @desc	Add activity
// @route	POST /api/v1/activities
// @access	Private
exports.addRating = asyncHandler(async (req, res) => {
    
    const {
        opportunityId,
        rating
    } = req.body;

    console.log(req.body);

	const dbClass = require("../utils/dbPromises");
	let db = new dbClass(req.db);
	
    const sql = `UPDATE "DEMO_ACTIVITY" 
            SET "RATING" = ?
            WHERE "OPPORTUNITY_ID" = ?`;
	console.log(sql);
	
	const statement = await db.preparePromisified(sql);
	
	await db.statementExecPromisified(statement, [opportunityId, rating]);
	
	res.status(201).json({success: true, message: "Successfully updated activity in database..."});
	
});