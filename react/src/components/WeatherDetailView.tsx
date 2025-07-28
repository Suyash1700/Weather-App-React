import React, { useEffect, useRef } from 'react';

interface WeatherDetailViewProps {
  dayData: {
    startTime: string;
    values: {
      status?: string;
      temperatureMax?: number;
      temperatureMin?: number;
      temperatureApparent?: number;
      sunriseTime?: string;
      sunsetTime?: string;
      humidity?: number;
      windSpeed?: number;
      visibility?: number;
      cloudCover?: number;
      weatherCode?: string;
      temperature?: number;
    };
  } | null;
  onClose: () => void;
  weatherCodes: { [key: string]: [string, string] };
  location_str: string;
  latitude: number | null;
  longitude: number | null;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (timeString: string) => {
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
};

const WeatherDetailView: React.FC<WeatherDetailViewProps> = ({
  dayData,
  weatherCodes,
  location_str,
  latitude,
  longitude,
  onClose,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGoogleMapsScript = async (apiKey: string) => {
      if (window.google && window.google.maps) return;

      const scriptExists = document.querySelector(`script[src="https://maps.googleapis.com/maps/api/js?key=${apiKey}"]`);
      if (!scriptExists) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        document.head.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      } else {
        await new Promise((resolve) => {
          scriptExists?.addEventListener('load', resolve);
        });
      }
    };

    const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY).then(() => {
      if (latitude && longitude && mapRef.current && window.google) {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 13,
        });
        if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
            new google.maps.marker.AdvancedMarkerElement({
              map,
              position: { lat: latitude, lng: longitude },
            });
          } else {
            new google.maps.Marker({
              position: { lat: latitude, lng: longitude },
              map,
            });
          }
      }
    });
  }, [latitude, longitude]);

  if (!dayData || !dayData.values) {
    return <div>Error: Weather data is unavailable.</div>;
  }

  const { values } = dayData;
  const status =
    values.weatherCode && weatherCodes[values.weatherCode] ? weatherCodes[values.weatherCode][0] : 'Unknown Status';

  const X_text = `The temperature in ${location_str} ON ${formatDate(
    dayData.startTime
  )} is ${dayData.values.temperature}°F. The weather conditions are ${status}  %0A%23CSCI571WeatherSearch`;

  return (
    <div className="container mt-4">
      <div className="col-12 col-md-12 mx-auto">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-outline-secondary d-flex align-items-center" onClick={onClose}>
            <i
              className="bi bi-chevron-left ms-1"
              style={{
                color: '#000000',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textShadow: '1px 0 currentColor, -1px 0 currentColor, 0 1px currentColor, 0 -1px currentColor',
              }}
            ></i>{' '}
            &nbsp;&nbsp;List
          </button>

          <h5 className="text-center mb-0" style={{ fontWeight: 'bold' }}>
            {formatDate(dayData.startTime)}
          </h5>

          <a
            className="twitter-share-button"
            href={`https://twitter.com/intent/tweet?text=${X_text}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="btn btn-outline-dark">
              <i className="bi bi-twitter-x"></i>
            </button>
          </a>
        </div>
      </div>

      <div className="col-12 col-md-12 mx-auto">
        <table className="table table-striped mt-3 mb-3">
          <tbody>
            <tr>
                <th style={{ width: '40%' }}>Status</th>
                <td >{status}</td>
            </tr>
            <tr>
              <th style={{ width: '40%' }}>Max Temperature</th>
              <td>{values.temperatureMax?.toFixed(2) ?? 'N/A'}°F</td>
            </tr>
            <tr>
              <th style={{ width: '40%' }}>Min Temperature</th>
              <td>{values.temperatureMin?.toFixed(2) ?? 'N/A'}°F</td>
            </tr>
            <tr>
              <th style={{ width: '40%' }}>Apparent Temperature</th>
              <td>{values.temperatureApparent?.toFixed(2) ?? 'N/A'}°F</td>
            </tr>
            <tr>
              <th style={{ width: '40%' }}>Sunrise Time</th>
              <td>{values.sunriseTime ? formatTime(values.sunriseTime) : 'N/A'}</td>
            </tr>
            <tr>
              <th style={{ width: '40%' }}>Sunset Time</th>
              <td>{values.sunsetTime ? formatTime(values.sunsetTime) : 'N/A'}</td>
            </tr>
            <tr>
              <th style={{ width: '40%' }}>Humidity</th>
              <td>{values.humidity ?? 'N/A'}%</td>
            </tr>
            <tr>
              <th style={{ width: '40%' }}>Wind Speed</th>
              <td>{values.windSpeed?.toFixed(2) ?? 'N/A'} mph</td>
            </tr>
            <tr>
              <th style={{ width: '40%' }}>Visibility</th>
              <td>{values.visibility?.toFixed(2) ?? 'N/A'} miles</td>
            </tr>
            <tr>
              <th style={{ width: '40%' }}>Cloud Cover</th>
              <td>{values.cloudCover ?? 'N/A'}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="col-12 col-md-12 mx-auto mt-3">
        <div className="border rounded overflow-hidden mt-3">
          <div className="ratio ratio-21x9" ref={mapRef}></div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDetailView;
