module.exports = srv => {
    srv.before("*", req => console.log(">>>>", req.method, req.target.name));

    srv.on("READ", "Products", async (req, next) => {
        const products = await next();
        return products.filter(product => product.status === "active");
    });

}