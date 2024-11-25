let lastSearch = { type: 'geo', params: {} }; // Guardar o último tipo de pesquisa e parâmetros
let lastSearchWasError = false;

// Função para obter idioma selecionado na navbar
function getSelectedLanguage() {
    return document.querySelector('#language-selector').value;
}

// Função para obter o tempo por localização
function fetchWeatherByLocation(latitude, longitude) {
    const selectedLanguage = getSelectedLanguage();
    lastSearch = { type: 'location', params: { latitude, longitude } }; // Guardar a pesquisa atual
    fetch(
        `/api/weather?lat=${latitude}&lon=${longitude}&lang=${selectedLanguage}`
    )
        .then((response) => {
            if (!response.ok) {
                throw new Error('Localização não encontrada');
            }
            return response.json();
        })
        .then((data) => {
            if (!data || !data.city) {
                throw new Error('Dados inválidos recebidos do servidor');
            }
            updateWeatherCard(data);
        })
        .catch((err) => {
            console.error('Erro ao buscar tempo:', err);
            showError(
                selectedLanguage === 'pt'
                    ? 'Erro ao buscar dados do tempo. Por favor, tente novamente.'
                    : 'Error fetching weather data. Please try again.'
            );
        });
}

// Função para obter o tempo por nome da cidade
function fetchWeatherByCity(city) {
    const selectedLanguage = getSelectedLanguage();
    lastSearch = { type: 'city', params: { city } };

    fetch(`/api/weather?city=${city}&lang=${selectedLanguage}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Cidade não encontrada');
            }
            return response.json();
        })
        .then((data) => {
            if (!data || !data.city) {
                throw new Error('Dados inválidos recebidos do servidor');
            }
            lastSearchWasError = false;
            updateWeatherCard(data);
        })
        .catch((err) => {
            console.error('Erro ao buscar tempo:', err);
            lastSearchWasError = true;
            showError(
                selectedLanguage === 'pt'
                    ? 'Cidade não encontrada. Por favor, verifique o nome e tente novamente.'
                    : 'City not found. Please check the name and try again.'
            );
        });
}

// Função para repetir a última pesquisa com o idioma atualizado
function refetchLastSearch() {
    // Se a última pesquisa foi um erro, não tenta procurar novamente
    if (lastSearchWasError) {
        const selectedLanguage = getSelectedLanguage();
        showError(
            selectedLanguage === 'pt'
                ? 'Faça uma nova pesquisa para buscar dados do tempo.'
                : 'Please make a new search to fetch weather data.'
        );
        return;
    }

    const selectedLanguage = getSelectedLanguage();
    switch (lastSearch.type) {
        case 'location':
            const { latitude, longitude } = lastSearch.params;
            fetch(
                `/api/weather?lat=${latitude}&lon=${longitude}&lang=${selectedLanguage}`
            )
                .then((response) => response.json())
                .then((data) => updateWeatherCard(data))
                .catch((err) => {
                    console.error('Erro ao refazer busca:', err);
                    lastSearchWasError = true;
                });
            break;

        case 'city':
            const { city } = lastSearch.params;
            fetch(`/api/weather?city=${city}&lang=${selectedLanguage}`)
                .then((response) => response.json())
                .then((data) => updateWeatherCard(data))
                .catch((err) => {
                    console.error('Erro ao refazer busca:', err);
                    lastSearchWasError = true;
                });
            break;

        case 'geo':
            if (!lastSearchWasError) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        fetchWeatherByLocation(latitude, longitude);
                    },
                    (error) => {
                        console.error('Erro ao obter geolocalização:', error);
                        lastSearchWasError = true;
                        showError(
                            selectedLanguage === 'pt'
                                ? 'Erro ao obter sua localização. Por favor, faça uma nova pesquisa.'
                                : 'Error getting your location. Please make a new search.'
                        );
                    }
                );
            }
            break;

        default:
            console.error('Nenhuma pesquisa anterior encontrada.');
    }
}

// Actualizar o idioma ao alterar na navbar
document
    .getElementById('language-selector')
    .addEventListener('change', refetchLastSearch);

// Formatar tipo de data
function formatForecastDate(dateStr, index, language) {
    const [year, month, day] = dateStr.split('-');
    const formattedDate =
        language === 'pt' ? `${day}/${month}/${year}` : dateStr;

    // Definir o texto do dia baseado no idioma e índice
    let dayText = '';
    if (language === 'pt') {
        switch (index) {
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
        switch (index) {
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

// Função para actualizar a card com os dados meteorológicos
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
    forecastList.innerHTML = '';
    const language = getSelectedLanguage();

    data.forecast.forEach((day, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.innerHTML = `
            ${formatForecastDate(day.date, index, language)}
            <img src="https:${day.day.condition.icon}" alt="${
            day.day.condition.text
        }" class="me-2">
            ${day.day.avgtemp_c}°C - ${day.day.condition.text}
        `;
        forecastList.appendChild(listItem);
    });

    setWeatherBackgroundNavBar(
        data.current.condition.text,
        data.current.is_day,
        language
    );
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
    banner.className = 'weather-banner';

    // Arrays com as condições climáticas em ambos os idiomas
    const conditions = {
        sunny: {
            en: ['sunny', 'clear'],
            pt: ['sol', 'céu limpo', 'ensolarado'],
        },
        cloudy: {
            en: ['partly cloudy', 'cloudy', 'overcast'],
            pt: [
                'parcialmente nublado',
                'nublado',
                'encoberto',
                'predominantemente nublado',
            ],
        },
        rainy: {
            en: [
                'patchy rain possible',
                'patchy rain nearby',
                'light rain',
                'moderate rain',
                'heavy rain',
                'showers',
                'light rain shower',
                'moderate or heavy rain shower',
            ],
            pt: [
                'possibilidade de chuva irregular',
                'chuva fraca',
                'chuva moderada',
                'chuva forte',
                'aguaceiros',
                'chuvisco',
                'chuviscos',
                'períodos de chuva',
                'possibilidade de chuva',
                'chuva irregular',
                'pancadas de chuva',
            ],
        },
        thunderstorm: {
            en: [
                'thundery outbreaks possible',
                'patchy light rain with thunder',
                'moderate or heavy rain with thunder',
                'thunder',
            ],
            pt: [
                'possibilidade de trovoada',
                'chuva fraca com trovoada',
                'chuva moderada ou forte com trovoada',
                'trovoada',
                'tempestade',
                'tempestade com raios',
                'possibilidade de tempestade',
            ],
        },
        snowy: {
            en: [
                'patchy snow possible',
                'light snow',
                'moderate snow',
                'heavy snow',
                'blizzard',
            ],
            pt: [
                'possibilidade de neve irregular',
                'neve fraca',
                'neve moderada',
                'neve forte',
                'nevasca',
                'possibilidade de neve',
                'nevando',
            ],
        },
        foggy: {
            en: ['mist', 'fog', 'freezing fog'],
            pt: ['neblina', 'nevoeiro', 'nevoeiro congelante', 'névoa'],
        },
    };

    // Verificar cada tipo de condição
    const condition = conditionText.toLowerCase();
    if (
        conditions.sunny[language]?.some((text) =>
            condition.includes(text.toLowerCase())
        )
    ) {
        banner.classList.add(isDay ? 'bg-sunny-day' : 'bg-clear-night');
    } else if (
        conditions.cloudy[language]?.some((text) =>
            condition.includes(text.toLowerCase())
        )
    ) {
        banner.classList.add(isDay ? 'bg-cloudy-day' : 'bg-cloudy-night');
    } else if (
        conditions.rainy[language]?.some((text) =>
            condition.includes(text.toLowerCase())
        )
    ) {
        banner.classList.add(isDay ? 'bg-rainy-day' : 'bg-rainy-night');
    } else if (
        conditions.thunderstorm[language]?.some((text) =>
            condition.includes(text.toLowerCase())
        )
    ) {
        banner.classList.add(
            isDay ? 'bg-thunderstorm-day' : 'bg-thunderstorm-night'
        );
    } else if (
        conditions.snowy[language]?.some((text) =>
            condition.includes(text.toLowerCase())
        )
    ) {
        banner.classList.add(isDay ? 'bg-snowy-day' : 'bg-snowy-night');
    } else if (
        conditions.foggy[language]?.some((text) =>
            condition.includes(text.toLowerCase())
        )
    ) {
        banner.classList.add(isDay ? 'bg-foggy-day' : 'bg-foggy-night');
    } else {
        banner.classList.add('bg-default');
    }
}

function showError(message) {
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');

    errorMessage.textContent = message;
    errorAlert.style.display = 'block';

    document.getElementById('weather-card').style.display = 'none';

    setTimeout(() => {
        errorAlert.style.display = 'none';
    }, 5000);
}
