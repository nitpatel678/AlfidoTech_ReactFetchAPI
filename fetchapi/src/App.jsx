import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Major cities with their coordinates
const CITIES = [
  { name: "Delhi", lat: 28.6139, lon: 77.209 },
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", lat: 35.6895, lon: 139.6917 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
];

const fetchWeather = async (lat, lon) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation_probability,weather_code`;
  const res = await fetch(url);
  return res.json();
};

// Get coordinates from Open-Meteo Geocoding API
async function getLatLonForCity(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}`;
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();
  if (geoData && geoData.results && geoData.results.length > 0) {
    return geoData.results[0]; // return full object (lat, lon, name, country etc.)
  }
  return null;
}

function WeatherBox({ city, weather, loading, error }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, type: "spring" }}
      className="bg-white/80 rounded-xl shadow-lg p-6 w-64 text-center flex flex-col items-center"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl font-bold text-blue-600">{city}</span>
        <span role="img" aria-label="weather" className="text-xl">
          🌤️
        </span>
      </div>
      {loading ? (
        <div className="animate-pulse text-gray-400">Loading...</div>
      ) : error ? (
        <div className="text-red-600">Error</div>
      ) : weather ? (
        <div className="space-y-1 text-gray-800">
          <div>
            <span className="text-3xl font-bold">
              {weather.temperature_2m}°C
            </span>
            <span className="ml-1 text-gray-500">Temperature</span>
          </div>
          <div>
            <span className="font-semibold">
              {weather.precipitation_probability}%
            </span>
            <span className="ml-1 text-gray-500">Rain Prob.</span>
          </div>
          <div>
            <span className="font-semibold">
              {getWeatherDesc(weather.weather_code)}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-gray-400">No data</div>
      )}
    </motion.div>
  );
}

function getWeatherDesc(code) {
  if (code === 0) return "Clear";
  if (code <= 3) return "Mainly Clear";
  if (code <= 45) return "Fog";
  if (code <= 51) return "Drizzle";
  if (code <= 63) return "Rain";
  if (code <= 67) return "Freezing Rain";
  if (code <= 71) return "Snow";
  if (code <= 82) return "Convective";
  if (code <= 95) return "Thunderstorm";
  return "Unknown";
}

function App() {
  const [weatherList, setWeatherList] = useState([]);
  const [loadingList, setLoadingList] = useState([]);
  const [errorList, setErrorList] = useState([]);
  const [cityQuery, setCityQuery] = useState("");
  const [searchedWeather, setSearchedWeather] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Fetch weather for predefined cities on mount
  useEffect(() => {
    CITIES.forEach(async ({ name, lat, lon }, idx) => {
      setLoadingList((arr) => {
        const newArr = [...arr];
        newArr[idx] = true;
        return newArr;
      });
      setErrorList((arr) => {
        const newArr = [...arr];
        newArr[idx] = false;
        return newArr;
      });
      try {
        const data = await fetchWeather(lat, lon);
        setWeatherList((arr) => {
          const newArr = [...arr];
          newArr[idx] = data.current || null;
          return newArr;
        });
      } catch {
        setErrorList((arr) => {
          const newArr = [...arr];
          newArr[idx] = true;
          return newArr;
        });
      } finally {
        setLoadingList((arr) => {
          const newArr = [...arr];
          newArr[idx] = false;
          return newArr;
        });
      }
    });
  }, []);

  // Search functionality
  const onSearch = async (e) => {
    e.preventDefault();
    if (!cityQuery.trim()) return;
    setSearchLoading(true);
    setSearchedWeather(null);
    setSearchError(null);

    try {
      const cityData = await getLatLonForCity(cityQuery);
      if (!cityData) {
        setSearchError("City not found");
        setSearchLoading(false);
        return;
      }
      const data = await fetchWeather(cityData.latitude, cityData.longitude);
      setSearchedWeather({
        name: cityData.name, // ✅ Use API's proper city name
        ...data.current,
      });
    } catch (err) {
      setSearchError("Error fetching weather");
    }
    setSearchLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-sky-200">
      <motion.h1
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.7 }}
        className="text-3xl md:text-4xl font-extrabold text-sky-900 mb-10 text-center tracking-wide"
      >
        <span className="mr-3" role="img" aria-label="cloud">
          ☁️
        </span>
        AlfidoTech React Fetch Api App
      </motion.h1>

      <form onSubmit={onSearch} className="flex items-center gap-3 mb-8">
        <input
          className="px-4 py-2 rounded-lg border border-blue-200 shadow w-60 focus:ring-2 focus:ring-sky-400 focus:outline-none transition"
          value={cityQuery}
          onChange={(e) => setCityQuery(e.target.value)}
          placeholder="Search for a city..."
        />
        <button
          type="submit"
          className="bg-sky-800 hover:bg-sky-900 transition text-white px-5 py-2 rounded-lg font-semibold shadow"
        >
          🔍 Search
        </button>
      </form>

      {searchLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 font-semibold mb-4"
        >
          Loading...
        </motion.div>
      )}

      {searchedWeather && (
        <WeatherBox
          city={searchedWeather.name}
          weather={searchedWeather}
          loading={false}
          error={searchError}
        />
      )}

      {searchError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 font-semibold mb-4"
        >
          {searchError}
        </motion.div>
      )}

      <div className="mt-8 flex flex-wrap gap-8 justify-center">
        {CITIES.map((city, idx) => (
          <WeatherBox
            key={city.name}
            city={city.name}
            weather={weatherList[idx]}
            loading={loadingList[idx]}
            error={errorList[idx]}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
