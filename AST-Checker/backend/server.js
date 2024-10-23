const express = require('express');
const bodyParser = require('body-parser');
const { connectDB } = require('./configs/db.connect');
const cors = require('cors');
const envconfig = require('dotenv');

envconfig.config( { path: './.env' } );

// Initialize Express app
const app = express();
app.use(bodyParser.json());
// Connect Database
connectDB();

app.use(cors(
    {
        origin: 'http://localhost:2355'
    }
));

// Home route
app.get('/', (req, res) => {
    res.send('AST Rule Engine API is up and running!');
});

// Import routes
const ruleRoute = require('./routes/rule.route');
app.use('/api', ruleRoute);

// Start the server
const PORT = process.env.SERVER_PORT || 2354;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
