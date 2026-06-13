document.addEventListener('DOMContentLoaded', () => {
    const sonClic = new Audio('sounds/son1.mp3');
    const sonScore = new Audio('sounds/son2.mp3');
    const sonVictoire = new Audio('sounds/son3.mp3');

    const cases1 = document.querySelectorAll('.caseJ1');
    const cases2 = document.querySelectorAll('.caseJ2');
    const infos = document.getElementById('infos');
    const scoreJ1 = document.getElementById('score1');
    const scoreJ2 = document.getElementById('score2');
    const res = document.getElementById('res');
    const restart = document.getElementById('restart');

    const btnIa = document.getElementById('btnIa');
    const btnP2p = document.getElementById('btnP2p');
    const modesPrinci = document.getElementById('modesPrinci');
    const sousMenuIa = document.getElementById('sousMenuIa');
    const sousMenuP2p = document.getElementById('sousMenuP2p');

    const btnCfgIa = document.getElementById('cfgIa');
    const valider = document.getElementById('valider');
    const champs = document.getElementById('champsPseudos');
    const grpJ2 = document.getElementById('grpJ2');
    const nomInput = document.getElementById('champNom');
    const nomInput2 = document.getElementById('champNom2');
    const roleAffiche = document.getElementById('roleAffiche');

    const btnCreer = document.getElementById('creerPartie');
    const btnRejoindre = document.getElementById('rejoindrePartie');
    const zoneId = document.getElementById('zoneId');
    const zoneRejoindre = document.getElementById('zoneRej');
    const partageId = document.getElementById('partageId');
    const codeHote = document.getElementById('codeHote');
    const btnValiderConnexion = document.getElementById('validerConnexion');

    let monPeer = null;
    let connexionP2P = null;
    let monRole = 1;
    let modeActuel = "";
    let ancienScoreJ1 = 0;
    let ancienScoreJ2 = 0;

    let tableVirtuelleJ1 = [5, 5, 5, 5, 5, 5, 5];
    let tableVirtuelleJ2 = [5, 5, 5, 5, 5, 5, 5];

    // Navigation des menus
    if (btnIa) {
        btnIa.addEventListener('click', () => {
            modesPrinci.style.display = 'none';
            sousMenuIa.style.display = 'flex';
        });
    }

    if (btnP2p) {
        btnP2p.addEventListener('click', () => {
            modesPrinci.style.display = 'none';
            sousMenuP2p.style.display = 'flex';
        });
    }

    document.querySelectorAll('.retModes, #retModesIa').forEach(btn => {
        btn.addEventListener('click', () => {
            sousMenuIa.style.display = 'none';
            sousMenuP2p.style.display = 'none';
            champs.style.display = 'none';
            zoneId.style.display = 'none';
            zoneRejoindre.style.display = 'none';
            modesPrinci.style.display = 'flex';
        });
    });

    if (btnCfgIa) {
        btnCfgIa.addEventListener('click', () => {
            sousMenuIa.style.display = 'none';
            champs.style.display = 'block';
            grpJ2.style.display = 'none';
            monRole = 1;
            modeActuel = "IA";
            if (roleAffiche) roleAffiche.innerText = "1 (Local VS IA)";
        });
    }

    // Gestion du PeerJS (P2P)
    if (btnCreer) {
        btnCreer.addEventListener('click', () => {
            sousMenuP2p.style.display = 'none';
            zoneId.style.display = 'block';
            monRole = 1;
            modeActuel = "P2P";
            if (roleAffiche) roleAffiche.innerText = "1 (Hôte)";

            monPeer = new Peer();
            monPeer.on('open', (id) => {
                if (partageId) partageId.innerText = id;
            });

            monPeer.on('connection', (conn) => {
                connexionP2P = conn;
                ecouterDonneesP2P();
                zoneId.style.display = 'none';
                champs.style.display = 'block';
                grpJ2.style.display = 'block';
            });
        });
    }

    if (btnRejoindre) {
        btnRejoindre.addEventListener('click', () => {
            sousMenuP2p.style.display = 'none';
            zoneRejoindre.style.display = 'block';
            monRole = 2;
            modeActuel = "P2P";
            if (roleAffiche) roleAffiche.innerText = "2 (Invité)";
        });
    }

    if (btnValiderConnexion) {
        btnValiderConnexion.addEventListener('click', () => {
            const targetId = codeHote.value.trim();
            if (!targetId) return;

            monPeer = new Peer();
            monPeer.on('open', () => {
                connexionP2P = monPeer.connect(targetId);
                ecouterDonneesP2P();
                zoneRejoindre.style.display = 'none';
                champs.style.display = 'block';
                grpJ2.style.display = 'block';
            });
        });
    }

    const ecouterDonneesP2P = () => {
        connexionP2P.on('data', (data) => {
            if (data.type === 'SYNC') {
                const etatSimule = {
                    scoreJ1: data.game.pointJoueur1,
                    scoreJ2: data.game.pointJoueur2,
                    tableJ1: data.game.coteJoueur1,
                    tableJ2: data.game.coteJoueur2,
                    statutJeu: data.game.statutJeu,
                    tour: data.game.tour
                };
                document.getElementById('pseudoAffiche').innerText = data.game.pseudoJ1;
                document.getElementById('pseudoAffiche2').innerText = data.game.pseudoJ2;
                document.getElementById('statutLat').style.display = "flex";
                document.getElementById('jeuCont').style.display = "flex";
                majInterface(etatSimule);
            }
        });
    };

    const synchroniserVersP2P = (etatBackend) => {
        if (modeActuel === "P2P" && connexionP2P) {
            connexionP2P.send({
                type: 'SYNC',
                game: {
                    coteJoueur1: etatBackend.tableJ1,
                    coteJoueur2: etatBackend.tableJ2,
                    pointJoueur1: etatBackend.scoreJ1,
                    pointJoueur2: etatBackend.scoreJ2,
                    tour: etatBackend.tour,
                    statutJeu: etatBackend.statutJeu,
                    pseudoJ1: document.getElementById('pseudoAffiche').innerText,
                    pseudoJ2: document.getElementById('pseudoAffiche2').innerText
                }
            });
        }
    };

    valider.addEventListener('click', () => {
        let p1 = "Joueur 1";
        let p2 = "Ordinateur";

        if (modeActuel === "IA") {
            p1 = nomInput.value.trim() !== "" ? nomInput.value : "Joueur 1";
        } else {
            p1 = nomInput.value.trim() !== "" ? nomInput.value : "ARCHICAD1";
            p2 = nomInput2.value.trim() !== "" ? nomInput2.value : "ARCHICAD2";
        }

        document.getElementById('pseudoAffiche').innerText = p1;
        document.getElementById('pseudoAffiche2').innerText = p2;

        champs.style.display = "none";
        document.getElementById('statutLat').style.display = "flex";
        document.getElementById('jeuCont').style.display = "flex";

        chargerDonnees();
    });

    // Requêtes API et gameplay
    const chargerDonnees = async() => {
        try {
            const rep = await fetch('/api/songo');
            const datas = await rep.json();
            majInterface(datas);
        } catch (err) {
            console.error(err);
        }
    };

    cases1.forEach((e, i) => {
        e.addEventListener('click', async() => {
            if (monRole !== 1) return;

            try {
                const reponse = await fetch('/api/songo/jouer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idJoueur: 1, caseChoisie: i })
                });

                if (!reponse.ok) {
                    const err = await reponse.json();
                    infos.innerHTML = `❌ ${err.erreur}`;
                    return;
                }

                const etatJeuFutur = await reponse.json();
                infos.innerText = "Distribution en cours...";

                distribuerAuRalenti(1, i, () => {
                    majInterface(etatJeuFutur);
                    synchroniserVersP2P(etatJeuFutur);

                    if (etatJeuFutur.statutJeu === 0 && modeActuel === "IA" && etatJeuFutur.tour === 2) {
                        infos.innerText = "L'IA réfléchit...";
                        setTimeout(tourIA, 1000);
                    }
                });
            } catch (err) {
                console.error(err);
            }
        });
    });

    cases2.forEach((e, i) => {
        e.addEventListener('click', async() => {
            if (modeActuel === "IA" || monRole !== 2) return;

            try {
                const reponse = await fetch('/api/songo/jouer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idJoueur: 2, caseChoisie: i })
                });

                if (!reponse.ok) {
                    const err = await reponse.json();
                    infos.innerHTML = `❌ ${err.erreur}`;
                    return;
                }

                const etatJeuFutur = await reponse.json();
                infos.innerText = "Distribution en cours...";

                distribuerAuRalenti(2, i, () => {
                    majInterface(etatJeuFutur);
                    synchroniserVersP2P(etatJeuFutur);
                });
            } catch (err) {
                console.error(err);
            }
        });
    });

    async function tourIA() {
        try {
            const rep = await fetch('/api/songo/jouer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idJoueur: 2 })
            });
            const data = await rep.json();

            let caseChoisieIa = 0;
            for (let idx = 0; idx < tableVirtuelleJ2.length; idx++) {
                if (tableVirtuelleJ2[idx] > 0) {
                    caseChoisieIa = idx;
                    break;
                }
            }

            distribuerAuRalenti(2, caseChoisieIa, () => {
                majInterface(data);
            });
        } catch (err) {
            console.error(err);
        }
    }

    // Boucle d'animation et de son
    function distribuerAuRalenti(idJ, indexChoisi, callbackFin) {
        let casesGraphiques = idJ === 1 ? cases1 : cases2;
        let graines = parseInt(casesGraphiques[indexChoisi].innerText) || 0;
        if (graines === 0) {
            if (callbackFin) callbackFin();
            return;
        }

        casesGraphiques[indexChoisi].innerText = "0";
        if (idJ === 1) tableVirtuelleJ1[indexChoisi] = 0;
        else tableVirtuelleJ2[indexChoisi] = 0;

        let indiceActuel = indexChoisi;
        let campActuel = idJ;
        const indexOrigine = indexChoisi;
        const campOrigine = idJ;

        function deposerPion() {
            if (graines === 0) {
                document.querySelectorAll('.caseJ1, .caseJ2').forEach(c => c.classList.remove('case-active'));
                if (callbackFin) callbackFin();
                return;
            }

            if (campActuel === 1) {
                indiceActuel++;
                if (indiceActuel > 6) {
                    indiceActuel = 6;
                    campActuel = 2;
                }
            } else {
                indiceActuel--;
                if (indiceActuel < 0) {
                    indiceActuel = 0;
                    campActuel = 1;
                }
            }

            if (campActuel === campOrigine && indiceActuel === indexOrigine) {
                deposerPion();
                return;
            }

            if (campActuel === 1) tableVirtuelleJ1[indiceActuel]++;
            else tableVirtuelleJ2[indiceActuel]++;

            let caseCible = campActuel === 1 ? cases1[indiceActuel] : cases2[indiceActuel];
            caseCible.innerText = campActuel === 1 ? tableVirtuelleJ1[indiceActuel] : tableVirtuelleJ2[indiceActuel];

            document.querySelectorAll('.caseJ1, .caseJ2').forEach(c => c.classList.remove('case-active'));
            caseCible.classList.add('case-active');

            sonClic.currentTime = 0;
            sonClic.play().catch(() => {});

            graines--;
            setTimeout(deposerPion, 400);
        }

        deposerPion();
    }

    // Affichage des résultats
    function majInterface(etat) {
        if (etat.scoreJ1 > ancienScoreJ1 || etat.scoreJ2 > ancienScoreJ2) {
            sonScore.play().catch(() => {});
        }

        scoreJ1.innerText = etat.scoreJ1;
        scoreJ2.innerText = etat.scoreJ2;

        ancienScoreJ1 = etat.scoreJ1;
        ancienScoreJ2 = etat.scoreJ2;

        tableVirtuelleJ1 = [...etat.tableJ1];
        tableVirtuelleJ2 = [...etat.tableJ2];

        etat.tableJ1.forEach((p, i) => { if (cases1[i]) cases1[i].innerText = p; });
        etat.tableJ2.forEach((p, i) => { if (cases2[i]) cases2[i].innerText = p; });

        if (etat.statutJeu !== 0) {
            res.style.display = "block";
            sonVictoire.play().catch(() => {});
            const pseudoVainqueur = etat.statutJeu === 1 ? document.getElementById('pseudoAffiche').innerText : document.getElementById('pseudoAffiche2').innerText;
            res.innerHTML = `🏆 ${pseudoVainqueur} Gagne!`;
            infos.innerText = "Partie terminée !";
        } else {
            res.style.display = "none";
            const actuelPseudo = etat.tour === 1 ? document.getElementById('pseudoAffiche').innerText : document.getElementById('pseudoAffiche2').innerText;
            if (etat.tour === monRole) {
                infos.innerText = `🟢 C'est votre tour de jouer (${actuelPseudo})`;
            } else {
                infos.innerText = `🔴 Attente du coup (${actuelPseudo})`;
            }
        }
    }

    // Recommencer la partie actuelle
    restart.addEventListener('click', async() => {
        if (confirm('Recommencer la partie?')) {
            try {
                const reponse = await fetch('/api/songo/delete', { method: 'POST' });
                if (reponse.ok) {
                    const donnees = await reponse.json();
                    ancienScoreJ1 = 0;
                    ancienScoreJ2 = 0;
                    majInterface(donnees);
                    synchroniserVersP2P(donnees);
                }
            } catch (err) {
                console.error(err);
            }
        }
    });

    // Quitter la partie et nettoyer l'écran pour revenir à l'accueil
    const btnQuitter = document.getElementById('quitterJeu');
    if (btnQuitter) {
        btnQuitter.addEventListener('click', async() => {
            if (confirm('Quitter la partie et revenir au menu principal ?')) {
                try {
                    await fetch('/api/songo/delete', { method: 'POST' });

                    // On remet les compteurs locaux à zéro
                    ancienScoreJ1 = 0;
                    ancienScoreJ2 = 0;

                    // On coupe la connexion P2P 
                    if (monPeer) {
                        monPeer.destroy();
                        monPeer = null;
                        connexionP2P = null;
                    }

                    // On masque les interfaces du jeu actif
                    document.getElementById('statutLat').style.display = "none";
                    document.getElementById('jeuCont').style.display = "none";
                    if (res) res.style.display = "none";

                    // On réaffiche le menu principal 
                    modesPrinci.style.display = 'flex';

                } catch (err) {
                    console.error(err);
                }
            }
        });
    }

    const btnRegles = document.getElementById('regles');
    if (btnRegles) {
        btnRegles.addEventListener('click', (evenement) => {
            evenement.preventDefault();
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    alert(`${this.responseText}`);
                }
            };
            xhttp.open("GET", "regles.txt", true);
            xhttp.send();
        });
    }
});