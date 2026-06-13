// creation de la classe songo sur le serveur
class Songo {
    constructor() {
        this.coteJoueur1 = [5, 5, 5, 5, 5, 5, 5];
        this.coteJoueur2 = [5, 5, 5, 5, 5, 5, 5];
        this.pointJoueur1 = 0;
        this.pointJoueur2 = 0;
        this.tour = 1; // Ajout pour le suivi du tour
    }

    nbPoints(idJ) {
        return (idJ === 1) ? this.pointJoueur1 : this.pointJoueur2;
    }

    estBloque(idJ) {
        const cote = (idJ === 1) ? this.coteJoueur1 : this.coteJoueur2;
        const totalPions = cote.reduce((acc, val) => acc + val, 0);
        return totalPions === 0 ? 1 : 0;
    }

    distribution(idJ, indexChoisi) {
        let coteActuel = (idJ === 1) ? this.coteJoueur1 : this.coteJoueur2;
        // Si l'IA joue (idJ === 2), elle choisit une case au hasard contenant des pions
        let indexDepart = (indexChoisi !== undefined && indexChoisi !== null) ? indexChoisi : coteActuel.findIndex(pions => pions > 0);

        if (indexDepart === -1 || coteActuel[indexDepart] === 0) return null;

        let pionsADistribuer = coteActuel[indexDepart];
        coteActuel[indexDepart] = 0;

        let indiceActuel = indexDepart;
        let campActuel = idJ;
        let indexOrigine = indexDepart;
        let campOrigine = idJ;

        while (pionsADistribuer > 0) {
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
                continue;
            }

            if (campActuel === 1) {
                this.coteJoueur1[indiceActuel]++;
            } else {
                this.coteJoueur2[indiceActuel]++;
            }
            pionsADistribuer--;
        }

        return { campFinal: campActuel, indexFinal: indiceActuel };
    }

    prise(idJ, infoFinDistribution) {
        if (!infoFinDistribution) return 0;
        let camp = infoFinDistribution.campFinal;
        let index = infoFinDistribution.indexFinal;

        if (camp === idJ) {
            this.tour = (this.tour === 1) ? 2 : 1;
            return 0;
        }

        let pointsGagnes = 0;
        let casesACompleter = [];

        if (camp === 1 && idJ === 2) {
            while (index >= 0 && this.coteJoueur1[index] > 0 && this.coteJoueur1[index] < 4) {
                pointsGagnes += this.coteJoueur1[index];
                casesACompleter.push({ camp: 1, idx: index });
                index--;
            }
        } else if (camp === 2 && idJ === 1) {
            while (index <= 6 && this.coteJoueur2[index] > 0 && this.coteJoueur2[index] < 4) {
                pointsGagnes += this.coteJoueur2[index];
                casesACompleter.push({ camp: 2, idx: index });
                index++;
            }
        }

        if (casesACompleter.length > 0) {
            let totalAdversaire = 0;
            if (idJ === 1) {
                totalAdversaire = this.coteJoueur2.reduce((acc, val) => acc + val, 0);
            } else {
                totalAdversaire = this.coteJoueur1.reduce((acc, val) => acc + val, 0);
            }

            if (pointsGagnes < totalAdversaire) {
                casesACompleter.forEach(c => {
                    if (c.camp === 1) this.coteJoueur1[c.idx] = 0;
                    else this.coteJoueur2[c.idx] = 0;
                });
                if (idJ === 1) this.pointJoueur1 += pointsGagnes;
                else this.pointJoueur2 += pointsGagnes;
            }
        }

        this.tour = (this.tour === 1) ? 2 : 1;
        return pointsGagnes;
    }

    poursuiteJeu() {
        if (this.pointJoueur1 > 35) return 1;
        if (this.pointJoueur2 > 35) return 2;
        if (this.estBloque(1) && this.estBloque(2)) {
            return this.pointJoueur1 > this.pointJoueur2 ? 1 : 2;
        }
        return 0;
    }

    restart() {
        this.coteJoueur1 = [5, 5, 5, 5, 5, 5, 5];
        this.coteJoueur2 = [5, 5, 5, 5, 5, 5, 5];
        this.pointJoueur1 = 0;
        this.pointJoueur2 = 0;
        this.tour = 1;
        return this;
    }
}

module.exports = Songo;