import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = "https://api.nytimes.com/svc/topstories/v2/weather.json";

// View engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Initialize app locals for caching
app.locals.cachedNews = [];
app.locals.newsLastFetched = null;

// Route to get news and render home page
app.get('/', async (req, res) => {
  // Check if we have cached news data
  if (app.locals.cachedNews && app.locals.newsLastFetched && 
      (Date.now() - app.locals.newsLastFetched < 5 * 60 * 1000)) {
    // Use cached news
    return res.render("index", { news: app.locals.cachedNews, weatherData_c: null });
  }
  
  try {
    // Try to fetch news with a short timeout
    const newsResponse = await axios.get(`${NEWS_API_URL}?api-key=${NEWS_API_KEY}`, { timeout: 5000 });
    const news = newsResponse.data.results;
    
    // Cache the news
    app.locals.cachedNews = news;
    app.locals.newsLastFetched = Date.now();
    
    res.render("index", { news, weatherData_c: null });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.render("index", { news: [], weatherData_c: null });
  }
});

// Route to detect location and fetch weather data
app.post('/location', async (req, res) => {
  const location = req.body.location;
  
  try {
    if (!location) {
      return res.redirect('/');
    }

    // Get current weather data
    const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: location,
        appid: WEATHER_API_KEY,
        units: 'metric'
      },
      timeout: 10000
    });
    
    const weatherData_c = weatherResponse.data;
    
    // Use cached news if available and recent (less than 5 minutes old)
    let news = [];
    if (app.locals.cachedNews && app.locals.newsLastFetched && 
        (Date.now() - app.locals.newsLastFetched < 5 * 60 * 1000)) {
      news = app.locals.cachedNews;
    }

    res.render("index", { weatherData_c, news });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    if (error.response && error.response.status === 404) {
      // City not found
      return res.render("index", { 
        news: app.locals.cachedNews || [], 
        weatherData_c: null, 
        error: "City not found. Please check the spelling and try again." 
      });
    }
    
    res.render("index", { 
      news: app.locals.cachedNews || [], 
      weatherData_c: null, 
      error: "Unable to retrieve weather data. Please try again later." 
    });
  }
});

// Route to get weather by coordinates
app.post('/location-coords', async (req, res) => {
  const { lat, lon } = req.body;
  
  try {
    if (!lat || !lon) {
      return res.redirect('/');
    }

    // Get current weather data by coordinates
    const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric'
      },
      timeout: 10000
    });
    
    const weatherData_c = weatherResponse.data;
    
    // Use cached news if available
    let news = [];
    if (app.locals.cachedNews && app.locals.newsLastFetched && 
        (Date.now() - app.locals.newsLastFetched < 5 * 60 * 1000)) {
      news = app.locals.cachedNews;
    }

    res.render("index", { weatherData_c, news });
  } catch (error) {
    console.error('Error fetching weather data by coordinates:', error);
    res.render("index", { 
      news: app.locals.cachedNews || [], 
      weatherData_c: null, 
      error: "Unable to retrieve weather data for your location. Please try again later." 
    });
  }
});

// Routes for weekly forecast
app.get('/week', (req, res) => {
  res.render("week", { weatherData: null });
});

app.post('/week', async (req, res) => {
  const location = req.body.location;
  
  try {
    if (!location) {
      return res.redirect('/week');
    }

    const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: location,
        appid: WEATHER_API_KEY,
        units: 'metric'
      },
      timeout: 10000
    });
    
    const weatherData = weatherResponse.data;
    res.render("week", { weatherData });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    if (error.response && error.response.status === 404) {
      return res.render("week", { 
        weatherData: null, 
        error: "City not found. Please check the spelling and try again." 
      });
    }
    
    res.render("week", { 
      weatherData: null, 
      error: "Unable to retrieve weather data. Please try again later." 
    });
  }
});

// Route for weekly forecast by coordinates
app.post('/week-coords', async (req, res) => {
  const { lat, lon } = req.body;
  
  try {
    if (!lat || !lon) {
      return res.redirect('/week');
    }

    const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric'
      },
      timeout: 10000
    });
    
    const weatherData = weatherResponse.data;
    res.render("week", { weatherData });
  } catch (error) {
    console.error('Error fetching weather data by coordinates:', error);
    res.render("week", { 
      weatherData: null, 
      error: "Unable to retrieve weather data for your location. Please try again later." 
    });
  }
});

// About page route
app.get('/about', (req, res) => {
  res.render("about", { active: 'about' });
});

// API endpoint to get forecast data
app.get('/api/forecast', async (req, res) => {
  const { lat, lon } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }
  
  try {
    const forecastResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric'
      },
      timeout: 10000
    });
    
    res.json(forecastResponse.data);
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    res.status(500).json({ error: 'Unable to retrieve forecast data' });
  }
});

// API endpoint to get forecast data for the week view
app.get('/api/onecall', async (req, res) => {
  const { lat, lon } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }
  
  try {
    const forecastResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric'
      },
      timeout: 10000
    });
    
    // Process the forecast data to get daily forecasts
    const forecastList = forecastResponse.data.list;
    const dailyData = [];
    const dailyMap = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = {
          dt: item.dt,
          date: dateStr,
          temp: {
            min: item.main.temp_min,
            max: item.main.temp_max
          },
          weather: [item.weather[0]],
          pop: item.pop || 0,
          wind_speed: item.wind.speed
        };
      } else {
        // Update min/max temps
        if (item.main.temp_min < dailyMap[dateStr].temp.min) {
          dailyMap[dateStr].temp.min = item.main.temp_min;
        }
        if (item.main.temp_max > dailyMap[dateStr].temp.max) {
          dailyMap[dateStr].temp.max = item.main.temp_max;
        }
        // Update precipitation probability
        if ((item.pop || 0) > dailyMap[dateStr].pop) {
          dailyMap[dateStr].pop = item.pop;
        }
      }
    });
    
    // Convert to array
    Object.keys(dailyMap).forEach(date => {
      dailyData.push(dailyMap[date]);
    });
    
    // Format response similar to OneCall API
    const response = {
      lat: forecastResponse.data.city.coord.lat,
      lon: forecastResponse.data.city.coord.lon,
      timezone: forecastResponse.data.city.timezone,
      daily: dailyData
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    res.status(500).json({ error: 'Unable to retrieve forecast data' });
  }
});

// Listener
app.listen(port, () => {
  console.log(`Weather app is running on http://localhost:${port}`);
});