import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8200;
const apiKey = process.env.TOMORROW_API_KEY;
const connString = process.env.MONGO_URI ;

let db;

async function connectToMongo() {
  const client = new MongoClient(connString);

  try {
    await client.connect();
    db = client.db('fav-db');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToMongo();

app.use(cors());


app.get('/get-weather-details', async (req, res) => {
  const { lat, long } = req.query;

  if (!lat || !long) {
    return res.status(400).json({ error: 'Latitude and Longitude are required' });
  }

  const url = `https://api.tomorrow.io/v4/timelines?location=${lat},${long}&fields=temperature,temperatureApparent,temperatureMin,temperatureMax,windSpeed,windDirection,humidity,pressureSeaLevel,uvIndex,weatherCode,precipitationProbability,precipitationType,sunriseTime,sunsetTime,visibility,moonPhase,cloudCover&units=imperial&timesteps=1d&timezone=America/Los_Angeles&apikey=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Accept-Encoding': 'gzip' },
    });

    if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);

    const data = await response.json();
    const weatherData = data?.data?.timelines?.[0]?.intervals || [];

    res.status(200).json(weatherData.slice(0, 7));
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.get('/get-weather-chart-details', async (req, res) => {
  const { lat, long, startTime } = req.query;
  const url = `https://api.tomorrow.io/v4/timelines?location=${lat},${long}&fields=humidity,pressureSeaLevel,temperature,windSpeed,windDirection&units=imperial&timesteps=1h&startTime=${startTime}&timezone=America/Los_Angeles&apikey=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Accept-Encoding': 'gzip' },
    });

    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

    const data = await response.json();
    res.status(200).json(data.data.timelines[0].intervals);
  } catch (error) {
    console.error('Error fetching weather chart details:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/get-favorites', async (req, res) => {
  try {
    const collection = db.collection('favorites');
    const data = await collection.find({}).toArray();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch data from MongoDB' });
  }
});

app.delete('/delete-favorite', async (req, res) => {
  const { city, state } = req.query;

  if (!city || !state) {
    return res.status(400).json({ error: 'City and State are required' });
  }

  try {
    const collection = db.collection('favorites');
    const result = await collection.deleteOne({ city, state });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: 'Favorite deleted successfully' });
    } else {
      res.status(404).json({ error: 'Favorite not found' });
    }
  } catch (error) {
    console.error('Error deleting favorite:', error);
    res.status(500).json({ error: 'An error occurred while deleting the favorite' });
  }
});

app.post('/add-favorite', async (req, res) => {
  const { city, state, latitude, longitude } = req.query;

  if (!city || !state || !latitude || !longitude) {
    return res.status(400).json({ error: 'City, State, Latitude, and Longitude are required' });
  }

  try {
    const collection = db.collection('favorites');
    const newFavorite = { city, state, latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
    const result = await collection.insertOne(newFavorite);

    res.status(201).json({ message: 'Favorite added successfully', id: result.insertedId });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'An error occurred while adding the favorite' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
