import React, { useEffect, useState } from "react";
import "./tempo.css";

const WeatherClock = ({ city, apiKey }) => {
  const [weather, setWeather] = useState({
    location: "",
    temperature: "--",
    condition: "Condition",
    icon: "",
    timezoneOffset: 0,
  });
  const [time, setTime] = useState("");

  // Atualiza o relógio
  useEffect(() => {
    if (weather.timezoneOffset) {
      const updateClock = () => {
        const now = new Date();
        const localTime = new Date(now.getTime() + weather.timezoneOffset * 1000);
        const hours = String(localTime.getUTCHours()).padStart(2, "0");
        const minutes = String(localTime.getUTCMinutes()).padStart(2, "0");
        const seconds = String(localTime.getUTCSeconds()).padStart(2, "0");
        setTime(`${hours}:${minutes}:${seconds}`);
      };
      const intervalId = setInterval(updateClock, 1000);
      return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar
    }
  }, [weather.timezoneOffset]);

  // Atualiza o clima ao carregar
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        setWeather({
          location: data.name,
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].description,
          icon: getWeatherIcon(data.weather[0].main),
          timezoneOffset: data.timezone,
        });
      } catch (error) {
        console.error("Erro ao buscar dados climáticos:", error);
      }
    };

    fetchWeather();
  }, [city, apiKey]);

  // Retorna o ícone baseado na condição climática
  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "Clear":
        return "sunny";
      case "Clouds":
        return "cloudy";
      case "Rain":
        return "rainy";
      case "Snow":
        return "snowy";
      default:
        return "sunny";
    }
  };

  return (
    <div className="weather-widget">
      
      <div className="weather-info">
        <div className={`weather-icon ${weather.icon}`} />
        <div className="weather-details">
          <h2>{weather.location || "Location"}</h2>
          <p className="temperature">{weather.temperature}°C</p>
          <p className="condition">{weather.condition}</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherClock;
