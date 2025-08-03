function getWeatherIcon(code) {
  if (code === 0) return '☀️';
  if ([1, 2, 3].includes(code)) return '⛅';
  if ([45, 48].includes(code)) return '🌥️';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌦️';
  if ([71, 73, 75, 85, 86].includes(code)) return '❄️';
  return '🌡️';
}

function getBackgroundImage(code) {
  if (code === 0) return 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80';
  if ([1, 2, 3].includes(code)) return 'https://images.unsplash.com/photo-1508614999368-9260051297c3?auto=format&fit=crop&w=1400&q=80';
  if ([45, 48].includes(code)) return 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=1400&q=80';
  if ([51, 61, 63, 65, 80, 81, 82].includes(code)) return 'https://images.unsplash.com/photo-1521805103424-d8f8430e893f?auto=format&fit=crop&w=1400&q=80';
  if ([71, 73, 75, 85, 86].includes(code)) return 'https://images.unsplash.com/photo-1608889175605-5f88f4dcf44e?auto=format&fit=crop&w=1400&q=80';
  return 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1400&q=80';
}

async function getWeather() {
  const city = document.getElementById('cityInput').value;
  const weatherInfo = document.getElementById('weatherInfo');
  weatherInfo.innerHTML = 'Loading...';

  try {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      weatherInfo.innerHTML = 'City not found.';
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,weathercode,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,sunrise,sunset&current_weather=true&timezone=auto`);
    const weatherData = await weatherRes.json();

    const current = weatherData.current_weather;
    const daily = weatherData.daily;
    const humidity = weatherData.hourly.relative_humidity_2m[0];
    const wind = current.windspeed;
    const weatherCode = current.weathercode;

    document.body.style.backgroundImage = `url('${getBackgroundImage(weatherCode)}')`;

    let html = `
      <div class="box location-box">
        <h4>📍 Location</h4>
        <p>${name}, ${country}</p>
      </div>
      <div class="box weather-box">
        <h4>${getWeatherIcon(weatherCode)} Current Weather</h4>
        <p>Temp: ${current.temperature}°C</p>
        <p>Wind: ${wind} km/h</p>
        <p>Humidity: ${humidity}%</p>
      </div>
      <div class="box sun-box">
        <h4>🌄 Sunrise & Sunset</h4>
        <p>Sunrise: ${daily.sunrise[0].split('T')[1]}</p>
        <p>Sunset: ${daily.sunset[0].split('T')[1]}</p>
      </div>
      <div class="box aqi-box">
        <h4>🧼 Air Quality</h4>
        <p style="color:#fff; font-weight: bold;">Good (Sample)</p>
      </div>
      <div class="box forecast-box">
        <h4>🗓️ 7-Day Forecast</h4>
        <ul class="forecast-list">
    `;

    for (let i = 0; i < 7; i++) {
      const day = new Date(daily.time[i]).toLocaleDateString("en-US", { weekday: 'short' });
      html += `<li>${day} (${daily.time[i]}) — ${getWeatherIcon(daily.weathercode[i])} ${daily.temperature_2m_min[i]}°C / ${daily.temperature_2m_max[i]}°C</li>`;
    }

    html += '</ul></div>';
    weatherInfo.innerHTML = html;
  } catch (err) {
    weatherInfo.innerHTML = 'Error loading weather data.';
    console.error(err);
  }
}
