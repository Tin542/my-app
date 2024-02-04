const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require('dotenv').config();

const authRouter = require('./feature/auth/auth.routes');
const adminRouter = require('./feature/admin/admin.routes');
const app = express();

const port = process.env.PORT;
const db = process.env.DATABASE_URL;

mongoose
  .connect(db, { useUnifiedTopology: true, useNewUrlParser: true, maxPoolSize: 20 })
  .then(() => console.log("Connected to mongodb =(^.^)="))
  .catch((err) => console.log('failed to connect to mongodb =(T.T)='));

app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use("/auth", authRouter);
app.use("/admin", adminRouter);


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
