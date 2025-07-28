import React from 'react';

interface WeatherData {
  date: string;
  status: string;
  tempHigh: number;
  tempLow: number;
  windSpeed: number;
  icon: string;
}

interface WeatherTableProps {
  data: WeatherData[];
  onRowClick: (index: number) => void;
}

const WeatherTable: React.FC<WeatherTableProps> = ({ data, onRowClick }) => {
  return (
    <div className="table-responsive weather-table-container">
      <table className="table weather-table">
        <thead>
          <tr>
            <th className="col-index">#</th>
            <th className="col-date">Date</th>
            <th className="col-status">Status</th>
            <th className="col-temp-high">Temp. High (°F)</th>
            <th className="col-temp-low">Temp. Low (°F)</th>
            <th className="col-wind-speed">Wind Speed (mph)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="col-index row-item">{index + 1}</td>
              <td className="col-date row-item">
                <button
                  onClick={() => onRowClick(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'blue',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {item.date}
                </button>
              </td>
              <td className="col-status row-item">
                <div className="status-content">
                  <img
                    src={`/static/images/weather_symbols_charts/${item.icon}`}
                    alt={item.status}
                    width="20"
                    height="20"
                    style={{ marginRight: '8px' }}
                  />
                  <span>{item.status}</span>
                </div>
              </td>

              <td className="col-temp-high row-item">{item.tempHigh.toFixed(2)}</td>
              <td className="col-temp-low row-item">{item.tempLow.toFixed(2)}</td>
              <td className="col-wind-speed row-item">{item.windSpeed.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeatherTable;
