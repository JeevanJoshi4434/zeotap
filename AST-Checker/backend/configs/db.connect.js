const { default: mongoose } = require("mongoose");

function connectDB() {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("Database connected.");
    }).catch((err) => {
        console.log(`Database connection failed: ${err.message}`);
    })
}

module.exports = { connectDB }