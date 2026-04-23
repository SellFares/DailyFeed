const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const upload = require('../config/multer');


// REGISTER
router.post('/register', upload.single('profile_image'), async (req, res) => {

    try {

        // console.log(req.body)
        const { username, email , password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: "Email already exists" });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ message: "Username already exists" });
            }
        }

        // generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // get profile image url
        const profile_image = req.file ? req.file.path : "";
        //console.log("Profile Image URL:", profile_image);

        // create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            profile_image
        });

        // save user and respond
        const user = await newUser.save();
        // res.status(200).json(user);
        // generate token
        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.json({
        message: "User registered successfully",
        token,
        user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            profile_image: newUser.profile_image
        }
        });
        
    }catch (err) {
        res.status(500).json({
            message: "Server error"
        });;
    }
});

// LOGIN
router.post('/login',  async (req, res) => {

    try {

        // console.log(req.body)
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email not found" });
        }
        // console.log("User found:", user);
        // check if password is correct
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Wrong password" });
        }
        // console.log("Password is valid");
        // generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profile_image: user.profile_image
            }
        });
    } catch (err) {
        res.status(500).json({
            message: "Server error"
        });;
    }
});

module.exports = router;