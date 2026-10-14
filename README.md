# ER Digital

Site vitrine d’[ER Digital](https://er-digital.studio) — studio web à Yamoussoukro.

Sites vitrines et portfolios sur mesure pour professionnels.

## Déploiement

### Cloudflare Pages (recommandé)
1. Crée un dépôt GitHub et pousse ce dossier.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Sélectionne le dépôt.
4. Build settings :
   - Framework preset : **None**
   - Build command : *(vide)*
   - Build output directory : `/` (racine)
5. Deploy.

Les fichiers `_headers` et `_redirects` sont pris en charge automatiquement.

### Cloudflare Pages — Direct Upload
Glisse le contenu de ce dossier (pas le zip) dans **Upload assets**.

### GitHub Pages
- Settings → Pages → Source : **Deploy from a branch** → `main` / `/ (root)`.

## Structure

```
├── index.html
├── 404.html
├── _headers          # Cloudflare headers + CSP + cache
├── _redirects        # /index.html → /
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── css/
│   ├── fonts/
│   ├── images/
│   └── js/
└── licenses/         # OFL fonts
```

## Licence

Code et design © ER Digital.  
Polices : Archivo Black, Space Grotesk, Space Mono — SIL Open Font License (voir `licenses/`).
