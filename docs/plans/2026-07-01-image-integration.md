# Image Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Centraliser les images du site vitrine et de l'admin dans un registre unique, puis reconnecter les sections existantes a ces references.

**Architecture:** Ajouter un registre d'images dans `frontend/src/app/client-data/site-images.ts`, faire consommer ce registre par `site-content.ts`, puis exposer la photo admin via le composant TypeScript plutot que via un chemin inline. Les composants existants continuent a recevoir des URLs simples, ce qui limite les changements de structure.

**Tech Stack:** Angular 20, TypeScript, templates Angular standalone

---

### Task 1: Create central image registry

**Files:**
- Create: `frontend/src/app/client-data/site-images.ts`

**Step 1: Create the registry file**

Ajouter un objet exporte avec cette structure:

```ts
export const siteImages = {
  hero: 'assets/images/hero-img.jpeg',
  services: 'assets/images/services_img.jpeg',
  adminProfile: 'assets/images/admin_profile.jpeg',
  gallery: {
    lashLiftBlueEyes: 'assets/images/gallery_1.jpeg',
    volumeRusseBrownEyes: 'assets/images/gallery_2.jpeg',
    sideProfileExtensions: 'assets/images/gallery_3.jpeg',
    naturalLashSet: 'assets/images/gallery_4.jpeg',
    tintAndLift: 'assets/images/gallery_5.jpeg',
    applicationProcess: 'assets/images/gallery_6.jpeg',
    fullSizeRender: 'assets/images/FullSizeRender.jpeg',
    fullSizeRender2: 'assets/images/FullSizeRender_2.jpeg',
    fullSizeRender5: 'assets/images/FullSizeRender_5.jpeg',
    fullSizeRender10: 'assets/images/FullSizeRender10.jpeg',
  },
} as const;
```

**Step 2: Check naming consistency**

Verifier que tous les noms sont explicites, en ASCII, et couvrent les 13 images presentes dans `assets/images`.

### Task 2: Reconnect site content to registry

**Files:**
- Modify: `frontend/src/app/client-data/site-content.ts`

**Step 1: Import the image registry**

Ajouter:

```ts
import { siteImages } from './site-images';
```

**Step 2: Replace hero image path**

Remplacer la valeur actuelle de `heroContent.imageUrl` par:

```ts
imageUrl: siteImages.hero,
```

**Step 3: Replace services visual image**

Remplacer l'URL externe de `servicesVisual.imageUrl` par:

```ts
imageUrl: siteImages.services,
```

**Step 4: Expand gallery items**

Conserver les 6 items existants, puis ajouter 4 items supplementaires branches sur:

```ts
siteImages.gallery.fullSizeRender
siteImages.gallery.fullSizeRender2
siteImages.gallery.fullSizeRender5
siteImages.gallery.fullSizeRender10
```

**Step 5: Keep public component contracts stable**

Ne pas modifier les interfaces `HeroContent`, `GalleryItem` ou le template des composants tant que `imageUrl` reste une string.

### Task 3: Reconnect admin sidebar image

**Files:**
- Modify: `frontend/src/app/admin/components/admin-sidebar/admin-sidebar.component.ts`
- Modify: `frontend/src/app/admin/components/admin-sidebar/admin-sidebar.component.html`

**Step 1: Import image registry in the component**

Ajouter dans `admin-sidebar.component.ts`:

```ts
import { siteImages } from '../../../client-data/site-images';
```

**Step 2: Expose image constant to template**

Ajouter dans la classe:

```ts
protected readonly adminProfileImage = siteImages.adminProfile;
```

**Step 3: Replace inline src in HTML**

Remplacer:

```html
src="../../../../../../assets/images/admin_profile.jpeg"
```

par:

```html
[src]="adminProfileImage"
```

### Task 4: Verify image usage and app integrity

**Files:**
- Verify: `frontend/src/app/client-data/site-images.ts`
- Verify: `frontend/src/app/client-data/site-content.ts`
- Verify: `frontend/src/app/admin/components/admin-sidebar/admin-sidebar.component.ts`
- Verify: `frontend/src/app/admin/components/admin-sidebar/admin-sidebar.component.html`

**Step 1: Search for old fragile image paths**

Run: `rg "\.\./\.\./\.\./\.\./assets/images|\.\./\.\./\.\./\.\./\.\./\.\./assets/images" frontend/src/app`

Expected: no remaining matches in the updated files.

**Step 2: Run frontend build**

Run: `npm run build`

Workdir: `frontend`

Expected: Angular build succeeds without template or import errors.

**Step 3: Manually verify image coverage**

Comparer le contenu de `assets/images` avec les references du registre pour confirmer que toutes les images sont referencees.

### Task 5: Prepare commit when requested

**Files:**
- Stage: `frontend/src/app/client-data/site-images.ts`
- Stage: `frontend/src/app/client-data/site-content.ts`
- Stage: `frontend/src/app/admin/components/admin-sidebar/admin-sidebar.component.ts`
- Stage: `frontend/src/app/admin/components/admin-sidebar/admin-sidebar.component.html`
- Stage: `docs/plans/2026-07-01-image-integration-design.md`
- Stage: `docs/plans/2026-07-01-image-integration.md`

**Step 1: Stage only relevant files**

```bash
git add frontend/src/app/client-data/site-images.ts frontend/src/app/client-data/site-content.ts frontend/src/app/admin/components/admin-sidebar/admin-sidebar.component.ts frontend/src/app/admin/components/admin-sidebar/admin-sidebar.component.html docs/plans/2026-07-01-image-integration-design.md docs/plans/2026-07-01-image-integration.md
```

**Step 2: Create commit if requested**

```bash
git commit -m "feat: centralize site image references"
```
