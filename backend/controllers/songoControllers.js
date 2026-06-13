// État global du jeu stocké en mémoire
let etatJeu = {
    tableJ1: [5, 5, 5, 5, 5, 5, 5],
    tableJ2: [5, 5, 5, 5, 5, 5, 5],
    scoreJ1: 0,
    scoreJ2: 0,
    tour: 1,
    statutJeu: 0
};

// Action : Récupérer l'état actuel
exports.obtenirEtat = (req, res) => {
    res.json(etatJeu);
};

// Action : Remettre la partie à zéro
exports.reinitialiser = (req, res) => {
    etatJeu = {
        tableJ1: [5, 5, 5, 5, 5, 5, 5],
        tableJ2: [5, 5, 5, 5, 5, 5, 5],
        scoreJ1: 0,
        scoreJ2: 0,
        tour: 1,
        statutJeu: 0
    };
    res.json(etatJeu);
};

// Action : Traiter le coup du joueur ou de l'IA
exports.jouerCoup = (req, res) => {
    const { idJoueur, caseChoisie } = req.body;

    if (etatJeu.statutJeu !== 0 || idJoueur !== etatJeu.tour) {
        return res.status(400).json({ erreur: "Ce n'est pas votre tour de jouer." });
    }

    // Logique du Joueur 1
    if (idJoueur === 1) {
        if (caseChoisie === undefined || caseChoisie < 0 || caseChoisie > 6) {
            return res.status(400).json({ erreur: "Indice de case invalide." });
        }

        let graines = etatJeu.tableJ1[caseChoisie];
        if (graines === 0) {
            return res.status(400).json({ erreur: "La case sélectionnée est vide." });
        }

        etatJeu.tableJ1[caseChoisie] = 0;
        let index = caseChoisie;
        let camp = 1;

        while (graines > 0) {
            if (camp === 1) {
                index++;
                if (index > 6) { index = 6;
                    camp = 2; }
            } else {
                index--;
                if (index < 0) { index = 0;
                    camp = 1; }
            }
            if (camp === 1 && index === caseChoisie) continue;
            if (camp === 1) etatJeu.tableJ1[index]++;
            else etatJeu.tableJ2[index]++;
            graines--;
        }

        if (camp === 2) {
            while (index >= 0 && index <= 6) {
                let c = etatJeu.tableJ2[index];
                if (c === 1 || c === 2 || c === 4) {
                    etatJeu.scoreJ1 += c;
                    etatJeu.tableJ2[index] = 0;
                    index--;
                } else { break; }
            }
        }

        if (etatJeu.scoreJ1 >= 36) etatJeu.statutJeu = 1;
        else etatJeu.tour = 2;

        // Logique de l'IA (Joueur 2)
    } else if (idJoueur === 2) {
        let casesValides = [];
        etatJeu.tableJ2.forEach((g, idx) => { if (g > 0) casesValides.push(idx); });

        if (casesValides.length > 0) {
            let choixIa = casesValides[Math.floor(Math.random() * casesValides.length)];
            let graines = etatJeu.tableJ2[choixIa];
            etatJeu.tableJ2[choixIa] = 0;
            let index = choixIa;
            let camp = 2;

            while (graines > 0) {
                if (camp === 1) {
                    index++;
                    if (index > 6) { index = 6;
                        camp = 2; }
                } else {
                    index--;
                    if (index < 0) { index = 0;
                        camp = 1; }
                }
                if (camp === 2 && index === choixIa) continue;
                if (camp === 1) etatJeu.tableJ1[index]++;
                else etatJeu.tableJ2[index]++;
                graines--;
            }

            if (camp === 1) {
                while (index >= 0 && index <= 6) {
                    let c = etatJeu.tableJ1[index];
                    if (c === 1 || c === 2 || c === 4) {
                        etatJeu.scoreJ2 += c;
                        etatJeu.tableJ1[index] = 0;
                        index++;
                    } else { break; }
                }
            }
        }

        if (etatJeu.scoreJ2 >= 36) etatJeu.statutJeu = 2;
        else etatJeu.tour = 1;
    }

    res.json(etatJeu);
};