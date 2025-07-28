// src/components/WeatherSearchForm.tsx

import React, { useState, useRef, useEffect } from 'react';
import FormInput from './FormInput';
import StateOptions from './StateOptions';
import WeatherTabView from './WeatherTabView';
import Favorites from './Favorites';
import { FavoriteItem } from './Favorites';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useJsApiLoader, Libraries } from '@react-google-maps/api';
import { states } from './StateOptions';
import 'bootstrap-icons/font/bootstrap-icons.css';

const libraries: Libraries = ['places'];

const ipInfoToken = '06c2760eaea528';
const geocodingApiKey = 'AIzaSyAeqQ8vpfsXYxVixIgIhHmwARL7wp09ERU';

const WeatherSearchForm: React.FC = () => {
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [currentLocation, setCurrentLocation] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'favorites'>('results');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [errors, setErrors] = useState({ street: '', city: '', state: '' });
  const [stateTouched, setStateTouched] = useState(false);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [ipDataLoaded, setIpDataLoaded] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rawWeatherData, setRawWeatherData] = useState<any[] | null>(null);

  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [detectedState, setDetectedState] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showWeatherTabView, setShowWeatherTabView] = useState(false);
  const [displayCity, setDisplayCity] = useState<string | null>(null);
  const [displayState, setDisplayState] = useState<string | null>(null);
  const [propLatitude, setPropLatitude] = useState<number | null>(null);
  const [propLongitude, setPropLongitude] = useState<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);

  const [favoritesList, setFavoritesList] = useState<FavoriteItem[]>([]);

  const getFavoritesListList = async () => {
    try {
      const response = await fetch('https://suyash-web-a3.wl.r.appspot.com/get-favorites');
      if (!response.ok) throw new Error('Error fetching favorites list');
      const data: FavoriteItem[] = await response.json();
      setFavoritesList(data);
    } catch (error) {
      console.error('Failed to fetch favorites list:', error);
    }
  };
  
  const getFavoritesList = async () => {
    try {
      const response = await fetch('https://suyash-web-a3.wl.r.appspot.com/get-favorites');
      const data = await response.json();
      setFavoritesList(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  useEffect(() => {
    getFavoritesList();
  }, []);

  const deleteFavoriteItem = async (city: string, state: string) => {
    try {
      await fetch(`https://suyash-web-a3.wl.r.appspot.com/delete-favorite?city=${city}&state=${state}`, { method: 'DELETE' });
      getFavoritesList();
    } catch (error) {
      console.error('Error deleting favorite:', error);
    }
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const validateField = (field: string, value: string) => {
    if (!value.trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: `Please enter a valid ${field}`
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: ''
      }));
    }
  };

  const handleBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  const getWeatherDetailsForWeek = async (latitude: number, longitude: number) => {
    const url = `https://suyash-web-a3.wl.r.appspot.com/get-weather-details?lat=${latitude}&long=${longitude}`;
    console.log('Making weather call with params:',latitude,longitude);
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setShowWeatherTabView(true);
        setRawWeatherData(data);
        setErrorMessage(null);
        // console.log("Weather Data from backend:", data);
      } else {
        setRawWeatherData(null);
        setErrorMessage("An error occurred. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching weather data from backend:", error);
      setRawWeatherData(null);
      setErrorMessage("An error occurred. Please try again later.");
    }
  };
  
  const searchWeatherDetailsFromFavorites = async (latitude: number, longitude: number, city: string, state: string) => {
    setShowWeatherTabView(false);
    setRawWeatherData(null);
    setErrorMessage(null);
    setDisplayCity(city);
    setDisplayState(state);
    setPropLatitude(latitude);
    setPropLongitude(longitude);
    setActiveTab('results');
    setProgress(0);
    setShowProgressBar(true);
    setDataLoaded(false);
    
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 20, 100));
    }, 50);
  
    try {
      await getWeatherDetailsForWeek(latitude, longitude);
    } catch (error) {
      console.error("Error fetching weather data from backend:", error);
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setShowProgressBar(false), 100);
      setDataLoaded(true);
    }
  };
  

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
  
    setShowWeatherTabView(false);
    await getFavoritesListList();
    setRawWeatherData(null);
    setErrorMessage(null);
    setLatitude(null);
    setLongitude(null);
    setActiveTab('results');
    setProgress(0);
    setShowProgressBar(true);
    setDataLoaded(false);
    // await delay(2000);

    const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 20, 100));
      }, 50);

    const fetchWeatherDataFunc = async () => {
        if (currentLocation) {
            console.log("Using autodetect location");
            setDisplayCity(detectedCity);
            setDisplayState(detectedState);
            setPropLatitude(latitude);
            setPropLongitude(longitude);
        
            if (latitude && longitude) {
                await getWeatherDetailsForWeek(latitude, longitude);
            } else {
                console.error("Latitude and Longitude are not available.");
                setErrorMessage("Could not detect location coordinates.");
                setShowProgressBar(false);
                return;
            }
        } 
        else {
            console.log("Using entered location data for search");
            if (street && city && state) {
                setDisplayCity(city);
                const selectedStateFullName = states.find((s) => s.value === state)?.label;
                setDisplayState(selectedStateFullName || state);
                const location_data = await getGeocodingInfo(street, city, state);
                if (location_data) {
                const { lat, lng } = location_data;
                setPropLatitude(lat);
                setPropLongitude(lng);
                await getWeatherDetailsForWeek(lat, lng);
                } else {
                console.error("Failed to retrieve coordinates from geocoding API.");
                setErrorMessage("An error occurred. Please try again later.");
                setShowProgressBar(false);
                return;
                }
            } else {
                console.error("Please fill out all fields before searching.");
                setErrorMessage("Please fill out all fields.");
                setShowProgressBar(false);
                return;
            }
        }
    }
      
    await fetchWeatherDataFunc();
    clearInterval(interval);
    setProgress(100);
    
    setTimeout(() => setShowProgressBar(false),100);
    
    setDataLoaded(true);
  };
  

const clearFunction = () => {
    setStreet('');
    setCity('');
    setState('');
    setCurrentLocation(false);
    setSuggestions([]);
    setErrors({ street: '', city: '', state: '' });
    setStateTouched(false);
    setShowWeatherTabView(false);

    setActiveTab('results');
    setRawWeatherData(null);
    setErrorMessage(null);
};


  const handleInputChange = (field: string, value: string) => {
    if (field === "street") setStreet(value);
    if (field === "city") setCity(value);
    if (field === "state") setState(value);

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: ''
    }));
  };

  const getCitySuggestions = (input: string) => {
    if (!input || !isLoaded) {
      setSuggestions([]);
      return;
    }

    try {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        {
          input,
          types: ['(cities)'],
          componentRestrictions: { country: 'us' },
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            const citySuggestions = predictions.map((prediction) => prediction.terms[0].value);
            setSuggestions(citySuggestions);
          } else {
            setSuggestions([]);
          }
        }
      );
    } catch (error) {
      console.error("Failed to fetch city suggestions:", error);
      setSuggestions([]);
    }
  };

  const cityInputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    handleInputChange("city", value);
    getCitySuggestions(value);
  };

  const suggestionSelectHandler = (suggestion: string) => {
    setCity(suggestion);
    setSuggestions([]);
    setErrors((prevErrors) => ({
      ...prevErrors,
      city: ''
    }));
  };
  

  const handleStateFocus = () => {
    setStateTouched(true);
  };

  const handleStateBlur = () => {
    if (stateTouched) {
      validateField("state", state);
    }
  };

  const fetchIpInfo = async () => {
    const url = `https://ipinfo.io/?token=${ipInfoToken}`;
    try {
      console.log('Making ipInfo api call');
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const [lat, long] = data.loc.split(',').map(Number);
        setLatitude(lat);
        setLongitude(long);
        setIpDataLoaded(true);
        setDetectedCity(data.city || null);
        setDetectedState(data.region || null);
        
        // Debug purpose
        // console.log("Latitude:", lat, "Longitude:", long);
        // console.log("Detected City:", data.city, "Detected State:", data.region);
      } else {
        console.error("Failed to fetch IP-based data.");
        setIpDataLoaded(false);
      }
    } catch (error) {
      console.error("Error fetching IP data:", error);
      setIpDataLoaded(false);
    }
  };
  

  const getGeocodingInfo = async (street: string, city: string, state: string): Promise<{ lat: number; lng: number } | null> => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(street)},${encodeURIComponent(city)},${encodeURIComponent(state)}&key=${geocodingApiKey}`;
    try {
        console.log('Making geocoding API call');
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.results.length > 0) {
                const location = data.results[0].geometry.location;
                setLatitude(location.lat);
                setLongitude(location.lng);
                // Debug purpose
                // console.log('Set lat, long to:', location.lat, location.lng);
                // console.log("Latitude:", location.lat, "Longitude:", location.lng);
                // console.log("Entered City:", street, "Entered State:", state);

                return location;
            } else {
                console.error("No geocoding results found.");
            }
        } else {
            console.error("Failed to fetch geocoding data. Status:", response.status);
        }
    } catch (error) {
        console.error("Geocoding data fetch error:", error);
    }

    return null;
};


  

  const handleLocationCheckbox = async () => {
    if (!currentLocation) {
      await fetchIpInfo();
    }
    setCurrentLocation(!currentLocation);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isSearchDisabled = !currentLocation? (!street || !city || !state || !!errors.street || !!errors.city || !!errors.state): !ipDataLoaded;
  return (
    <>
      <div className="container mt-4 bg-light pt-4 pr-4 pl-4 rounded">
        <h1 className="text-center">Weather Search <span role="img" aria-label="cloud">⛅</span></h1>
        <form onSubmit={handleSearch}>
          <div className="form-group row justify-content-center">
            <div className="col-md-9">
              <FormInput 
                label="Street" 
                value={street} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("street", e.target.value)}
                onBlur={() => handleBlur("street", street)}
                required
                disabled={currentLocation}
                error={errors.street}
              />

              <div ref={wrapperRef}>
                <FormInput
                  label="City"
                  value={city}
                  onChange={cityInputChangeHandler}
                  onBlur={() => handleBlur("city", city)}
                  required
                  disabled={currentLocation}
                  suggestions={isLoaded ? suggestions : []}
                  onSuggestionClick={suggestionSelectHandler}
                  error={errors.city}
                />
              </div>

              <div className="form-group row" onFocus={handleStateFocus} onBlur={handleStateBlur}>
                  <label className="col-12 col-md-2 col-form-label">
                    State <span style={{ color: 'red' }}> *</span>
                  </label>
                  <div className="col-12 col-md-10">
                    <StateOptions
                      selectedState={state}
                      setState={(value) => handleInputChange('state', value)}
                      disabled={currentLocation}
                      error={stateTouched && !state ? ' ' : ''}
                    />
                  </div>
              </div>
              
              <hr />
              <div className="form-group row justify-content-center">
                
                <div className="form-group d-flex align-items-center justify-content-center">
                  <label className="mr-2" style={{ marginRight: '15px' }}>Autodetect Location*</label>
                  <input 
                    type="checkbox"
                    className="form-check-input"
                    checked={currentLocation}
                    onChange={handleLocationCheckbox}
                  />
                  <span style={{ marginLeft: '5px' }}>Current Location</span>
                </div>

                <div className="d-flex justify-content-center" style={{ marginTop: '0px', paddingTop: '0px', marginBottom: '0px', paddingBottom: '0px' }}>
                    <button type="submit" className="btn btn-primary me-2" disabled={isSearchDisabled}>
                        <FontAwesomeIcon icon={faSearch} /> Search
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={clearFunction}>
                    <i className="bi bi-list-nested"></i> Clear
                    </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        </div>
        <div className="mt-3 text-center mb-2"> 
            <button
                type="button"
                className={`btn ${activeTab === 'results' ? 'btn-primary' : 'btn-inactive'} me-2`}
                onClick={() => setActiveTab('results')}
            >
                Results
            </button>
            <button
                type="button"
                className={`btn ${activeTab === 'favorites' ? 'btn-primary' : 'btn-inactive'}`}
                onClick={() => setActiveTab('favorites')}
            >
                Favorites
            </button>
        </div>

        {activeTab === 'results' && (
      <>
        {errorMessage && (
          <div className="alert alert-danger mt-3" role="alert">
              {errorMessage}
          </div>
        )}

        {showProgressBar && (
          <div className="progress mb-3" role="progressbar" aria-label="Loading progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${progress}%` }}></div>
          </div>
        )}
        
        {dataLoaded && showWeatherTabView && !errorMessage && (
            <WeatherTabView 
                rawWeatherData={rawWeatherData} 
                errorMessage={errorMessage}
                city={displayCity}
                state={displayState}
                latitude={propLatitude}
                longitude={propLongitude}
                favoritesList={favoritesList}
                onFavoritesChange={getFavoritesList}
                onDeleteFavorite={deleteFavoriteItem}
            />
            )}
      </>
    )}

    {activeTab === 'favorites' && (
        <Favorites 
            favoritesList={favoritesList} 
            onDeleteFavorite={deleteFavoriteItem} 
            onFavoriteSearch={searchWeatherDetailsFromFavorites}
        />
    )}
  </>

  );
};

export default WeatherSearchForm;
