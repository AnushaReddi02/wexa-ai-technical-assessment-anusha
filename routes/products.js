const express = require("express");
const router = express.Router();
const Product = require("../Models/Product");

// Middleware to protect routes
function isLoggedIn(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/login?error=loginRequired");
  }
  next();
}


// Product List
router.get("/products", isLoggedIn, async (req, res) => {

    const products = await Product.find({
        organizationId: req.session.organizationId
    });

    res.render("products/index", { products });

});


// New Product Form
router.get("/products/new", isLoggedIn, (req, res) => {
    res.render("products/new");
});


// Create Product
router.post("/products", isLoggedIn, async (req, res) => {

    try {

        const product = new Product(req.body.product);
        product.organizationId = req.session.organizationId;

        await product.save();

        res.redirect("/products?success=productCreated");

    } catch(err) {

        console.log(err);
        res.redirect("/products?error=productCreateFailed");

    }

});


// Edit Product Form
router.get("/products/:id/edit", isLoggedIn, async (req, res) => {

    const product = await Product.findById(req.params.id);

    res.render("products/edit", { product });

});


// Update Product
router.post("/products/:id", isLoggedIn, async (req, res) => {

    try {

        await Product.findByIdAndUpdate(req.params.id, req.body.product);

        res.redirect("/products?success=productUpdated");

    } catch(err) {

        console.log(err);
        res.redirect("/products?error=productUpdateFailed");

    }

});


// Delete Product
router.post("/products/:id/delete", isLoggedIn, async (req, res) => {

    try {

        await Product.findByIdAndDelete(req.params.id);

        res.redirect("/products?success=productDeleted");

    } catch(err) {

        console.log(err);
        res.redirect("/products?error=productDeleteFailed");

    }

});

module.exports = router;