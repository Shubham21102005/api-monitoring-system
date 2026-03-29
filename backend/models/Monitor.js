const mongoose = require("mongoose");

const MonitorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "DELETE"],
      required: true,
    },
    headers: {
      type: Map,
      of: String, //Map because values are almost always stings, but keys can be dynamic
    },
    body: {
      type: mongoose.Schema.Types.Mixed, //because body can be of json or any oter type
    },
    queryParams: {
      type: Map,
      of: String,
    },
    schedule: {
      interval: Number, //in sec
    },
    timeoutMS: {
      type: Number,
      default: 5000,
    },
    retries: {
      type: Number,
      default: 2,
    },
    expectedResponse: {
      statusCode: Number,
    },
    status: {
      type: String,
      enum: ["active", "paused"],
      default: "active",
    },
    lastRunAt: Date,
    nextRunAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Monitor", MonitorSchema);
