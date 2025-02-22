'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { useGPS } from '../GPS/useGPS';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudOff,
  CloudRain,
  CloudSnow,
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
} from 'lucide-react'; // Importe os ícones

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  city: string;
  icon: string;
}

const WeatherCard: React.FC = () => {
  const { location, error: gpsError, loading, permissionDenied, requestLocation } = useGPS();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasRequestedInitialLocation, setHasRequestedInitialLocation] = useState(false);

  useEffect(() => {
    if (!hasRequestedInitialLocation) {
      requestLocation();
      setHasRequestedInitialLocation(true);
    }
  }, [requestLocation, hasRequestedInitialLocation]);

  useEffect(() => {
    const fetchWeatherData = async (latitude: number, longitude: number) => {
      setIsLoading(true);
      const apiKey = '066eac4caf7b914446a3c2088682a1bb';
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`;

      try {
        const response = await axios.get(apiUrl);
        setWeatherData({
          temperature: response.data.main.temp,
          condition: response.data.weather[0].main,
          description: response.data.weather[0].description,
          city: response.data.name,
          icon: response.data.weather[0].icon,
        });
        setApiError(null);
      } catch (err) {
        setApiError('Erro ao buscar dados do clima.');
        console.error('Error fetching weather data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (location && location.latitude && location.longitude) {
      fetchWeatherData(location.latitude, location.longitude);
    }
  }, [location]);

  const getWeatherIcon = (iconCode: string) => {
    switch (iconCode) {
      case '01d':
        return <Sun className="h-4 w-4 text-muted-foreground" />;
      case '01n':
        return <Moon className="h-4 w-4 text-muted-foreground" />;
      case '02d':
        return <CloudSun className="h-4 w-4 text-muted-foreground" />;
      case '02n':
        return <CloudMoon className="h-4 w-4 text-muted-foreground" />;
      case '03d':
      case '03n':
        return <Cloud className="h-4 w-4 text-muted-foreground" />;
      case '04d':
      case '04n':
        return <CloudOff className="h-4 w-4 text-muted-foreground" />;
      case '09d':
      case '09n':
        return <CloudDrizzle className="h-4 w-4 text-muted-foreground" />;
      case '10d':
      case '10n':
        return <CloudRain className="h-4 w-4 text-muted-foreground" />;
      case '11d':
      case '11n':
        return <CloudLightning className="h-4 w-4 text-muted-foreground" />;
      case '13d':
      case '13n':
        return <CloudSnow className="h-4 w-4 text-muted-foreground" />;
      case '50d':
      case '50n':
        return <CloudFog className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <Card className={cn("p-3 mb-4 card-weather")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Clima</CardTitle>
        {weatherData && getWeatherIcon(weatherData.icon)} {/* Ícone dinâmico */}
      </CardHeader>
      <CardContent>
        {loading && <p>Solicitando permissão de localização...</p>}
        {isLoading && <p>Carregando clima...</p>}
        {apiError && <p className="text-red-500">Erro: {apiError}</p>}
        {gpsError && (
          <p className="text-red-500">
            {gpsError}
            {permissionDenied && (
              <button onClick={requestLocation} className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                Ativar Localização
              </button>
            )}
          </p>
        )}
        {weatherData && !isLoading && !apiError && (
          <div className="flex items-center gap-2">
            <div>
              <p className="font-bold">{weatherData.city}</p>
              <p>Temperatura: {weatherData.temperature.toFixed(1)}°C</p>
              <p>Condição: {weatherData.description}</p>
            </div>
          </div>
        )}
        {!location && !gpsError && !loading && !isLoading && !apiError && (
          <p>Aguardando localização...</p>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
