const express = require('express');
const cors = require('cors');

const authRouter = require('./feature/auth/auth.routes');
const adminRouter = require('./feature/admin/admin.routes');
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ "message": "hello world" });
});
app.use("/auth", authRouter);
app.use("/admin", adminRouter);

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
