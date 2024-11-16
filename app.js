const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 3000;

// 
app.use(express.static(path.join(__dirname, 'public')));

// 
app.get('/api/weather', async (req, res) => {
    const city = req.query.city || 'Lisbon'; 
    const API_KEY = 'YOURAPIKEY'; // 
    const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=4`;

    try {
        const response = await axios.get(API_URL);
        res.json({
            city: response.data.location.name,
            current: response.data.current,
            forecast: response.data.forecast.forecastday,
        });
    } catch (error) {
        console.error('Erro ao buscar os dados:', error.message);
        res.status(500).json({ error: 'Erro ao buscar os dados do tempo.' });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});





