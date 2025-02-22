import { useState, useEffect } from "react";

export const useWeather = (latitude, longitude) => {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const apiKey = "c8a4fd037dd0c64eee33fac15a667a6f";

    useEffect(() => {
        if (!latitude || !longitude) return;

        const fetchWeather = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=pt_br&appid=${apiKey}`
                );
                if (!response.ok) {
                    throw new Error("Erro ao buscar os dados do clima");
                }
                const data = await response.json();
                setWeatherData(data);
            } catch (error) {
                console.error(error.message);
                setWeatherData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [latitude, longitude]);

    return { weatherData, loading };
};
