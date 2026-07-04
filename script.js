(function() {
  // ---------- DOM refs ----------
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const autocompleteList = document.getElementById('autocompleteList');
  const cityName = document.getElementById('cityName');
  const dateTime = document.getElementById('dateTime');
  const weatherIcon = document.getElementById('weatherIcon');
  const temperature = document.getElementById('temperature');
  const weatherDesc = document.getElementById('weatherDesc');
  const humidity = document.getElementById('humidity');
  const windSpeed = document.getElementById('windSpeed');
  const visibility = document.getElementById('visibility');
  const errorMsg = document.getElementById('errorMsg');
  const weatherBg = document.getElementById('weatherBg');
  const locationOverlay = document.getElementById('locationOverlay');
  const allowLocationBtn = document.getElementById('allowLocationBtn');
  const manualLocationBtn = document.getElementById('manualLocationBtn');

  // Forecast elements
  const forecastDay1 = document.getElementById('forecastDay1');
  const forecastDay2 = document.getElementById('forecastDay2');
  const forecastDay3 = document.getElementById('forecastDay3');

  // Advisory elements
  const advisoryBox = document.getElementById('advisoryBox');
  const advisoryIcon = document.getElementById('advisoryIcon');
  const advisoryTitle = document.getElementById('advisoryTitle');
  const advisoryMessage = document.getElementById('advisoryMessage');

  // ---------- API key ----------
  const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';
  const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';
  const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

  // ---------- State ----------
  let selectedIndex = -1;
  let suggestions = [];

  // ---------- Background mapping ----------
  function getWeatherBackground(weatherMain) {
    const bgMap = {
      'Clear': 'clear',
      'Clouds': 'clouds',
      'Rain': 'rain',
      'Drizzle': 'rain',
      'Thunderstorm': 'thunderstorm',
      'Snow': 'snow',
      'Mist': 'mist',
      'Smoke': 'mist',
      'Haze': 'mist',
      'Dust': 'mist',
      'Fog': 'mist',
      'Sand': 'mist',
      'Ash': 'mist',
      'Squall': 'thunderstorm',
      'Tornado': 'thunderstorm'
    };
    return bgMap[weatherMain] || 'default';
  }

  function updateBackground(weatherMain) {
    const bgClass = getWeatherBackground(weatherMain);
    weatherBg.className = 'weather-bg';
    void weatherBg.offsetWidth;
    weatherBg.classList.add(bgClass);
  }

  // ---------- Weather Advisory ----------
  function updateAdvisory(weatherData) {
    const weatherMain = weatherData.weather[0].main;
    const weatherDesc = weatherData.weather[0].description;
    const temp = weatherData.main.temp;
    const humidityValue = weatherData.main.humidity;
    const windSpeedValue = weatherData.wind.speed;
    const rain = weatherData.rain ? weatherData.rain['1h'] || weatherData.rain['3h'] : 0;
    
    let icon = 'fa-info-circle';
    let title = 'Weather Advisory';
    let message = 'Stay safe and enjoy your day!';
    let boxClass = '';

    // Rain check
    if (rain && rain > 0) {
      const rainPercentage = Math.min(Math.round((rain / 5) * 100), 100);
      if (rainPercentage > 60) {
        icon = 'fa-umbrella';
        title = '⚠️ Heavy Rain Alert';
        message = `There's a ${rainPercentage}% chance of heavy rain today. Don't forget your umbrella and raincoat to avoid getting wet!`;
        boxClass = 'rain';
      } else if (rainPercentage > 30) {
        icon = 'fa-cloud-rain';
        title = '☔ Light Rain Expected';
        message = `Light rain predicted (${rainPercentage}% chance). Keep an umbrella handy just in case.`;
        boxClass = 'rain';
      } else {
        icon = 'fa-cloud-sun';
        title = '🌤️ Mostly Dry';
        message = `Only a ${rainPercentage}% chance of rain. You're probably safe without an umbrella.`;
        boxClass = 'cloud';
      }
    } else if (weatherMain === 'Rain' || weatherMain === 'Drizzle') {
      icon = 'fa-umbrella';
      title = '☔ Rain Alert';
      message = 'Rain is expected today. Don\'t forget your umbrella and raincoat to stay dry!';
      boxClass = 'rain';
    } else if (weatherMain === 'Thunderstorm') {
      icon = 'fa-bolt';
      title = '⚡ Storm Warning';
      message = 'Thunderstorms expected! Stay indoors and avoid open areas for your safety.';
      boxClass = 'storm';
    } else if (weatherMain === 'Clear') {
      if (temp > 35) {
        icon = 'fa-sun';
        title = '☀️ Extreme Heat Warning';
        message = `It's ${Math.round(temp)}°C today! Stay hydrated, wear sunscreen, and avoid direct sunlight between 11 AM - 4 PM. Find shade when possible.`;
        boxClass = 'hot';
      } else if (temp > 28) {
        icon = 'fa-sun';
        title = '☀️ Sunny & Warm';
        message = `Beautiful sunny day at ${Math.round(temp)}°C. Perfect for outdoor activities, don't forget sunscreen and stay hydrated!`;
        boxClass = 'sun';
      } else {
        icon = 'fa-sun';
        title = '☀️ Clear Skies';
        message = 'Clear and pleasant weather. Enjoy the sunshine and fresh air!';
        boxClass = 'sun';
      }
    } else if (weatherMain === 'Clouds') {
      if (temp < 10) {
        icon = 'fa-cloud';
        title = '☁️ Cold & Cloudy';
        message = 'Cloudy and cold today. Dress warmly and layer up if going outside.';
        boxClass = 'cold';
      } else {
        icon = 'fa-cloud';
        title = '☁️ Cloudy Skies';
        message = 'Overcast today but no rain expected. A good day for indoor activities.';
        boxClass = 'cloud';
      }
    } else if (weatherMain === 'Snow') {
      icon = 'fa-snowflake';
      title = '❄️ Snow Alert';
      message = 'Snow is falling! Stay warm, wear appropriate footwear, and be careful on slippery surfaces.';
      boxClass = 'cold';
    } else if (weatherMain === 'Mist' || weatherMain === 'Fog' || weatherMain === 'Haze') {
      icon = 'fa-smog';
      title = '🌫️ Low Visibility';
      message = 'Foggy conditions with reduced visibility. Drive carefully, use fog lights, and maintain safe distance.';
      boxClass = 'wind';
    }

    // Wind advisory
    if (windSpeedValue > 10) {
      message += ` 💨 Strong winds at ${windSpeedValue.toFixed(1)} m/s - secure loose objects outdoors and be cautious.`;
      boxClass = 'wind';
    } else if (windSpeedValue > 6) {
      message += ` 🍃 Moderate winds at ${windSpeedValue.toFixed(1)} m/s - a light jacket might be comfortable.`;
    }

    // Humidity advisory
    if (humidityValue > 80) {
      if (!boxClass || boxClass === '') {
        icon = 'fa-droplet';
        title = '💧 High Humidity';
        message = `Humidity is ${humidityValue}% today. You might feel sticky - stay hydrated and use AC if needed to stay comfortable.`;
        boxClass = 'rain';
      } else {
        message += ` 💧 Humidity is ${humidityValue}% - stay hydrated.`;
      }
    } else if (humidityValue < 20 && temp > 25) {
      if (!boxClass || boxClass === '') {
        icon = 'fa-wind';
        title = '💨 Dry Conditions';
        message = `Low humidity (${humidityValue}%) with warm temperatures. Keep your skin moisturized, drink water regularly, and use a humidifier if needed.`;
        boxClass = 'wind';
      }
    }

    // Health advisory based on temperature
    if (temp > 40) {
      message += ' 🌡️ Dangerous heat levels! Stay indoors, drink water, and check on vulnerable family members.';
      boxClass = 'hot';
    } else if (temp < 0) {
      message += ' 🧊 Freezing temperatures! Dress in layers, protect exposed skin, and limit time outdoors.';
      boxClass = 'cold';
    }

    // Update DOM
    advisoryIcon.innerHTML = `<i class="fas ${icon}"></i>`;
    advisoryTitle.textContent = title;
    advisoryMessage.textContent = message;
    
    // Set box class
    advisoryBox.className = 'advisory-box';
    if (boxClass) {
      advisoryBox.classList.add(boxClass);
    }
  }

  // ---------- Helpers ----------
  function formatDate(unixTimestamp, timezoneOffset) {
    const utcDate = new Date(unixTimestamp * 1000);
    const localDate = new Date(utcDate.getTime() + timezoneOffset * 1000);
    const options = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return localDate.toLocaleString('en-GB', options);
  }

  function formatDay(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function getRainProbability(forecastItem) {
    if (forecastItem.rain && forecastItem.rain['3h']) {
      const rainVolume = forecastItem.rain['3h'];
      const probability = Math.min(Math.round((rainVolume / 5) * 100), 100);
      return probability;
    }
    if (forecastItem.pop) {
      return Math.round(forecastItem.pop * 100);
    }
    const weatherMain = forecastItem.weather[0].main;
    if (weatherMain === 'Rain' || weatherMain === 'Drizzle') return Math.floor(Math.random() * 40) + 60;
    if (weatherMain === 'Clouds') return Math.floor(Math.random() * 30) + 20;
    if (weatherMain === 'Thunderstorm') return Math.floor(Math.random() * 30) + 70;
    return Math.floor(Math.random() * 30);
  }

  // ---------- Update UI ----------
  function updateUI(data) {
    const { name, sys, dt, timezone, weather, main, wind, visibility: vis } = data;
    
    cityName.textContent = `${name}, ${sys.country}`;
    dateTime.textContent = formatDate(dt, timezone);
    const iconCode = weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherIcon.alt = weather[0].description;
    temperature.innerHTML = `${Math.round(main.temp)}<sup>°C</sup>`;
    weatherDesc.textContent = weather[0].description;
    humidity.innerHTML = `${main.humidity}<small>%</small>`;
    windSpeed.innerHTML = `${wind.speed.toFixed(1)}<small>m/s</small>`;
    const visKm = (vis / 1000).toFixed(1);
    visibility.innerHTML = `${visKm}<small>km</small>`;
    
    // Update background
    updateBackground(weather[0].main);
    
    // Update advisory
    updateAdvisory(data);
    
    errorMsg.classList.remove('show');
  }

  // ---------- Forecast ----------
  async function fetchForecast(lat, lon) {
    try {
      const url = `${FORECAST_API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch forecast');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return null;
    }
  }

  function updateForecast(forecastData) {
    if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
      setDefaultForecast();
      return;
    }

    // Get one forecast per day
    const dailyForecasts = [];
    const usedDates = new Set();
    
    for (let i = 0; i < forecastData.list.length && dailyForecasts.length < 3; i++) {
      const item = forecastData.list[i];
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!usedDates.has(date)) {
        usedDates.add(date);
        dailyForecasts.push(item);
      }
    }

    // If we still don't have 3 days, use whatever we have
    while (dailyForecasts.length < 3 && dailyForecasts.length < forecastData.list.length) {
      const idx = dailyForecasts.length;
      if (idx < forecastData.list.length) {
        const item = forecastData.list[idx];
        const date = new Date(item.dt * 1000).toDateString();
        if (!usedDates.has(date)) {
          usedDates.add(date);
          dailyForecasts.push(item);
        } else {
          dailyForecasts.push(forecastData.list[Math.min(idx + 1, forecastData.list.length - 1)]);
        }
      }
    }

    // Update forecast items
    const forecastElements = [forecastDay1, forecastDay2, forecastDay3];
    forecastElements.forEach((el, index) => {
      if (index < dailyForecasts.length) {
        const item = dailyForecasts[index];
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = date.getDate();
        
        el.querySelector('.forecast-date').textContent = `${dayName} ${dayNum}`;
        el.querySelector('.forecast-temp').textContent = `${Math.round(item.main.temp)}°C`;
        
        const rainProb = getRainProbability(item);
        el.querySelector('.forecast-rain').innerHTML = `<i class="fas fa-umbrella"></i> ${rainProb}%`;
        
        const iconCode = item.weather[0].icon;
        el.querySelector('img').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        el.querySelector('img').alt = item.weather[0].description;
      } else {
        el.querySelector('.forecast-date').textContent = '--';
        el.querySelector('.forecast-temp').textContent = '--°C';
        el.querySelector('.forecast-rain').innerHTML = '<i class="fas fa-umbrella"></i> --%';
        el.querySelector('img').src = 'https://openweathermap.org/img/wn/03d@2x.png';
      }
    });
  }

  function setDefaultForecast() {
    const forecastElements = [forecastDay1, forecastDay2, forecastDay3];
    forecastElements.forEach((el) => {
      el.querySelector('.forecast-date').textContent = '--';
      el.querySelector('.forecast-temp').textContent = '--°C';
      el.querySelector('.forecast-rain').innerHTML = '<i class="fas fa-umbrella"></i> --%';
      el.querySelector('img').src = 'https://openweathermap.org/img/wn/03d@2x.png';
    });
  }

  // ---------- Weather fetch with forecast ----------
  async function fetchWeatherWithForecast(city) {
    if (!city || city.trim() === '') {
      showError('Please enter a city name.');
      return;
    }

    const cityClean = city.trim();
    const originalBtnText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading';
    searchBtn.disabled = true;
    weatherBg.classList.add('loading');

    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityClean)}&units=metric&appid=${API_KEY}`;
      const weatherResponse = await fetch(weatherUrl);

      if (!weatherResponse.ok) {
        if (weatherResponse.status === 404) {
          showError('City not found. Please check the spelling.');
        } else if (weatherResponse.status === 401) {
          showError('API key issue. Please set a valid OpenWeather key.');
        } else {
          showError('Something went wrong. Try again later.');
        }
        setDefaultForecast();
        return;
      }

      const weatherData = await weatherResponse.json();
      updateUI(weatherData);

      // Fetch and update forecast
      const { lat, lon } = weatherData.coord;
      const forecastData = await fetchForecast(lat, lon);
      updateForecast(forecastData);

      autocompleteList.classList.remove('active');
      suggestions = [];
    } catch (error) {
      console.error('Fetch error:', error);
      showError('Network error. Check your connection.');
      setDefaultForecast();
    } finally {
      searchBtn.innerHTML = originalBtnText;
      searchBtn.disabled = false;
      weatherBg.classList.remove('loading');
    }
  }

  // ---------- Geolocation ----------
  async function fetchWeatherByCoords(lat, lon) {
    const originalBtnText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading';
    searchBtn.disabled = true;
    weatherBg.classList.add('loading');

    try {
      const reverseUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
      const reverseResponse = await fetch(reverseUrl);
      const reverseData = await reverseResponse.json();
      
      if (reverseData && reverseData.length > 0) {
        const cityName = reverseData[0].name;
        cityInput.value = cityName;
        await fetchWeatherWithForecast(cityName);
      } else {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        updateUI(weatherData);
        
        const forecastData = await fetchForecast(lat, lon);
        updateForecast(forecastData);
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      showError('Could not fetch weather for your location. Please search manually.');
      setDefaultForecast();
    } finally {
      searchBtn.innerHTML = originalBtnText;
      searchBtn.disabled = false;
      weatherBg.classList.remove('loading');
      locationOverlay.classList.add('hidden');
    }
  }

  // ---------- Location handlers ----------
  function requestLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          locationOverlay.classList.add('hidden');
          const defaultCity = 'Kaduna';
          cityInput.value = defaultCity;
          fetchWeatherWithForecast(defaultCity);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      locationOverlay.classList.add('hidden');
      const defaultCity = 'Kaduna';
      cityInput.value = defaultCity;
      fetchWeatherWithForecast(defaultCity);
    }
  }

  function handleManualLocation() {
    locationOverlay.classList.add('hidden');
    cityInput.focus();
    const defaultCity = 'Kaduna';
    cityInput.value = defaultCity;
    fetchWeatherWithForecast(defaultCity);
  }

  // ---------- Autocomplete ----------
  async function fetchCitySuggestions(query) {
    if (!query || query.length < 2) {
      autocompleteList.classList.remove('active');
      suggestions = [];
      return;
    }

    try {
      const url = `${GEO_API_URL}?q=${encodeURIComponent(query)}&limit=8&appid=${API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch city suggestions');
      }
      
      const data = await response.json();
      suggestions = data.map(city => ({
        name: city.name,
        country: city.country,
        state: city.state || '',
        lat: city.lat,
        lon: city.lon
      }));
      
      renderSuggestions(suggestions, query);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      suggestions = [];
      autocompleteList.classList.remove('active');
    }
  }

  function renderSuggestions(items, query) {
    if (!items || items.length === 0) {
      autocompleteList.classList.remove('active');
      return;
    }

    const lowerQuery = query.toLowerCase();
    autocompleteList.innerHTML = items.map((item, index) => {
      const displayName = item.state ? `${item.name}, ${item.state}` : item.name;
      const highlightName = displayName.replace(
        new RegExp(`(${lowerQuery})`, 'gi'),
        '<span class="highlight">$1</span>'
      );
      return `
        <div class="autocomplete-item" data-index="${index}" data-name="${item.name}" data-country="${item.country}" data-lat="${item.lat}" data-lon="${item.lon}">
          <i class="fas fa-city"></i>
          <span>${highlightName}</span>
          <span class="country">${item.country}</span>
        </div>
      `;
    }).join('');

    autocompleteList.classList.add('active');
    selectedIndex = -1;
    updateActiveItem();
  }

  function updateActiveItem() {
    const items = autocompleteList.querySelectorAll('.autocomplete-item');
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  function selectCity(index) {
    const items = autocompleteList.querySelectorAll('.autocomplete-item');
    if (index >= 0 && index < items.length) {
      const item = items[index];
      const cityName = item.dataset.name;
      cityInput.value = cityName;
      autocompleteList.classList.remove('active');
      suggestions = [];
      fetchWeatherWithForecast(cityName);
    }
  }

  // ---------- Error handler ----------
  function showError(message) {
    errorMsg.textContent = message || 'City not found. Try again.';
    errorMsg.classList.add('show');
  }

  // ---------- Event Listeners ----------
  allowLocationBtn.addEventListener('click', requestLocation);
  manualLocationBtn.addEventListener('click', handleManualLocation);

  cityInput.addEventListener('input', function(e) {
    const query = this.value.trim();
    if (query.length >= 2) {
      fetchCitySuggestions(query);
    } else {
      autocompleteList.classList.remove('active');
      suggestions = [];
    }
  });

  cityInput.addEventListener('keydown', function(e) {
    const items = autocompleteList.querySelectorAll('.autocomplete-item');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateActiveItem();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateActiveItem();
      }
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        e.preventDefault();
        selectCity(selectedIndex);
      } else if (this.value.trim()) {
        e.preventDefault();
        autocompleteList.classList.remove('active');
        fetchWeatherWithForecast(this.value.trim());
      }
    } else if (e.key === 'Escape') {
      autocompleteList.classList.remove('active');
      suggestions = [];
    }
  });

  autocompleteList.addEventListener('click', function(e) {
    const item = e.target.closest('.autocomplete-item');
    if (item) {
      const index = parseInt(item.dataset.index);
      selectCity(index);
    }
  });

  searchBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
      autocompleteList.classList.remove('active');
      suggestions = [];
      fetchWeatherWithForecast(city);
    } else {
      showError('Please enter a city name.');
    }
  });

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-wrapper')) {
      autocompleteList.classList.remove('active');
    }
  });

  // ---------- Initialize ----------
  setTimeout(() => {
    locationOverlay.classList.remove('hidden');
  }, 500);

  // Expose for debugging
  window.__weatherApp = { 
    fetchWeatherWithForecast, 
    fetchCitySuggestions,
    requestLocation,
    handleManualLocation,
    updateAdvisory
  };
})();