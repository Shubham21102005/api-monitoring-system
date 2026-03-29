const Mongoose = require("mongoose");

const LogSchema = new Mongoose.Schema(
  {
    monitorId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "Monitor",
      required: true,
      index: true,
    },
    userId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    request: {
      method: String,
      url: String,
      headers: {
        type: Map,
        of: String,
      },
      body: Mongoose.Schema.Types.Mixed,
    },
    response: {
      statusCode: Number,
      headers: {
        type: Map,
        of: String,
      },
      body: Mongoose.Schema.Types.Mixed,
      responseTime: Number, //ms
    },
    success: Boolean,
    error: {
      message: String,
      code: Number,
      stack: String,
    },
    runAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = Mongoose.model("Log", LogSchema);
