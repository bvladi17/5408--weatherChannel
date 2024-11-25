let lastSearch = { type: 'geo', params: {} }; // Guarda o último tipo de pesquisa e parâmetros

// Obter idioma selecionado na navbar
function getSelectedLanguage() {
    return document.querySelector('#language-selector').value;
}

// Função para obter o tempo por localização
function fetchWeatherByLocation(latitude, longitude) {
    const selectedLanguage = getSelectedLanguage();
    lastSearch = { type: 'location', params: { latitude, longitude } }; // Guardar a pesquisa atual
    fetch(`/api/weather?lat=${latitude}&lon=${longitude}&lang=${selectedLanguage}`)
        .then(response => response.json())
        .then(data => updateWeatherCard(data))
        .catch(err => console.error('Erro ao buscar tempo:', err));
}

// Função para obter o tempo por nome da cidade
function fetchWeatherByCity(city) {
    const selectedLanguage = getSelectedLanguage();
    lastSearch = { type: 'city', params: { city } }; // Guardar a pesquisa atual
    fetch(`/api/weather?city=${city}&lang=${selectedLanguage}`)
        .then(response => response.json())
        .then(data => updateWeatherCard(data))
        .catch(err => console.error('Erro ao buscar tempo:', err));
}

// Função para repetir a última pesquisa com o idioma atualizado
function refetchLastSearch() {
    const selectedLanguage = getSelectedLanguage();
    switch (lastSearch.type) {
        case 'location':
            const { latitude, longitude } = lastSearch.params;
            fetch(`/api/weather?lat=${latitude}&lon=${longitude}&lang=${selectedLanguage}`)
                .then(response => response.json())
                .then(data => updateWeatherCard(data))
                .catch(err => console.error('Erro ao refazer busca:', err));
            break;

        case 'city':
            const { city } = lastSearch.params;
            fetch(`/api/weather?city=${city}&lang=${selectedLanguage}`)
                .then(response => response.json())
                .then(data => updateWeatherCard(data))
                .catch(err => console.error('Erro ao refazer busca:', err));
            break;

        case 'geo':
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
            break;

        default:
            console.error('Nenhuma pesquisa anterior encontrada.');
    }
}

// Atualizar o idioma ao alterar na navbar
document.getElementById('language-selector').addEventListener('change', refetchLastSearch);

// Adicionar esta função auxiliar
function formatForecastDate(dateStr, index, language) {
    // Formatar a data apenas se for português
    const [year, month, day] = dateStr.split('-');
    const formattedDate = language === 'pt' 
        ? `${day}/${month}/${year}`  // Formato português: dd/mm/yyyy
        : dateStr;                   // Mantém formato original: yyyy-mm-dd
    
    // Definir o texto do dia baseado no idioma e índice
    let dayText = '';
    if (language === 'pt') {
        switch(index) {
            case 0:
                dayText = 'Amanhã';
                break;
            case 1:
                dayText = 'Depois de amanhã';
                break;
            case 2:
                dayText = 'Daqui a três dias';
                break;
        }
    } else {
        switch(index) {
            case 0:
                dayText = 'Tomorrow';
                break;
            case 1:
                dayText = 'The day after tomorrow';
                break;
            case 2:
                dayText = 'In three days';
                break;
        }
    }
    
    return `${dayText} - ${formattedDate}`;
}

// Função para atualizar o card com os dados meteorológicos
function updateWeatherCard(data) {
    document.getElementById('weather-card').style.display = 'block';
    document.getElementById('weather-city').textContent = data.city;
    document.getElementById('weather-country').textContent = data.country;
    document.getElementById('current-temp').innerHTML = `
        <i class="fas fa-thermometer-half"></i> ${data.current.temp_c}°C
    `;
    document.getElementById('weather-condition').innerHTML = `
        <img src="https:${data.current.condition.icon}" alt="${data.current.condition.text}" class="me-2">
        ${data.current.condition.text}
    `;

    const forecastList = document.getElementById('forecast-list');
    forecastList.innerHTML = ''; // Limpar previsões anteriores
    const language = getSelectedLanguage();

    data.forecast.forEach((day, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.innerHTML = `
            ${formatForecastDate(day.date, index, language)}
            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" class="me-2">
            ${day.day.avgtemp_c}°C - ${day.day.condition.text}
        `;
        forecastList.appendChild(listItem);
    });

    setWeatherBackgroundNavBar(data.current.condition.text, data.current.is_day, language);
}

// Obter localização inicial (default geolocalização ao carregar a página)
navigator.geolocation.getCurrentPosition(
    (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByLocation(latitude, longitude);
    },
    (error) => {
        console.error('Erro ao obter geolocalização:', error);
        fetchWeatherByCity('Lisboa'); // Localização padrão
        lastSearch = { type: 'city', params: { city: 'Lisboa' } }; // Guardar como padrão
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

// Função para definir o background da navbar com base na condição climática
function setWeatherBackgroundNavBar(conditionText, isDay, language) {
    const banner = document.getElementById('weather-banner');
    
    // Resetar classes
    banner.className = 'weather-banner';

    // Arrays com as condições climáticas em ambos os idiomas
    const conditions = {
        sunny: {
            en: ['sunny', 'clear'],
            pt: ['sol', 'céu limpo', 'ensolarado']
        },
        cloudy: {
            en: ['partly cloudy', 'cloudy', 'overcast'],
            pt: ['parcialmente nublado', 'nublado', 'encoberto', 'predominantemente nublado']
        },
        rainy: {
            en: ['patchy rain possible', 'light rain', 'moderate rain', 'heavy rain', 'showers', 'light rain shower', 'moderate or heavy rain shower'],
            pt: ['possibilidade de chuva irregular', 'chuva fraca', 'chuva moderada', 'chuva forte', 
                'aguaceiros', 'chuvisco', 'chuviscos', 'períodos de chuva', 'possibilidade de chuva',
                'chuva irregular', 'pancadas de chuva']
        },
        thunderstorm: {
            en: ['thundery outbreaks possible', 'patchy light rain with thunder', 'moderate or heavy rain with thunder', 'thunder'],
            pt: ['possibilidade de trovoada', 'chuva fraca com trovoada', 'chuva moderada ou forte com trovoada',
                'trovoada', 'tempestade', 'tempestade com raios', 'possibilidade de tempestade']
        },
        snowy: {
            en: ['patchy snow possible', 'light snow', 'moderate snow', 'heavy snow', 'blizzard'],
            pt: ['possibilidade de neve irregular', 'neve fraca', 'neve moderada', 'neve forte', 'nevasca',
                'possibilidade de neve', 'nevando']
        },
        foggy: {
            en: ['mist', 'fog', 'freezing fog'],
            pt: ['neblina', 'nevoeiro', 'nevoeiro congelante', 'névoa']
        }
    };

    // Converter condição para minúsculas para comparação
    const condition = conditionText.toLowerCase();

    // Verificar cada tipo de condição
    if (conditions.sunny[language]?.some(text => condition.includes(text.toLowerCase()))) {
        banner.classList.add(isDay ? 'bg-sunny-day' : 'bg-clear-night');
    }
    else if (conditions.cloudy[language]?.some(text => condition.includes(text.toLowerCase()))) {
        banner.classList.add(isDay ? 'bg-cloudy-day' : 'bg-cloudy-night');
    }
    else if (conditions.rainy[language]?.some(text => condition.includes(text.toLowerCase()))) {
        banner.classList.add(isDay ? 'bg-rainy-day' : 'bg-rainy-night');
    }
    else if (conditions.thunderstorm[language]?.some(text => condition.includes(text.toLowerCase()))) {
        banner.classList.add(isDay ? 'bg-thunderstorm-day' : 'bg-thunderstorm-night');
    }
    else if (conditions.snowy[language]?.some(text => condition.includes(text.toLowerCase()))) {
        banner.classList.add(isDay ? 'bg-snowy-day' : 'bg-snowy-night');
    }
    else if (conditions.foggy[language]?.some(text => condition.includes(text.toLowerCase()))) {
        banner.classList.add(isDay ? 'bg-foggy-day' : 'bg-foggy-night');
    }
    else {
        banner.classList.add('bg-default');
    }
}