const express = require('express');
const cors = require('cors');

const authRouter = require('./feature/auth/auth.routes');
const adminRouter = require('./feature/admin/admin.routes');
const managerRouter = require('./feature/manager/manager.routes');
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/manager", managerRouter);

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
