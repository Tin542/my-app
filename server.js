const express = require('express');
const cors = require('cors');

const userRouter = require('./users/users.routes');
const roleRouter = require('./roles/roles.routes');
const authRouter = require('./auth/auth.routes');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ "message": "hello world" });
});
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/role", roleRouter);

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
