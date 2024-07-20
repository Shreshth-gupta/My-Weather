import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const api_keyW = "9fdf6e808cfe2098244e8ab9e85fda33";
const news_api = "https://api.nytimes.com/svc/topstories/v2/weather.json?api-key=WJmVHJ87RAgGKArHfiwzOZ66PjVnuNCe";

// View engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route to get news
app.get('/', async (req, res) => {
  try {
    const newsResponse = await axios.get(news_api);
    const news = newsResponse.data.results;
    res.render("index", { news, weatherData: null, weatherData_c: null });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'No response found' });
  }
});

// Route to detect location and fetch weather data
app.post('/location', async (req, res) => {
  const location = req.body.location;
  let weatherData_c;
  console.log(location);
  try {
    if (location) {
      const weatherResponse_c = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          q: location,
          appid: api_keyW,
          units: 'metric'
        }
      });
      weatherData_c = weatherResponse_c.data;
    }

    const newsResponse = await axios.get(news_api);
    const news = newsResponse.data.results;

    res.render("index", { weatherData_c, news });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Unable to retrieve location' });
  }
});

// Route to handle both GET and POST requests for /week
app.get('/week', (req, res) => {
  // Render the week.ejs page with no weatherData initially
  res.render("week", { weatherData: null });
});

app.post('/week', async (req, res) => {
  const location = req.body.location;
  let weatherData;
  console.log("We are in week");
  console.log(location);
  try {
    if (location) {
      const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: location,
          appid: api_keyW,
          units: 'metric'
        }
      });
      weatherData = weatherResponse.data;
    }

    // Render the week.ejs page with the fetched weather data
    console.log(weatherData);
    res.render("week", { weatherData });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Unable to retrieve location' });
  }
});

// Listener
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
