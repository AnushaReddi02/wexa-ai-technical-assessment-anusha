const Product = require("./models/Product");

app.get("/dashboard", async (req, res) => {

  const orgId = req.session.organizationId;

  const products = await Product.find({ organizationId: orgId });

  const totalProducts = products.length;

  const totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0);

  const lowStockProducts = products.filter(
    p => p.quantity <= (p.lowStockThreshold || 5)
  );

  res.render("dashboard", {
    totalProducts,
    totalQuantity,
    lowStockProducts
  });

});