# Q-LEAP, proposition de refonte du site

Aperçu en ligne (noindex, robots.txt Disallow) : https://komorebideuxiemedunom.github.io/qleap-preview/ (V1) et https://komorebideuxiemedunom.github.io/qleap-preview/v2/ (V2). Dépôt public : https://github.com/Komorebideuxiemedunom/qleap-preview (pages servies depuis docs/).

Proposition complète de refonte de q-leap.eu, réalisée le 20/11/2026 par Claude et Codex en binôme, validée par le conseil des 5 (contradicteur, premiers principes, expansionniste, outsider, exécutant) à chaque passage : préprod, Gate 1 (fin de prod), Gate 2 (postprod).
Aucun dépôt ni site en ligne Q-Leap n'a été modifié. Pas de git ici.

## Ouvrir
Double-clic sur **Ouvrir le site.command** (serveur local http://localhost:8765). Les chemins sont absolus (/assets/...), donc ouvrir index.html directement dans le navigateur ne suffit pas.

## Concept : le trait de correction
La queue bleue du Q (#0065DD, 45°) est le geste du testeur. C'est le seul ornement du site, et il n'apparaît que quand quelque chose passe de faux à vrai : défaut corrigé dans la séquence, ligne validée au survol ou au focus, champ rempli dans le formulaire.
Accueil : une release suivie en 4 étapes réelles du métier (analyse, planification, exécution, rapport), 3 défauts trouvés (accessibilité, performance, fonctionnel), corrigés et re-testés, sur une app fictive annoncée comme telle.

## Structure
- pages/*.html : contenu de chaque page (métadonnées en tête). partials/ : header, footer, gabarit.
- `python3 build.py` génère docs/ (une page HTML par sujet).
- docs/assets/data/*.json : sessions, cours, quiz, événements. Les dates passées disparaissent seules.
- docs/assets/css : site.css (système), home.css (accueil), pages.css (pages intérieures).
- Vanilla HTML/CSS/JS, aucune dépendance externe, Roboto auto-hébergée (pas de Google Fonts : RGPD).
- Le vrai modèle 3D Q-Bot (model-viewer) se charge seulement au clic sur /products/.

## Pages
Accueil, Testing, Accessibility, Training (+ quiz ISTQB), Products (Q-Bot, Q-Guard), References, Events, About, Careers, Contact, 404.

## À valider par Q-Leap avant toute publication
- Corrigé du quiz ISTQB (15 questions traduites, réponses à faire relire par un formateur : `reviewed: false` dans quiz.json).
- Chiffre « 25+ testeurs » (le site actuel dit aussi « plus de 20 »).
- Secteur des références POST et ALAC (le site actuel se contredit).
- Autorisation de nommer les clients cités (aucun logo client affiché).
- Politique de confidentialité, fiches formation détaillées et fiches de poste : liens vers le site actuel, pages à créer ou à migrer.
- Version FR : à produire (le site est en anglais, comme /en/).
- `meta robots noindex` est posé partout tant que c'est une proposition.

## Validation (20/11/2026)
| Passage | Contradicteur | Premiers principes | Expansionniste | Outsider | Exécutant | Codex |
|---|---|---|---|---|---|---|
| Préprod (concept, arbo, stack) | réserves levées | concept A retenu | idées reprises | aiguillage par profil | feu vert | « Follow the exception », fusionné |
| Gate 1 (fin de prod) | refusé | non | conversion faible | validé avec corrections | pas fini | à reprendre |
| Gate 2 (postprod) | validé avec réserves | validé avec réserves | validé avec réserves | validé avec réserves | fini (proposition locale) | validé avec réserves |

Mesures postprod : axe-core WCAG 2.2 AA + best practices = 0 violation (12 pages, desktop 1440 et mobile 390), 0 erreur console, 0 débordement horizontal, 0 lien interne cassé, 0 cadratin, aucune ressource tierce, pages de 12 à 60 Ko hors médias. Tests : quiz complet, formulaire de contact (nom, société, message dans l'e-mail), menu mobile au clavier, vidéo en mouvement réduit, péremption simulée au 27/11/2026, 11/12/2026 et 01/06/2027.

Décisions tranchées contre un avis : Q-Guard reste violet (#4A3BEB est dans la charte et sur q-guard.app) ; le titre « We find the defect before your users do » est conservé ; la séquence n'est pas le hero (l'offre doit se lire d'abord).

## Pistes V2 (à proposer)
1. Cas clients détaillés (problème, intervention, résultat) après accord écrit de 2 clients.
2. Ressources ISTQB : quiz Advanced, glossaire FR/EN.
3. Offre « European Accessibility Act » : auto-diagnostic + audit à prix fixe, pages FR et DE.
4. Version FR complète, fiches formation et offres d'emploi migrées, politique de confidentialité.

## V2 « Test run » (/v2/)
Itération qui change tout en gardant les demandes de base. La visite est un test : un panneau bleu fixe (barre basse sur mobile) écrit les parties du site lues comme un scénario Given/When/Then, gardé dans l'onglet (sessionStorage), rien n'est envoyé, boutons Clear et Stop logging. Aucune donnée d'aide technique (clavier, mouvement réduit) n'est notée. Les étapes à venir sont affichées « en attente » ; l'étape finale ne passe qu'après une action réelle (préparer le mail, copie réussie).
Accueil : portes par profil en panneau des départs (lettres défilantes), matrice de couverture services × étapes qui se remplit, accessibilité (EAA), vidéo démo Q-Bot réelle (MyGuichet.lu + LuxTrust Mobile) pilotée par le scroll, Q-Guard, sessions de formation en tableau des départs avec « Book a seat », scénario final envoyable à Q-Leap (mailto, porte choisie dans l'objet) ou copiable.
Sources : pages-v2/, partials-v2/, docs/v2/assets/. `python3 build.py` génère V1 puis V2.
Validation V2 : préprod (5 conseillers + Codex : concept fusionné de premiers principes « votre parcours est le test », outsider « signalétique d'aéroport », expansionniste « diagnostic », Codex « matrice de couverture ») ; gate : 5 validés avec réserves, Codex refusé puis validé avec réserves après corrections. axe-core 0 violation (12 pages × 2 tailles, V1 et V2), 0 débordement, tests fonctionnels OK, scrub vidéo vérifié en ligne.
