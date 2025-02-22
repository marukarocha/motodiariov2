import React from "react";
import { useWeather } from "./useWeather";

const WeatherCard = ({ latitude, longitude }) => {
    const { weatherData, loading } = useWeather(latitude, longitude);

    console.log("Dados recebidos no WeatherCard:", { weatherData, loading });

    if (loading) {
        return <div>Carregando o clima...</div>;
    }

    if (!weatherData) {
        return <div>Não foi possível carregar o clima</div>;
    }

    const { name, main, weather } = weatherData;

    return (
        <div className="weather-card">
            <h3>Clima em {name}</h3>
            <p>Temperatura: {main.temp}°C</p>
            <p>Condição: {weather[0].description}</p>
        </div>
    );
};

export default WeatherCard;
