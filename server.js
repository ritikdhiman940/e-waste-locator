const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const client = require("mongodb").MongoClient;

app.use(session({
    secret: 'login',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 } // Session expiration time in milliseconds (e.g., 1 minute)
}));

app.use(express.static(path.join(__dirname, "/")));
app.use(express.urlencoded());

let dbinstance;
client.connect("mongodb+srv://ritik1309be22:rdhiman@cluster0.tmsn2qq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {}).then((data) => {
    console.log("connected database");
    dbinstance = data.db("electro__");
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets', "signup.html"));
});

app.post("/sign", (req, res) => {
    dbinstance.collection("users").find().toArray().then((response) => {
        let flag = true;
        let result = response.find((item) => {
            return item.email === req.body.username && item.password === req.body.password;
        });
        if (result) {
            res.send("User already exists");
        } else {
            let obj = {
                email: req.body.email,
                password: req.body.password
            };

            dbinstance.collection("users").insertOne(obj).then(() => {
                console.log("Inserted");
                res.sendFile(path.join(__dirname, "/index.html"));
            });
        }
    });
});

app.post("/log", (req, res) => {
    dbinstance.collection("users").find().toArray().then((response) => {
        let result = response.find((item) => {
            return item.email === req.body.email && item.password === req.body.password;
        });
        if (result) {
            req.session.user = {
                email: result.email,
                // Add more user details as needed
            };
            res.sendFile(path.join(__dirname,"/home.html"))
        } else {
            res.send("Invalid");
        }
    });
});
app.get('/profile', (req, res) => {
    const user = req.session.user;
    if (user) {
        // Read the profile.html file and replace the placeholder with the user's email
        fs.readFile(path.join(__dirname, 'profile.html'), 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading profile.html');
                return;
            }
            // Replace the placeholder with the user's email
            const profileHtml = data.replace('{{userEmail}}', user.email);
            // Send the modified HTML
            res.send(profileHtml);
        });
    } else {
        res.status(401).send('Unauthorized');
    }
});


app.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    const fileExtension = path.extname(filename);
    
    // Serve HTML files
    if (fileExtension === '.html') {
        res.sendFile(path.join(__dirname, filename));
    } 
    // Serve CSS files
    else if (fileExtension === '.css') {
        res.sendFile(path.join(__dirname, 'assets', 'css', filename));
    } 
    // Invalid file type
    else {
        res.status(404).send('File not found');
    }
});

app.listen(800, (err) => {
    if (err) {
        console.log("error", err);
    } else {
        console.log("Server started at http://localhost:800/");
    }
});
