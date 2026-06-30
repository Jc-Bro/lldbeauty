# Image Integration Design

## Goal

Centraliser toutes les images du site dans une source unique et réutiliser les visuels déjà présents dans `assets/images` au sein des sections existantes, sans modifier l'architecture visuelle globale du site.

## Current State

- `frontend/src/app/client-data/site-content.ts` contient déjà plusieurs chemins d'images en dur pour le hero et la galerie.
- `frontend/src/app/admin/components/admin-sidebar/admin-sidebar.component.html` référence directement `admin_profile.jpeg` avec un chemin relatif profond.
- `servicesVisual` utilise encore une URL externe au lieu d'un asset local.
- Plusieurs images du dossier `assets/images` ne sont pas encore valorisées sur la vitrine.

## Chosen Approach

Approche 2: reconnexion ciblee.

- Creer un fichier dedie `frontend/src/app/client-data/site-images.ts`.
- Y declarer toutes les images disponibles avec des noms explicites.
- Faire consommer ce registre par `frontend/src/app/client-data/site-content.ts`.
- Conserver les sections existantes et y affecter intelligemment les visuels deja presents.

## Image Allocation

- `hero-img.jpeg` reste l'image principale du hero.
- `services_img.jpeg` devient l'image de la section services.
- `admin_profile.jpeg` reste l'image du profil admin.
- `gallery_1.jpeg` a `gallery_6.jpeg` restent dans la galerie.
- `FullSizeRender.jpeg`, `FullSizeRender_2.jpeg`, `FullSizeRender_5.jpeg` et `FullSizeRender10.jpeg` sont ajoutes a la galerie existante pour enrichir les realisations sans creer de nouvelle section.

## Technical Design

### Image Registry

Le fichier `frontend/src/app/client-data/site-images.ts` exportera un objet structure du type:

- `hero`
- `services`
- `adminProfile`
- `gallery`

Chaque valeur contiendra un chemin d'asset stable depuis le frontend, afin d'eliminer les chemins relatifs fragiles du type `../../../../assets/...`.

### Content Layer

Le fichier `frontend/src/app/client-data/site-content.ts` restera la source de donnees metier du site:

- textes du hero,
- cartes de services,
- items de galerie,
- contenus booking/contact/footer.

Il importera simplement les references d'images depuis `site-images.ts`.

### Component Impact

- Les composants du site public ne devraient pas changer de contrat, car ils consomment deja `imageUrl` et `imageAlt`.
- `frontend/src/app/admin/components/admin-sidebar/admin-sidebar.component.ts` exposera une constante pour alimenter le template au lieu d'un `src` inline fragile.

## Success Criteria

- Plus aucun chemin relatif profond vers `assets/images` dans les donnees du front et la sidebar admin.
- Toutes les images de `assets/images` sont soit utilisees dans une section existante, soit referencees clairement dans le registre.
- La galerie affiche les visuels `FullSizeRender*` en plus des images deja presentes.
- La section services n'utilise plus d'URL externe.
