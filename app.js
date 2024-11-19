const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 3000;

// middleware para usar ficheiros estaticos de html css, e js
app.use(express.static(path.join(__dirname, 'public')));

// funcao para obter os dados meterologicos
app.get('/api/weather', async (req, res) => {
    const {lat, lon, city} = req.query; //declarar variaveis  para a cidade, e para latitude e longitode
    const API_KEY = 'b65b8941781a45609fd202458241511'; // chave da api
    let API_URL; // variavel para guardar a url da api


    //verifica se foi fernocido a cidade ou as coordenadas, se nao devolver.
    if (lat && lon) {
        API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=3`;
    } else if (city) {
        API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=3`;
    }else {
        return res.status(400).json({ error: 'Nenhuma cidade ou coordenadas fornecidas.' });
    }
    // tentar obter os dados
    try {
        
        const response = await axios.get(API_URL);
        res.json({
            city: response.data.location.name,
            country: response.data.location.country,
            current: response.data.current,
            forecast: response.data.forecast.forecastday,
        });//Se  der erro devolve o erro
    } catch (error) {
        console.error('Erro ao obter os dados:', error.response?.data ||error.message);
        res.status(500).json({ error: 'Ocorreu um erro inesperado no servidor.' });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});





