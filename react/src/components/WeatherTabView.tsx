import React, { useEffect, useState } from 'react';
import WeatherTable from './WeatherTable';
import TemperatureChart from './TemperatureChart';
import MeteogramChart from './MeteogramChart';
import WeatherDetailView from './WeatherDetailView';
import { FavoriteItem } from './Favorites';

interface WeatherTabViewProps {
  rawWeatherData: any[] | null;
  errorMessage: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  favoritesList: FavoriteItem[];
  onFavoritesChange: () => void;
  onDeleteFavorite: (city: string, state: string) => void;
}

const weatherCodes: { [key: string]: [string, string] } = {
  "4201": ["Heavy Rain", "rain_heavy.svg"],
  "4001": ["Rain", "rain.svg"],
  "4200": ["Light Rain", "rain_light.svg"],
  "6201": ["Heavy Freezing Rain", "freezing_rain_heavy.svg"],
  "6001": ["Freezing Rain", "freezing_rain.svg"],
  "6200": ["Light Freezing Rain", "freezing_rain_light.svg"],
  "6000": ["Freezing Drizzle", "freezing_drizzle.svg"],
  "4000": ["Drizzle", "drizzle.svg"],
  "7101": ["Heavy Ice Pellets", "ice_pellets_heavy.svg"],
  "7000": ["Ice Pellets", "ice_pellets.svg"],
  "7102": ["Light Ice Pellets", "ice_pellets_light.svg"],
  "5101": ["Heavy Snow", "snow_heavy.svg"],
  "5000": ["Snow", "snow.svg"],
  "5100": ["Light Snow", "snow_light.svg"],
  "5001": ["Flurries", "flurries.svg"],
  "8000": ["Thunderstorm", "tstorm.svg"],
  "2100": ["Light Fog", "fog_light.svg"],
  "2000": ["Fog", "fog.svg"],
  "1001": ["Cloudy", "cloudy.svg"],
  "1102": ["Mostly Cloudy", "mostly_cloudy.svg"],
  "1101": ["Partly Cloudy", "partly_cloudy_day.svg"],
  "1100": ["Mostly Clear", "mostly_clear_day.svg"],
  "1000": ["Clear", "clear_day.svg"],
};

type WeatherDataItem = {
  startTime: string;
  values: {
    weatherCode: string;
    temperatureMax: number;
    temperatureMin: number;
    windSpeed: number;
  };
};

type FormattedWeatherDataItem = {
  date: string;
  status: string;
  tempHigh: number;
  tempLow: number;
  windSpeed: number;
  icon: string;
};

const formatWeatherDataForTable = (
  data: WeatherDataItem[] | null
): FormattedWeatherDataItem[] => {
  if (!data) return [];
  return data.slice(0, 7).map((item) => ({
    date: new Date(item.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    status: weatherCodes[item.values.weatherCode][0],
    tempHigh: item.values.temperatureMax,
    tempLow: item.values.temperatureMin,
    windSpeed: item.values.windSpeed,
    icon: weatherCodes[item.values.weatherCode][1],
  }));
};

const formatWeatherDataForChart = (
  data: WeatherDataItem[]
): Array<[number, number, number]> => {
  return data.slice(0, 6).map((item) => {
    const date = new Date(item.startTime);
    return [
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
      item.values.temperatureMin,
      item.values.temperatureMax,
    ];
  });
};

const WeatherTabView: React.FC<WeatherTabViewProps> = ({
  rawWeatherData,
  errorMessage,
  city,
  state,
  latitude,
  longitude,
  favoritesList,
  onFavoritesChange,
  onDeleteFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<'day' | 'temp' | 'meteogram'>(
    'day'
  );
  const [formattedData, setFormattedData] = useState<
    FormattedWeatherDataItem[]
  >([]);
  const [chartData, setChartData] = useState<Array<[number, number, number]>>(
    []
  );
  const [meteogramData, setMeteogramData] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState(
    rawWeatherData ? rawWeatherData[0] : null
  );
  const [detailAnimationClassName, setDetailAnimationClassName] =
    useState<string>('');
  const [resultAnimationClassName, setResultAnimationClassName] =
    useState<string>('');
  const [meteogramFetched, setMeteogramFetched] = useState(false);

  useEffect(() => {
    if (city && state) {
      const isCityStateFavorite = favoritesList.some(
        (fav: FavoriteItem) => fav.city === city && fav.state === state
      );
      setIsFavorite(isCityStateFavorite);
    }
  }, [favoritesList, city, state]);

  useEffect(() => {
    onFavoritesChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'meteogram' && !meteogramFetched) {
      const fetchMeteogramData = async () => {
        if (latitude && longitude) {
          try {
            const startTime = new Date().toISOString();
            const response = await fetch(
              `https://suyash-web-a3.wl.r.appspot.com/get-weather-chart-details?lat=${latitude}&long=${longitude}&startTime=${startTime}`
            );
            if (!response.ok)
              throw new Error(`Error: ${response.statusText}`);
            const data = await response.json();
            setMeteogramData(data);
            setMeteogramFetched(true);
          } catch (error) {
            console.error('Failed to fetch meteogram data:', error);
          }
        } else {
          console.error(
            'Latitude or Longitude is missing for Meteogram API call.'
          );
        }
      };
      fetchMeteogramData();
    }
  }, [activeTab, meteogramFetched, latitude, longitude]);

  useEffect(() => {
    if (rawWeatherData) {
      setFormattedData(formatWeatherDataForTable(rawWeatherData));
      setChartData(formatWeatherDataForChart(rawWeatherData));
    }
  }, [rawWeatherData]);

  useEffect(() => {
    if (rawWeatherData && rawWeatherData.length > 0) {
      setSelectedDayData(rawWeatherData[0]);
    }
  }, [rawWeatherData]);

  const handleRowClick = (index: number) => {
    if (rawWeatherData && rawWeatherData[index]) {
      setSelectedDayData(rawWeatherData[index]);
      setDetailAnimationClassName('slide-in-right');
      setResultAnimationClassName('slide-out-left');
      setShowDetailView(true);
    } else {
      console.error('Data not found at the provided index.');
    }
  };

  const handleAddFavorite = async () => {
    if (city && state && latitude && longitude) {
      try {
        await fetch(
          `https://suyash-web-a3.wl.r.appspot.com/add-favorite?city=${encodeURIComponent(
            city
          )}&state=${encodeURIComponent(state)}&latitude=${latitude}&longitude=${longitude}`,
          { method: 'POST' }
        );
        setIsFavorite(true);
        onFavoritesChange();
      } catch (error) {
        console.error('Error adding favorite:', error);
      }
    }
  };

  const handleStarClick = () => {
    if (isFavorite) {
      onDeleteFavorite(city!, state!);
      setIsFavorite(false);
    } else {
      handleAddFavorite();
    }
  };

  const handleDetailsButtonClick = () => {
    setDetailAnimationClassName('slide-in-right');
    setResultAnimationClassName('slide-out-left');
    setShowDetailView(true);
  };

  const closeDetailView = () => {
    setShowDetailView(false);
    setDetailAnimationClassName('slide-out-right');
    setResultAnimationClassName('slide-in-left');
  };

  if (showDetailView && selectedDayData) {
    return (
      <div className={`${detailAnimationClassName}`}>
        <WeatherDetailView
          dayData={selectedDayData}
          weatherCodes={weatherCodes}
          location_str={`${city}, ${state}`}
          latitude={latitude}
          longitude={longitude}
          onClose={closeDetailView}
        />
      </div>
    );
  }

  return (
    <div className={`mt-4 ${resultAnimationClassName}`}>
      <div className={'d-flex justify-content-center'}>
        <h4 className="mb-0 text-center">
          Forecast at {city || 'Unknown'}, {state || 'Unknown'}
        </h4>
      </div>
      <div className="d-flex align-items-center justify-content-end mb-3">
        <button
          type="button"
          onClick={handleStarClick}
          className="btn d-flex align-items-center p-1 rounded"
          style={{
            marginRight: '8px',
            border: '1px solid black',
            backgroundColor: 'transparent',
          }}
        >
          <span
            className="material-icons"
            style={{
              color: isFavorite ? 'yellow' : 'white',
              WebkitTextStroke: '1px black',
            }}
          >
            star
          </span>
        </button>

        <button
          type="button"
          className="btn btn-link text-decoration-underline text-muted fw-semibold d-flex align-items-center p-0"
          style={{ textDecorationColor: '#000000', color: '#000000' }}
          onClick={handleDetailsButtonClick}
        >
          Details
          <i
            className="bi bi-chevron-right ms-1"
            style={{
              color: '#000000',
              fontSize: '1.1rem',
              fontWeight: 'bolder',
              textShadow:
                '1px 0 currentColor, -1px 0 currentColor, 0 1px currentColor, 0 -1px currentColor',
            }}
          ></i>
        </button>
      </div>

      <ul className="nav nav-tabs justify-content-end align-items-center mb-1">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'day' ? 'active' : ''}`}
            onClick={() => setActiveTab('day')}
          >
            Day view
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'temp' ? 'active' : ''}`}
            onClick={() => setActiveTab('temp')}
          >
            Daily Temp Chart
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'meteogram' ? 'active' : ''}`}
            onClick={() => setActiveTab('meteogram')}
          >
            Meteogram
          </button>
        </li>
      </ul>

      {errorMessage && (
        <div className="alert alert-danger mt-3" role="alert">
          {errorMessage}
        </div>
      )}

      {activeTab === 'day' && formattedData.length > 0 ? (
        <WeatherTable data={formattedData} onRowClick={handleRowClick} />
      ) : activeTab === 'day' ? (
        <p className="mt-3">No weather data available.</p>
      ) : activeTab === 'temp' ? (
        <TemperatureChart data={chartData} />
      ) : activeTab === 'meteogram' ? (
        meteogramData.length > 0 ? (
          <MeteogramChart intervals={meteogramData} />
        ) : (
          <p></p>
        )
      ) : null}
    </div>
  );
};

export default WeatherTabView;
