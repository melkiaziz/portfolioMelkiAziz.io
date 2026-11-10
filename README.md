# Portfolio de Melki Mohamed Aziz

Portfolio statique responsive présentant le parcours, les projets, les compétences, les certifications et les coordonnées de Melki Mohamed Aziz. Le site conserve les liens de projets, les documents et le formulaire Formspree existants.

## Structure
- `index.html` : contenu, navigation, import map et module d'amorçage
- `styles.css` et `css/` : styles de base, expérience, scroll, compétences, projets, curseur, contact et palette secrète
- `js/` : bootstrap, scène Three.js procédurale et interactions par fonctionnalité
- `images/optimized/` : aperçus WebP; les fichiers d'origine restent dans `images/`

## Poids mesuré
Sur le chargement initial local mesuré (cache navigateur froid), les ressources locales pèsent environ 157 Ko, les modules JavaScript servis en Brotli environ 388 Ko, et les polices/feuilles Google Fonts environ 68 Ko. Total initial : environ 613 Ko (545 Ko hors polices). Les sept aperçus WebP pèsent ensemble environ 330 Ko et sont chargés en différé; la visite complète reste autour de 943 Ko avec les polices. Les PDF et images sources restent disponibles, mais ne sont pas chargés par les aperçus.

## Lancement local
Depuis la racine du dépôt :

```powershell
python -m http.server 8000
```

Ouvrir ensuite `http://localhost:8000`. Le script de modules contourne la déclaration MIME `.js` de certaines installations Python Windows. GitHub Pages sert les modules et images avec leurs types standards.

## Tests visuels
- Redimensionner la fenêtre pour vérifier navigation et scène mobile.
- Activer « Réduire les animations » dans les préférences système pour contrôler la version statique.
- Essayer les filtres projets, les onglets de compétences et les panneaux de détails au clavier.
- Saisir le code Konami pour basculer la palette.
- Envoyer le formulaire uniquement depuis un environnement de test Formspree.

## Publication
Les fonctionnalités sont committées sur `design-3d`. Après revue, fusionner cette branche dans `main`, puis pousser `main` :

```bash
git switch main
git merge design-3d
git push origin main
```
