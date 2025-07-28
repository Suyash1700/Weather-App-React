import React from 'react';
import WeatherSearchForm from './components/WeatherSearchForm';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="container mt-4">
      <WeatherSearchForm />
    </div>
  );
};

export default App;