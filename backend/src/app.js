const express = require("express");
const cors = require("cors");
const dataRoute = require("../routes/dataRoute");

const app = express();
app.use(cors({
  origin: "https://aerozone.vercel.app", // allow only your Vercel domain
  credentials: true,
}));
app.use(express.json());


app.use("/api/data", dataRoute);


module.exports = app;
