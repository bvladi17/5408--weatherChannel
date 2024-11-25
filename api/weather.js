const express = require('express');
const axios = require('axios');
const router = express.Router();

// Carregar variáveis de ambiente
require('dotenv').config({ path: 'dev.env' });

// Rota para obter os dados meteorológicos
router.get('/weather', async (req, res) => {
    let API_URL;
    const { lat: latitude, lon: longitude, city, lang = 'en' } = req.query; // Valor padrão 'en'

    if (latitude && longitude) {
        API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${process.env.API_KEY}&q=${latitude},${longitude}&days=3&lang=${lang}`;
    } else if (city) {
        API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${process.env.API_KEY}&q=${city}&days=3&lang=${lang}`;
    } else {
        return res.status(400).json({ error: 'Nenhuma cidade ou coordenadas fornecidas.' });
    }

    try {
        const response = await axios.get(API_URL);
        res.json({
            city: response.data.location.name,
            country: response.data.location.country,
            current: response.data.current,
            forecast: response.data.forecast.forecastday,
        });
    } catch (error) {
        console.error('Erro ao obter os dados:', error.response?.data || error.message);
        res.status(500).json({ error: 'Ocorreu um erro inesperado no servidor.' });
    }
});



module.exports = router;
