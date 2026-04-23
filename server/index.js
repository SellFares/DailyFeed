const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');
const cors = require("cors");

dotenv.config();

const app = express();

mongoose.connect(process.env.MONGO_URI, )
.then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

app.use(cors({
  origin: "http://127.0.0.1:5500",  // origin true ya3ni kolchi y9der y accessi l API
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

//app.options("*", cors());

// middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));
app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);



app.listen(8800, () => {
    console.log('Backend Server is running on port 8800');
});

