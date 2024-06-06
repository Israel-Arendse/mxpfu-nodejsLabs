const express = require('express');
const routes = require('./routes/users.js');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const app = express();
const PORT = 5000;

app.use(session({
    secret: "fingerprint", // Unique string key for session authentication
    resave: false, // Set to false to avoid saving unchanged sessions
    saveUninitialized: true // Allow uninitialized sessions to be sent to the store
}));

app.use(express.json());

app.use("/user", (req, res, next) => {
    // Middleware to check if the user is authenticated
    if (req.session.authorization) {
        const token = req.session.authorization['accessToken']; // Access Token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "Body empty" });
    }
});

app.use("/user", routes);

app.post("/login", (req, res) => {
    const user = req.body.user;
    if (!user) {
        return res.status(404).json({ message: "User unable to log in" });
    }
    const accessToken = jwt.sign({
        data: user
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
        accessToken
    };
    return res.status(200).send("User successfully logged in");
});

app.listen(PORT, () => console.log("Server is running at port " + PORT));