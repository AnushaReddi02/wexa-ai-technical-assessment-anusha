const express = require("express");
const router = express.Router();
const Product = require("../Models/Product");


// Product List
router.get("/products", async (req, res) => {

    const products = await Product.find({
        organizationId: req.session.organizationId
    });

    res.render("products/index", { products });

});


// New Product Form
router.get("/products/new", (req, res) => {
    res.render("products/new");
});


// Create Product
router.post("/products", async (req, res) => {

    const product = new Product(req.body.product);
    product.organizationId = req.session.organizationId;

    await product.save();

    res.redirect("/products");

});


// Edit Product Form
router.get("/products/:id/edit", async (req, res) => {

    const product = await Product.findById(req.params.id);

    res.render("products/edit", { product });

});


// Update Product
router.post("/products/:id", async (req, res) => {

    await Product.findByIdAndUpdate(req.params.id, req.body.product);

    res.redirect("/products");

});


// Delete Product
router.post("/products/:id/delete", async (req, res) => {

    await Product.findByIdAndDelete(req.params.id);

    res.redirect("/products");

});


module.exports = router;