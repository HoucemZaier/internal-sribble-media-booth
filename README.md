# internal-sribble-media-booth-2026

Plateforme web interactive de capture, traitement et diffusion de vidéos personnalisées, pensée pour des expériences type photobooth / media booth. Le projet combine un frontend React moderne, un backend Express, une chaîne de traitement vidéo automatisée et des services de stockage et de distribution comme Cloudinary et MinIO.

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Aperçu du projet](#2-aperçu-du-projet)
3. [Architecture globale](#3-architecture-globale)
4. [Technologies utilisées](#4-technologies-utilisées)
5. [Architecture du projet](#5-architecture-du-projet)
6. [Installation](#6-installation)
7. [Variables d'environnement](#7-variables-denvironnement)
8. [Fonctionnement détaillé](#8-fonctionnement-détaillé)
9. [API REST](#9-api-rest)
10. [Traitement vidéo](#10-traitement-vidéo)
11. [Sécurité](#11-sécurité)
12. [Fonctionnalités](#12-fonctionnalités)
13. [Améliorations futures](#13-améliorations-futures)
14. [Licence](#15-licence)

## 1. Présentation du projet

### Contexte

Scribble Booth répond au besoin de créer une expérience vidéo simple, rapide et immersive pour un visiteur sur un kiosque, un événement ou une borne interactive. L’utilisateur renseigne ses informations, enregistre une vidéo, puis récupère une version traitée et brandée de son contenu.

### Problème

Dans ce type d’expérience, il faut orchestrer plusieurs briques techniques sans complexifier l’usage final :

- création d’une session visiteur
- capture vidéo côté navigateur
- traitement automatisé en arrière-plan
- stockage sécurisé et distribution du rendu final
- génération d’un QR Code pour simplifier le téléchargement

### Solution proposée

Le projet centralise tout le workflow dans une application full stack :

- le frontend React collecte les données et pilote la caméra
- le backend Express gère la session, l’upload et l’orchestration du traitement
- FFmpeg prépare la vidéo
- un script Python ajoute la couche de personnalisation visuelle
- Cloudinary fournit une URL publique de diffusion
- MinIO stocke la vidéo finale et permet un téléchargement sécurisé
- un QR Code simplifie l’accès au contenu final

### Objectifs

- offrir une expérience visiteur fluide et rapide
- automatiser le traitement vidéo de bout en bout
- séparer clairement les responsabilités frontend / backend / traitement
- rendre le projet lisible pour un recruteur ou un développeur
- proposer une base extensible pour un futur produit événementiel ou kiosk

### Fonctionnalités principales

- création de session visiteur avec JWT
- capture vidéo directement dans le navigateur
- upload multipart vers le backend
- traitement vidéo automatisé
- génération de rendu final brandé
- stockage dans Cloudinary et MinIO
- génération d’un QR Code de téléchargement
- téléchargement sécurisé de la vidéo finale

## 2. Aperçu du projet

### Fonctionnement général

Le visiteur ouvre l’application, saisit ses informations, démarre la caméra, enregistre une vidéo, puis le backend traite automatiquement le fichier avant de renvoyer un lien de téléchargement et un QR Code.

### Parcours utilisateur

```text
Visiteur
  |
  v
Création de session
  |
  v
Caméra
  |
  v
Capture vidéo
  |
  v
Traitement
  |
  v
Cloudinary
  |
  v
MinIO
  |
  v
QR Code
  |
  v
Téléchargement
```

## 3. Architecture globale

### Vue d’ensemble

```text
Frontend (React)
  |
  v
Axios
  |
  v
Backend Express
  |
  v
MongoDB
  |
  v
Traitement vidéo
  |
  v
Cloudinary
  |
  v
MinIO
  |
  v
Frontend
```

### Rôle des couches

| Couche | Rôle |
|---|---|
| Frontend React | Interface utilisateur, saisie des données, caméra, navigation |
| Axios | Communication HTTP entre frontend et backend |
| Backend Express | API REST, upload, orchestration du traitement |
| MongoDB | Persistance des sessions visiteurs |
| Traitement vidéo | Conversion, composition et branding du rendu |
| Cloudinary | Hébergement de la vidéo publique |
| MinIO | Stockage objet et téléchargement sécurisé |
| Frontend | Affichage du résultat et récupération du lien final |

## 4. Technologies utilisées

| Technologie | Rôle |
|---|---|
| React | Construction de l’interface utilisateur |
| Vite | Outil de build et serveur de développement frontend |
| CSS | Mise en forme de l’interface |
| Axios | Appels HTTP vers le backend |
| Node.js | Runtime JavaScript côté serveur |
| Express.js | Framework API backend |
| MongoDB | Base de données des sessions visiteurs |
| Mongoose | Modélisation et accès aux données MongoDB |
| JWT | Authentification et session de visiteur |
| FFmpeg | Traitement et conversion vidéo |
| Python | Script de personnalisation vidéo |
| Child Process | Exécution du script Python depuis Node.js |
| Cloudinary | Stockage et diffusion de la vidéo publique |
| MinIO | Stockage objet et lien de téléchargement temporaire |
| QRCode | Génération du QR Code de téléchargement |
| Multer | Réception des fichiers vidéo envoyés par le frontend |
| dotenv | Chargement des variables d’environnement |
| Git | Versionnement du code |
| GitHub | Hébergement et collaboration sur le dépôt |

## 5. Architecture du projet

```text
scribble_booth-app/
├── app-launcher.js
├── package.json
├── README.md
├── scribble-backend/
│   ├── branding/
│   │   └── logo.png
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   ├── models/
│   │   └── User.js
│   ├── outputs/
│   ├── routes/
│   │   └── auth.js
│   ├── services/
│   │   ├── cloudinary.js
│   │   ├── generateDownloadUrl.js
│   │   ├── minio.js
│   │   ├── minioUpload.js
│   │   ├── processing.js
│   │   ├── pythonRunner.js
│   │   ├── QrCode.js
│   │   └── uploadCloudinary.js
│   ├── uploads/
│   ├── main.py
│   ├── package.json
│   └── server.js
└── scribble-frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   └── Camera.jsx
    │   ├── hooks/
    │   ├── pages/
    │   │   ├── login.css
    │   │   └── login.jsx
    │   ├── utils/
    │   ├── App.css
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    └── README.md
```

### Rôle des dossiers

| Dossier | Rôle |
|---|---|
| `scribble-backend/config` | Connexion base de données et configuration technique |
| `scribble-backend/models` | Modèles MongoDB / Mongoose |
| `scribble-backend/routes` | Routes HTTP de l’API |
| `scribble-backend/services` | Services métier et intégrations externes |
| `scribble-backend/uploads` | Fichiers vidéo reçus temporairement |
| `scribble-backend/outputs` | Vidéos générées après traitement |
| `scribble-backend/branding` | Ressources visuelles utilisées dans le rendu final |
| `scribble-frontend/src/components` | Composants réutilisables |
| `scribble-frontend/src/pages` | Pages de l’application |
| `scribble-frontend/src/hooks` | Hooks personnalisés si besoin |
| `scribble-frontend/src/utils` | Fonctions utilitaires |
| `scribble-frontend/public` | Fichiers statiques exposés par Vite |

## 6. Installation

### 1) Cloner le projet

```bash
git clone <URL_DU_DEPOT>
cd scribble_booth-app
```

### 2) Installer les dépendances Frontend

```bash
cd scribble-frontend
npm install
```

### 3) Installer les dépendances Backend

```bash
cd ..
cd scribble-backend
npm install
```

## Lancer et tester tout le projet

Après avoir cloné le dépôt, vous pouvez démarrer l’ensemble du projet avec le script d’orchestration :

```bash
node app-launcher.js
```

Ce script JavaScript est dédié à l’orchestration de tous les services/composants du projet, afin de lancer l’environnement complet en une seule commande.

### Étapes rapides

1. Cloner le projet
2. Se placer dans le dossier du projet
3. Lancer :

```bash
node app-launcher.js
```

### Remarque

Assurez-vous d’avoir **Node.js** installé avant d’exécuter la commande.

### 4) Créer le fichier `.env`

Créez le fichier `.env` dans `scribble-backend/` à partir de l’exemple fourni plus bas.

### 5) Créer le bucket MinIO

Créez un bucket nommé `scribble-videos` dans votre instance MinIO.

### 6) Configurer Cloudinary

Renseignez les identifiants Cloudinary dans le fichier `.env` du backend.

### 7) Lancer MongoDB

Assurez-vous que MongoDB est disponible localement ou via un service distant, puis vérifiez que l’URI est correcte dans `.env`.

### 8) Démarrer le Backend

```bash
cd scribble-backend
npm run dev
```

### 9) Démarrer le Frontend

```bash
cd scribble-frontend
npm run dev
```

### 10) Démarrer les deux applications ensemble

Depuis la racine du projet, vous pouvez aussi lancer le frontend et le backend via le lanceur :

```bash
npm run dev
```

## 7. Variables d'environnement

Exemple de fichier `.env.example` :

```env
JWT_SECRET=your_secret
MONGO_URI=mongodb://localhost:27017/scribble_booth

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_BUCKET=scribble-videos
MINIO_USE_SSL=false
```

Ne publiez jamais vos vraies valeurs dans GitHub, même dans un dépôt privé.

## 8. Fonctionnement détaillé

```text
Le visiteur ouvre l'application
  |
  v
Saisie : prénom / nom / téléphone
  |
  v
Axios
  |
  v
Express
  |
  v
Création d'une session
  |
  v
JWT
  |
  v
MongoDB
  |
  v
localStorage
  |
  v
Redirection Camera
  |
  v
Capture vidéo
  |
  v
Upload
  |
  v
FFmpeg
  |
  v
Python
  |
  v
Création Scribble
  |
  v
Cloudinary
  |
  v
MinIO
  |
  v
QR Code
  |
  v
Téléchargement
```

### Logique métier

- le frontend envoie les données du visiteur au backend
- le backend crée une session en base et génère un JWT
- le token et les données utilisateur sont stockés côté navigateur dans `localStorage`
- l’utilisateur est redirigé vers la caméra
- la vidéo capturée est envoyée au backend via `multipart/form-data`
- FFmpeg prépare la vidéo au bon format
- le script Python compose le rendu final avec branding
- la vidéo finale est envoyée vers Cloudinary et MinIO
- un QR Code est généré pour faciliter l’accès au lien
- le frontend affiche le lien de téléchargement et le QR Code

## 9. API REST

| Méthode | Route | Description |
|---|---|---|
| POST | `/auth/session` | Crée une session visiteur et retourne un JWT |
| POST | `/upload` | Reçoit la vidéo, lance le traitement et renvoie les liens |
| GET | `/test-minio` | Vérifie la connexion à MinIO et liste les buckets |

### POST `/auth/session`

**Description**

Crée une session visiteur à partir des informations saisies par l’utilisateur.

**Body**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0600000000"
}
```

**Réponse JSON**

```json
{
  "message": "Visitor session created successfully",
  "token": "<jwt_token>",
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "0600000000"
  }
}
```

**Codes HTTP**

- `201` : session créée
- `400` : champ manquant
- `500` : erreur serveur

**Exemple**

```bash
curl -X POST http://localhost:3001/auth/session \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","phone":"0600000000"}'
```

### POST `/upload`

**Description**

Reçoit une vidéo au format `multipart/form-data`, exécute le pipeline de traitement et retourne les liens finaux.

**Body**

- champ `video` : fichier vidéo

**Réponse JSON**

```json
{
  "success": true,
  "videoUrl": "<presigned_minio_url>",
  "publicVideoUrl": "<cloudinary_url>",
  "qrCode": "<data_url_qr_code>"
}
```

**Codes HTTP**

- `200` : upload et traitement réussis
- `500` : erreur durant le traitement ou l’upload

**Exemple**

```bash
curl -X POST http://localhost:3001/upload \
  -F "video=@recording.webm"
```

### GET `/test-minio`

**Description**

Permet de vérifier que le backend communique correctement avec MinIO.

**Body**

- aucun

**Réponse JSON**

```json
[
  {
    "name": "scribble-videos",
    "creationDate": "2026-07-06T10:00:00.000Z"
  }
]
```

**Codes HTTP**

- `200` : connexion MinIO valide
- `500` : erreur de connexion ou de configuration

**Exemple**

```bash
curl http://localhost:3001/test-minio
```

## 10. Traitement vidéo

### Pipeline de traitement

```text
Upload
  |
  v
FFmpeg
  |
  v
Script Python
  |
  v
Création Scribble
  |
  v
Cloudinary
  |
  v
MinIO
  |
  v
QR Code
```

### Rôle des étapes

- **Upload** : réception du fichier vidéo brut depuis le frontend
- **FFmpeg** : conversion et normalisation du flux vidéo
- **Script Python** : création du rendu final avec composition visuelle
- **Création Scribble** : export du fichier `scribble.mp4`
- **Cloudinary** : génération d’une URL publique pour consultation ou partage
- **MinIO** : stockage objet et génération d’un lien temporaire de téléchargement
- **QR Code** : accès rapide au lien final depuis un mobile

## 11. Sécurité

### JWT

Le backend génère un JWT lors de la création de session afin de matérialiser l’identité du visiteur pendant la durée de vie de l’expérience.

### `dotenv`

Les secrets techniques sont chargés via `dotenv` pour éviter de les écrire en dur dans le code source.

### Variables d’environnement

- gardez toutes les valeurs sensibles dans `.env`
- documentez uniquement des exemples dans `.env.example`
- ne placez jamais de vraies clés dans le dépôt

### Pourquoi ne jamais publier les secrets

- risque de compromission du compte Cloudinary
- risque d’accès non autorisé au bucket MinIO
- risque de fuite d’accès à la base MongoDB
- risque de signature frauduleuse de JWT

### Bonnes pratiques Git

- ajouter `.env` à `.gitignore`
- vérifier les commits avant publication

## 12. Fonctionnalités

- ✅ Création de session visiteur
- ✅ Authentification JWT
- ✅ Stockage MongoDB
- ✅ Capture vidéo
- ✅ Traitement FFmpeg
- ✅ Traitement Python
- ✅ Upload Cloudinary
- ✅ Upload MinIO
- ✅ Génération QR Code
- ✅ Téléchargement sécurisé

## 13. Améliorations futures

- [ ] Déploiement de projet 





## 14. Licence

Ce projet est distribué sous licence MIT.

```text
MIT License

Copyright (c) 2026 Houcem Zaier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
