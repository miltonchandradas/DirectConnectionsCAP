/* eslint-disable-next-line */
const colors = require("colors");

module.exports = srv => {
    srv.before("*", req => {
        console.log("METHOD: ", req.method.yellow.inverse);
        console.log("TARGET: ", req.target.name.yellow.inverse);
    });

    /* srv.on("READ", "Products", async (req, next) => {
        const products = await next();
        return products.filter(product => product.status === "active");
    }); */

}