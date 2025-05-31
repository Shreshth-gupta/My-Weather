# My Weather App

A modern, responsive weather application that provides real-time weather data and forecasts along with relevant news updates.

![Weather App](https://my-weather-t8pc.onrender.com)

## Features

- **Real-time Weather Data**: Get current weather conditions for any location
- **Location Detection**: Automatically detect the user's location for instant weather updates
- **Weekly Forecast**: View detailed 7-day weather forecasts
- **News Integration**: Latest weather-related news from the New York Times API
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Data Caching**: An Efficient caching system to reduce API calls and improve performance

## Technologies Used

- **Backend**: Node.js with Express.js
- **Frontend**: HTML, CSS, JavaScript
- **Templating**: EJS (Embedded JavaScript)
- **APIs**: OpenWeatherMap API, New York Times API
- **Environment Variables**: dotenv for secure configuration

## Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- API keys for:
  - OpenWeatherMap API
  - New York Times API

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Shreshth-gupta/My-Weather.git
   cd My-Weather
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your API keys:
   ```
   WEATHER_API_KEY=your_openweathermap_api_key
   NEWS_API_KEY=your_nytimes_api_key
   ```

4. Start the application:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```
   
   Or use the included batch file:
   ```bash
   start-dev.bat
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
weather_app/
├── public/            # Static assets
│   └── style/         # CSS files
├── views/             # EJS templates
│   ├── about.ejs      # About page
│   ├── footer.ejs     # Footer component
│   ├── form.ejs       # Search form component
│   ├── header.ejs     # Header component
│   ├── index.ejs      # Home page
│   ├── today.ejs      # Today's forecast component
│   └── week.ejs       # Weekly forecast page
├── .env               # Environment variables (not in repo)
├── .env.example       # Example environment variables
├── .gitignore         # Git ignore file
├── index.js           # Main application file
├── nodemon.json       # Nodemon configuration
├── package.json       # Project dependencies
└── package-lock.json  # Dependency lock file
```

## API Endpoints

- `GET /`: Home page with current weather and news
- `POST /location`: Get weather data for a specific location
- `POST /location-coords`: Get weather data using coordinates
- `GET /week`: Weekly forecast page
- `POST /week`: Get weekly forecast for a specific location
- `POST /week-coords`: Get weekly forecast using coordinates
- `GET /about`: About page
- `GET /api/forecast`: API endpoint for forecast data
- `GET /api/onecall`: API endpoint for weekly forecast data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [New York Times API](https://developer.nytimes.com/) for news content
- [Express.js](https://expressjs.com/) for the web framework
