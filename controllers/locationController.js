const { getDistance } = require('geolib');

// In-memory user locations (mock database)
const userLocations = {};

exports.trackUserLocation = (req, res) => {
    const { userId, latitude, longitude } = req.body;
    const timestamp = new Date();

    if (!userLocations[userId]) {
        userLocations[userId] = { lastLocation: { latitude, longitude }, timestamp };
        return res.status(200).send({ message: 'User location initialized.' });
    }

    const { lastLocation, timestamp: lastTimestamp } = userLocations[userId];
    const distance = getDistance(lastLocation, { latitude, longitude });

    if (distance < 50) {
        const duration = (timestamp - new Date(lastTimestamp)) / 1000 / 60; // Minutes
        if (duration >= 10) {
            // Trigger quiz notification
            return res.status(200).send({ message: 'Trigger quiz', location: { latitude, longitude } });
        }
    }

    // Update location
    userLocations[userId] = { lastLocation: { latitude, longitude }, timestamp };
    res.status(200).send({ message: 'Location updated.' });
};
