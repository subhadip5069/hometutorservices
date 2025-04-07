const express = require('express');
const app = express.Router();



app.use("/admin", require("./Admin.pages.routes"));
app.use("/admin/auth", require("./Admin.Auth.routes"));
app.use("/admin/payment", require("./adminpayment.routes"));
app.use("/admin/documentverification", require("./admin.documentverification.routes"));
app.use("/admin/filteration", require("./filteration.routes"));
app.use("/admin/marquee", require("./marquee.routes"));
app.use("/admin/registration", require("./registration.matter.routes"));
app.use("/admin/premium", require("./premiummatter"));
app.use("/admin/steps", require("./admin.instruction"));

module.exports = app;


