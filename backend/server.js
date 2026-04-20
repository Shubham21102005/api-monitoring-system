const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require('./routes/userRoutes')
const monitorRoutes = require('./routes/monitorRoutes')
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


app.use('/api/users', userRoutes)
app.use('/api/monitors', monitorRoutes)
 
//connect db
const connectDB = async () => { 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

app.listen(process.env.PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${process.env.PORT}`);
});
