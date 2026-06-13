const express = require('express');
const router = express.Router();
const songoController = require('../controllers/songoControllers');

// Définition des routes et liaison avec les fonctions du contrôleur
router.get('/', songoController.obtenirEtat);
router.post('/delete', songoController.reinitialiser);
router.post('/jouer', songoController.jouerCoup);

module.exports = router;