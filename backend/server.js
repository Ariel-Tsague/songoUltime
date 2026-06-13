require('dotenv').config(); // Charge les variables du fichier .env
const express = require('express');
const path = require('path');
const songoRouter = require('./routes/songoRoutes');

const app = express();

// 1. Middlewares de configuration
app.use(express.json());

// 2. Déclaration du dossier statique
app.use(express.static(path.join(__dirname, '../public')));

// 3. Liaison des routes de l'API métier
app.use('/api/songo', songoRouter);

// 4. Route par défaut pour charger la page d'accueil 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'songo.html'));
});

// 5. Lancement de l'écoute du serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur Songo lancé sur le port ${PORT}`);
});
