const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ""
  },

  body: {
    type: String,
    required: true
  },

  image: {
    type: String
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  tags: [
    {
      name: String
    }
  ]

}, { timestamps: true }); // gives createdAt automatically

module.exports = mongoose.model("Post", postSchema);