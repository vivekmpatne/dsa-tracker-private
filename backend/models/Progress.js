const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: String,
  data: Object
});

module.exports = mongoose.model("Progress", progressSchema);