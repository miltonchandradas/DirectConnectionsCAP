const NodeGeocoder = require("node-geocoder");
const xsenv = require("@sap/xsenv");

xsenv.loadEnv();

const options = {
	provider: process.env.GEOCODER_PROVIDER,
	httpAdapter: "https",
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;