const express = require('express');
const path = require('path');
const liveReload = require('livereload');
const connectLiveReload = require('connect-livereload');
const app = express();

// Activar LiveReload
const liveReloadServer = liveReload.createServer();
liveReloadServer.watch(__dirname + '/public');
app.use(connectLiveReload());

// Carregar variáveis de ambiente
require('dotenv').config({path: 'dev.env'});

// Middleware para servir ficheiros estáticos tais como imagens, CSS e JavaScript
app.use(express.static(path.join(__dirname, 'public')));

// Importar e usar as rotas da API
const weatherRoutes = require('./api/weather');
app.use('/api', weatherRoutes);

// Reiniciar o browser quando houver alterações
liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
        liveReloadServer.refresh('/');
    }, 100);
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});





