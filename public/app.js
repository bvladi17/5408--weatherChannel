// Função para obter o tempo com base na geolocalização
function fetchWeatherByLocation(lat, lon) {
    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => updateWeatherCard(data))
        .catch(err => console.error('Erro ao buscar tempo:', err));
}

// Função para obter o tempo por nome da cidade
function fetchWeatherByCity(city) {
    fetch(`/api/weather?city=${city}`)
        .then(response => response.json())
        .then(data => updateWeatherCard(data))
        .catch(err => console.error('Erro ao buscar tempo:', err));
}

// Atualizar do card com dados meteorológicos
function updateWeatherCard(data) {
    document.getElementById('weather-card').style.display = 'block';
    document.getElementById('weather-city').textContent = data.city;
    document.getElementById('weather-country').textContent = data.country;
    document.getElementById('current-temp').innerHTML = `
        <i class="fas fa-thermometer-half"></i> Temperatura atual: ${data.current.temp_c}°C
    `;
    document.getElementById('weather-condition').innerHTML = `
        <img src="https:${data.current.condition.icon}" alt="${data.current.condition.text}" class="me-2">
        ${data.current.condition.text}
    `;

    const forecastList = document.getElementById('forecast-list');
    forecastList.innerHTML = ''; // Limpar previsões anteriores

    data.forecast.forEach(day => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.innerHTML = `
            <i class="fas fa-calendar-day"></i> ${day.date}:
            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" class="me-2">
            ${day.day.avgtemp_c}°C - ${day.day.condition.text}
        `;
        forecastList.appendChild(listItem);
    });
}

// Obter localização inicial
navigator.geolocation.getCurrentPosition(
    (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByLocation(latitude, longitude);
    },
    (error) => {
        console.error('Erro ao obter geolocalização:', error);
        fetchWeatherByCity('Lisboa'); // Localização padrão
    }
);

// Lidar com pesquisa por cidade
document.getElementById('city-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const city = document.getElementById('city-input').value.trim();
    if (city) {
        fetchWeatherByCity(city);
    }
});
