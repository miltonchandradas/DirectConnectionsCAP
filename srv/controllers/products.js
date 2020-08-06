const asyncHandler = require("../middleware/async");
const { v4: uuidv4 } = require("uuid");

// @desc	Get all products
// @route	GET /api/v1/products
// @access	Public
exports.getProducts = asyncHandler(async (req, res) => {

    const id = req.query.id;

    const dbClass = require("../utils/dbPromises");
    let db = new dbClass(req.db);

    let sql = "";

    if (id) {
        sql = `SELECT * FROM "TECHSERVICE_PRODUCTS" WHERE "PROVIDER_ID" = '${id}'`;
    } else {
        sql = `SELECT * FROM "TECHSERVICE_PRODUCTS"`;
    }

    const statement = await db.preparePromisified(sql);

    const results = await db.statementExecPromisified(statement, []);

    res.status(200).json({ success: true, data: results });

});



// @desc	Add product
// @route	POST /api/v1/products
// @access	Private
exports.addProduct = asyncHandler(async (req, res) => {

    console.log(req.body);
    req.body.id = uuidv4();

    const dbClass = require("../utils/dbPromises");
    let db = new dbClass(req.db);

    const sql = `INSERT INTO "DEMO_PRODUCTS" VALUES (?)`;
    console.log(sql);

    const statement = await db.preparePromisified(sql);

    await db.statementExecPromisified(statement, [JSON.stringify(req.body)]);

    res.status(201).json({ success: true, message: "Successfully added product to database..." });

});