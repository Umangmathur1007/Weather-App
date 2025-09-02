import React, { useState } from "react";
import {
  WiDaySunny,
  WiNightClear,
  WiCloud,
  WiCloudy,
  WiSnow,
  WiRain,
  WiThunderstorm,
} from "react-icons/wi";
import "./Weather.css";

const weatherCodeMap = {
  0: "clear",
  1: "partly-cloudy",
  2: "cloudy",
  3: "cloudy",
  45: "fog",
  48: "fog",
  51: "rain",
  53: "rain",
  55: "rain",
  61: "rain",
  63: "rain",
  65: "rain",
  71: "snow",
  73: "snow",
  75: "snow",
  77: "snow",
  80: "rain-showers",
  81: "rain-showers",
  82: "rain-showers",
  85: "snow-showers",
  86: "snow-showers",
  95: "thunderstorm",
  96: "thunderstorm",
  99: "thunderstorm",
};

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError("");
    setWeather(null);
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1`
      );
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found.");
        setLoading(false);
        return;
      }
      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      if (!weatherData.current_weather) {
        setError("Weather data not available.");
        setLoading(false);
        return;
      }

      setWeather({
        ...weatherData.current_weather,
        locationName: name,
        country,
      });
    } catch {
      setError("Failed to fetch data.");
    }
    setLoading(false);
  };

  const isDay = weather?.is_day === 1;

  // Icon selector based on weather code and day/night
  const getWeatherIcon = () => {
    if (!weather) return null;

    const code = weather.weathercode;
    if ([0].includes(code)) return isDay ? <WiDaySunny size={80} /> : <WiNightClear size={80} />;
    if ([1, 2, 3].includes(code)) return <WiCloudy size={80} />;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return <WiSnow size={80} className="snow-icon" />;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <WiRain size={80} />;
    if ([95, 96, 99].includes(code)) return <WiThunderstorm size={80} />;
    return <WiCloud size={80} />;
  };

  return (
    <div className={`weather-app ${isDay ? "day" : "night"}`}>
      <div className="overlay"></div>
      <header>
        <h1>Hi Jamie! Outdoor Weather Check</h1>
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
          aria-label="City name input"
        />
        <button onClick={fetchWeather} aria-label="Fetch weather">
          Check Weather
        </button>
      </header>

      {loading && <p className="status-msg">Loading...</p>}
      {error && <p className="status-msg error">{error}</p>}

      {weather && !loading && (
        <main className="weather-info">
          <h2>
            {weather.locationName}, {weather.country}
          </h2>
          <div className="weather-icon">{getWeatherIcon()}</div>
          <p className="greeting">Good {isDay ? "day" : "evening"}, Jamie!</p>
          <div className="details">
            <p>
              <strong>Temperature:</strong> {weather.temperature}°C
            </p>
            <p>
              <strong>Wind Speed:</strong> {weather.windspeed} km/h
            </p>
            <p>
              <strong>Wind Direction:</strong> {weather.winddirection}°
            </p>
          </div>
          {weather.weathercode >= 71 && (
            <div className="snowfall"></div> /* snow animation for snow codes */
          )}
        </main>
      )}
    </div>
  );
};

export default WeatherApp;
