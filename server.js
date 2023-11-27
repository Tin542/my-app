const express = require('express');
const cors = require('cors');

const userRouter = require('./routes/userRouter');
const roleRouter = require('./routes/roleRouter');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ "message": "hello world" });
});
app.use("/user", userRouter);
app.use("/role", roleRouter);

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
