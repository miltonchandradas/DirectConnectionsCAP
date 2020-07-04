const openrouteservice = require("openrouteservice-js");

const Isochrones = new openrouteservice.Isochrones({
  api_key: process.env.OPENROUTESERVICE_API_KEY || "5b3ce3597851110001cf62480af1c8c1ed764a5787bf28774d53c92c"
});



module.exports = Isochrones;