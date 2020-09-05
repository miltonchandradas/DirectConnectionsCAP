const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geocoder");
const Isochrones = require("../utils/isochrones");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dbClass = require("sap-hdbext-promisfied");
const { v4: uuidv4 } = require("uuid");


/**
 * @swagger
 * /api/v1/auth/login:
 *    post:
 *      description: Login a user
 *    parameters:
 *      - name: email
 *        in: query
 *        description: email
 *        schema:
 *          type: string
 *          format: string
 *      - name: password
 *        in: query
 *        description: password
 *        schema:
 *          type: string
 *          format: string
 *    responses:
 *      -  '200':
 *          description: Login successful
 *      -  '400':
 *          description: Invalid credentials
 */
exports.login = asyncHandler(async (req, res, next) => {

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse("Please provide email address and password", 400));
    }

    // Check for user
    // const dbClass = require("../utils/dbPromises");
    let db = new dbClass(req.db);

    const sql = `SELECT * FROM "DEMO_USER" WHERE "EMAIL" = ?`;
    console.log(sql);

    const statement = await db.preparePromisified(sql);

    const results = await db.statementExecPromisified(statement, [email]);

    console.log(results);

    if (results.length !== 1) {
        return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check if password matches with hashed password in database
    console.log(results[0].PASSWORD);
    const isMatch = await bcrypt.compare(password, results[0].PASSWORD);

    if (!isMatch) {
        return next(new ErrorResponse("Invalid credentials", 401));
    }

    sendTokenResponse(results[0].ID, results[0].FIRSTNAME, results[0].LASTNAME, results[0].EMAIL, 200, res);

});

/**
 * @swagger
 * /api/v1/auth/facebook:
 *    post:
 *      description: Login a facebook user
 *    responses:
 *      -  '200':
 *          description: Facebook login successful
 *      -  '400':
 *          description: Invalid credentials
 */
exports.facebook = asyncHandler(async (req, res, next) => {

    console.log("Entering auth controller: POST /api/v1/auth/facebook");
    console.log("req.user", req.user);

    // Check for user
    let db = new dbClass(req.db);

    const sql = `SELECT * FROM "DEMO_USER" WHERE "EMAIL" = ?`;
    console.log(sql);

    const statement = await db.preparePromisified(sql);

    const results = await db.statementExecPromisified(statement, [req.user.EMAIL]);

    console.log(results);

    if (results.length !== 1) {
        return next(new ErrorResponse("Invalid credentials", 401));
    }

    sendTokenResponse(results[0].ID, results[0].FIRSTNAME, results[0].LASTNAME, results[0].EMAIL, 200, res);

});

/**
 * @swagger
 * /api/v1/auth/register:
 *    post:
 *      description: Register a user
 *    parameters:
 *      - name: firstName
 *        in: query
 *        description: first name
 *        schema:
 *          type: string
 *          format: string
 *      - name: lastName
 *        in: query
 *        description: last name
 *        schema:
 *          type: string
 *          format: string
 *      - name: email
 *        in: query
 *        description: email
 *        schema:
 *          type: string
 *          format: string
 *      - name: password
 *        in: query
 *        description: password
 *        schema:
 *          type: string
 *          format: string
 *      - name: confirmPassword
 *        in: query
 *        description: confirm password
 *        schema:
 *          type: string
 *          format: string
 *      - name: address
 *        in: query
 *        description: address
 *        schema:
 *          type: string
 *          format: string 
 *    responses:
 *      -  '200':
 *          description: Registration successful
 *      -  '400':
 *          description: Registration failed
 */
exports.register = asyncHandler(async (req, res) => {

    let {
        id,
        firstName,
        lastName,
        email,
        password,
        address
    } = req.body;

    let location = await getPointCoordinates(address);
    console.log(JSON.stringify(location));

    let polygons = await getGeometryCoordinates(location.coordinates[0], location.coordinates[1]);

    // Encrypt password	
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    // const dbClass = require("../utils/dbPromises");
    let db = new dbClass(req.db);

    if (!id) {
        id = uuidv4();
    }
    
    let sql =
        `INSERT INTO "DEMO_USER" ("ID", "FIRSTNAME", "LASTNAME", "EMAIL", "PASSWORD", "FORMATTEDADDRESS", "ISOCHRONE5MCAR", "COORDINATES", "LONGITUDE", "LATITUDE") VALUES(?, ?, ?, ?, ?, ?, ST_GEOMFROMGEOJSON('${polygons}', 4326), new ST_POINT(${location.coordinates[0]}, ${location.coordinates[1]}).ST_SRID(4326).ST_TRANSFORM(4326), ${location.coordinates[0]}, ${location.coordinates[1]})`;
    console.log(sql);

    let statement = await db.preparePromisified(sql);

    await db.statementExecPromisified(statement, [id, firstName, lastName, email, encryptedPassword, location.formattedAddress]);

    sendTokenResponse(id, firstName, lastName, email, 200, res);

});

// @desc	Get current logged in user
// @route	GET /api/v1/auth/me
// @access	Private
exports.getMe = asyncHandler(async (req, res) => {

    res.status(200).json({
        success: true,
        data: req.user
    });

});

// @desc	Get current logged in user
// @route	PUT /api/v1/auth/me
// @access	Private
exports.updateMe = asyncHandler(async (req, res) => {

    console.log("Entering auth controller: POST /api/v1/auth/updateMe");
    console.log("req.user", req.user);
    console.log("req.body.category", req.body.category);

    let location = null;
    let polygons = null;



    // Check for user
    let db = new dbClass(req.db);

    let sql = `UPDATE "DEMO_USER" SET "CATEGORY_ID" = ? WHERE EMAIL = ?`;

    if (req.body.address) {
        console.log("req.body.address", req.body.address);

        location = await getPointCoordinates(req.body.address);
        console.log(JSON.stringify(location));

        polygons = await getGeometryCoordinates(location.coordinates[0], location.coordinates[1]);

        //("ID", "FIRSTNAME", "LASTNAME", "EMAIL", "PASSWORD", "FORMATTEDADDRESS", "ISOCHRONE5MCAR", "COORDINATES", "LONGITUDE", "LATITUDE")

        sql =
            `UPDATE "DEMO_USER" SET "CATEGORY_ID" = ?,  
                "FORMATTEDADDRESS" = '${location.formattedAddress}',
                "ISOCHRONE5MCAR" = ST_GEOMFROMGEOJSON('${polygons}', 4326), 
                "COORDINATES" = new ST_POINT(${location.coordinates[0]}, ${location.coordinates[1]}).ST_SRID(4326).ST_TRANSFORM(4326), 
                "LONGITUDE" = ${location.coordinates[0]}, 
                "LATITUDE" = ${location.coordinates[1]} WHERE EMAIL = ?`;

        console.log(sql);
    }

    console.log(sql);

    let statement = await db.preparePromisified(sql);

    let results = await db.statementExecPromisified(statement, [req.body.category, req.user.EMAIL]);

    console.log(results);

    sql = `SELECT * FROM "DEMO_USER" WHERE "EMAIL" = ?`;
    console.log(sql);

    statement = await db.preparePromisified(sql);

    results = await db.statementExecPromisified(statement, [req.user.EMAIL]);

    console.log(results);

    res.status(200).json({
        success: true,
        data: results
    });

});

// @desc	Get current logged in user
// @route	POST /api/v1/auth/me
// @access	Private
exports.getAllUsers = asyncHandler(async (req, res, next) => {

    console.log("Entering auth controller: POST /api/v1/auth/getAllUsers");
    console.log("req.user", req.user);

    // Check for user
    let db = new dbClass(req.db);

    const sql = `SELECT * FROM "DEMO_USER"`;
    console.log(sql);

    const statement = await db.preparePromisified(sql);

    const results = await db.statementExecPromisified(statement, []);

    console.log(results);

    if (results.length < 1) {
        return next(new ErrorResponse("Invalid credentials", 401));
    }

    res.status(200).json({
        success: true,
        data: results
    });

});

// @desc	Log out currently logged in user
// @route	POST /api/v1/auth/logout
// @access	Private
exports.logout = asyncHandler(async (req, res) => {

    const options = {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    }

    res.cookie('token', 'none', options);

    res.status(200).json({
        success: true,
        data: {}
    });

});

const getPointCoordinates = async (address) => {

    const loc = await geocoder.geocode(address);

    let location = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress
    }

    return location;
};

const getGeometryCoordinates = async (longitude, latitude) => {

    const profiles = 'driving-car';
    const ranges = [300];

    const response = await Isochrones.calculate({
        locations: [
            [longitude, latitude]
        ],
        profile: profiles,
        range: ranges
    });

    let geom = response["features"][0]["geometry"];

    let polygons = [];
    polygons.push(JSON.stringify(geom));

    return polygons;
};

// Create token, create cookie and send response
const sendTokenResponse = (id, firstName, lastName, email, statusCode, res) => {

    // Create JSON Web Token
    const token = jwt.sign({
        id,
        firstName,
        lastName,
        email
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });

	/* const options = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
		httpOnly: true
	} */

    res
        .status(statusCode)
        // .cookie('token', token, options)
        .json({
            success: true,
            token
        });
};