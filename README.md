# ER Digital

Site vitrine du studio **ER Digital** — fondé en 2026 par Emmanuel Roland Pregnon à Yamoussoukro (Côte d'Ivoire).

Sites francs pour indépendants, artisans et entreprises. Design brut, bilingue FR/EN, thème clair/sombre.

**Live :** [https://emmanuelrolandpregnon-design.github.io/er-digital-/](https://emmanuelrolandpregnon-design.github.io/er-digital-/)

## Stack

- HTML / CSS / JavaScript vanilla (fichier unique par page)
- Aucune dépendance npm, aucun bundler
- Polices : Archivo Black, Space Grotesk, Space Mono (Google Fonts)
- Hébergement : GitHub Pages

## Structure

```
index.html              Page d'accueil
cgu.html                Conditions générales d'utilisation
confidentialite.html    Politique de confidentialité
404.html                Page d'erreur
favicon.svg             Favicon
og-image.png / .svg     Image de partage social
apple-touch-icon.png    Icône iOS
robots.txt              Robots
sitemap.xml             Plan du site
outils/                 Outils annexes (ex. raccourcisseur dédié)
README.md               Ce fichier
```

## Lancer en local

```bash
# Depuis la racine du dépôt
python3 -m http.server 8080
# puis ouvrir http://127.0.0.1:8080/
```

Ou simplement ouvrir `index.html` dans un navigateur (le raccourcisseur nécessite HTTP pour le `fetch`).

## Déploiement (GitHub Pages)

1. Pousser sur la branche `main` du dépôt `emmanuelrolandpregnon-design/er-digital-`.
2. Dans **Settings → Pages**, source = branche `main` / dossier `/ (root)`.
3. Le site est servi sur `https://emmanuelrolandpregnon-design.github.io/er-digital-/`.

## Modifier les traductions

Dans `index.html` (et les pages légales), l'objet JavaScript `translations` contient les blocs `fr` et `en`.  
Les éléments HTML portent des attributs `data-i18n`, `data-i18n-html`, `data-i18n-placeholder`, etc.  
La langue est mémorisée dans `localStorage` sous la clé `er-digital-language`.

## Modifier les témoignages

Section `#temoignages` dans `index.html`.  
Les trois cartes sont anonymes (commentaire HTML `TÉMOIGNAGES ANONYMES`). Remplacez les textes FR dans le HTML et les clés `testimonialNQuote` / `Author` / `Role` dans `translations.fr` et `translations.en`.

## Modifier les tarifs

Section `#tarifs` : cartes `.pricing-card`. Ajustez montants, listes de fonctionnalités et libellés i18n associés.

## Thème clair / sombre

- Clé `localStorage` : `er-digital-theme` (`light` ou `dark`)
- Défaut : `light`
- Bascule via le bouton ◐ dans l'en-tête
- Les correctifs de contraste mode sombre sont en fin de bloc `<style>` (`CORRECTIFS CONTRASTE MODE SOMBRE`)

## Raccourcisseur de liens

Outil gratuit dans `#raccourcisseur`.  
Tentative d'abord via l'API TinyURL ; en cas d'échec CORS ou réseau, repli automatique sur **is.gd** (`format=json`).  
Aucune clé API. L'URL courte est injectée via le DOM (pas d'`innerHTML` non fiable).  
Voir aussi la politique de confidentialité (section données collectées).

## Pages légales

- `confidentialite.html` — politique de confidentialité (loi ivoirienne n°2013-450)
- `cgu.html` — conditions générales d'utilisation  
Bilingues FR/EN, même en-tête / pied de page / thème que l'accueil.

## Licence

© 2026 ER Digital — tous droits réservés.

## Contact

- Email : emmanuelrolandpregnon@gmail.com
- WhatsApp : +225 05 75 37 09 29 — [wa.me/2250575370929](https://wa.me/2250575370929)
- LinkedIn : [emmanuel-roland-pregnon-a25211440](https://www.linkedin.com/in/emmanuel-roland-pregnon-a25211440)
- Yamoussoukro, Côte d'Ivoire
