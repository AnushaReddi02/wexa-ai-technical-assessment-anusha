const Product = require("./Models/Product");
const Setting = require("./Models/Setting");

const setting = await Setting.findOne({ organizationId: orgId });

const defaultThreshold = setting ? setting.defaultLowStockThreshold : 5;

const lowStockProducts = products.filter(
  p => p.quantity <= (p.lowStockThreshold || defaultThreshold)
);

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