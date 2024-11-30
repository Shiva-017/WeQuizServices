const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Routes
const locationRoutes = require('./routes/locationRoute');
const quizRoutes = require('./routes/quizRoute');

app.use('/location', locationRoutes);
app.use('/quiz', quizRoutes);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;