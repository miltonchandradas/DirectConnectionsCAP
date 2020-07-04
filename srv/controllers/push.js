const asyncHandler = require("../middleware/async");
const webpush = require("web-push");


exports.subscribe = asyncHandler(async (req, res, next) => {

    // Get push subscription object
    const subscription = req.body;

    // Send 201 - resource created
    res.status(201).json({});

    // Create payload
    const payload = JSON.stringify({title: "Volunteer matched..."});

    // Pass object into send notification
    webpush.sendNotification(subscription, payload);

});