# 📊 Guide Complet des Structures et Schémas - StockNex

## 📑 Table des Matières
1. [Architecture Générale du Projet](#1-architecture-générale)
2. [Structure de la Base de Données](#2-structure-de-la-base-de-données)
3. [Architecture Frontend](#3-architecture-frontend)
4. [Architecture Backend](#4-architecture-backend)
5. [Flux de Données](#5-flux-de-données)
6. [Relations entre Entités](#6-relations-entre-entités)
7. [Services et API](#7-services-et-api)

---

## 1. Architecture Générale

### Vue d'ensemble du projet

```
┌─────────────────────────────────────────────────────────────┐
│                        StockNex - Architecture               │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌─────────────┐         ┌──────────────┐
│  FRONTEND    │         │   BACKEND   │         │    ML API    │
│  (Next.js)   │◄─────►  │ (Express)   │◄─────► │  (FastAPI)   │
│  Port: 3000  │         │ Port: 4000  │         │ Port: 8000   │
└──────────────┘         └─────────────┘         └──────────────┘
      ▲                        ▲                        ▲
      │                        │                        │
      └────────────┬───────────┴────────────┬───────────┘
                   │                        │
            ┌──────▼──────────────┐  ┌──────▼──────────────┐
            │  PostgreSQL (DB)    │  │  External APIs     │
            │  Port: 5432         │  │  - Yahoo Finance   │
            │                     │  │  - Finnhub         │
            └─────────────────────┘  └────────────────────┘
```

### Technologies Principales

| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend | Next.js | 15.5.6 |
| Frontend | React | 19.x |
| Backend | Express.js | 4.x |
| Backend | TypeScript | 5.x |
| Database | PostgreSQL | 14+ |
| ORM | Prisma | Latest |
| ML/API | FastAPI | 0.10x+ |
| Cache | Redis | (optional) |
| Auth | JWT + bcrypt | - |

---

## 2. Structure de la Base de Données

### Diagramme Entité-Relation (ER)

```
┌──────────────────┐
│      USERS       │
├──────────────────┤
│ id (PK)          │◄────┐
│ email            │     │
│ username         │     │
│ password         │     │ 1:N
│ createdAt        │     │
│ lastLogin        │     │
│ loginCount       │     │
│ isAdmin          │     │
└──────────────────┘     │
                         │
          ┌──────────────┴────────────────┬─────────────────┐
          │                               │                 │
          ▼                               ▼                 ▼
┌──────────────────┐          ┌──────────────────┐  ┌──────────────────┐
│  WATCHLIST_ITEMS │          │ USER_PREDICTIONS │  │  ACTIVITY_LOGS   │
├──────────────────┤          ├──────────────────┤  ├──────────────────┤
│ id (PK)          │          │ id (PK)          │  │ id (PK)          │
│ userId (FK)      │          │ userId (FK)      │  │ userId (FK)      │
│ symbol           │          │ symbol           │  │ action           │
│ companyName      │          │ companyName      │  │ details (JSON)   │
│ addedAt          │          │ predictedPrice   │  │ timestamp        │
└──────────────────┘          │ viewedAt         │  └──────────────────┘
                              └──────────────────┘
```

### Détail des Modèles Prisma

#### 1. **Modèle USER**
```
Responsabilité : Gestion des utilisateurs et authentification

┌─ Champs de Base
│  • id: Int (Clé primaire, auto-increment)
│  • email: String (Unique)
│  • username: String
│  • password: String (Hashée avec bcrypt)
│
├─ Champs de Tracking
│  • createdAt: DateTime (Date de création)
│  • lastLogin: DateTime (Dernière connexion)
│  • loginCount: Int (Nombre de connexions)
│
├─ Champs d'Autorisation
│  • isAdmin: Boolean (Rôle administrateur)
│
└─ Relations
   • watchlistItems: WatchlistItem[] (1:N)
   • predictions: UserPrediction[] (1:N)
   • activityLogs: ActivityLog[] (1:N)
```

#### 2. **Modèle WATCHLIST_ITEM**
```
Responsabilité : Gestion des actions suivies par les utilisateurs

┌─ Champs de Base
│  • id: Int (Clé primaire)
│  • userId: Int (Clé étrangère vers User)
│  • symbol: String (Symbole boursier: AAPL, MSFT, etc.)
│  • companyName: String (Nom de l'entreprise)
│
├─ Champs de Tracking
│  • addedAt: DateTime (Quand l'action a été ajoutée)
│
├─ Contraintes d'Unicité
│  • UNIQUE(userId, symbol) → Un utilisateur ne peut ajouter une action qu'une fois
│
└─ Relations
   • user: User (N:1) - Cascade delete
```

#### 3. **Modèle USER_PREDICTION**
```
Responsabilité : Historique des prédictions consultées par les utilisateurs

┌─ Champs de Base
│  • id: Int (Clé primaire)
│  • userId: Int (Clé étrangère vers User)
│  • symbol: String (Symbole boursier)
│  • companyName: String (Nom de l'entreprise)
│  • predictedPrice: Float (Prix prédits par l'IA)
│
├─ Champs de Tracking
│  • viewedAt: DateTime (Quand la prédiction a été consultée)
│
└─ Relations
   • user: User (N:1) - Cascade delete
```

#### 4. **Modèle ACTIVITY_LOG**
```
Responsabilité : Audit et suivi des actions utilisateur

┌─ Champs de Base
│  • id: Int (Clé primaire)
│  • userId: Int (Clé étrangère vers User)
│  • action: String (Type d'action effectuée)
│  • details: String (Données JSON avec contexte)
│
├─ Types d'Actions Supportées
│  • "login" - Connexion utilisateur
│  • "view_prediction" - Consultation de prédiction
│  • "add_watchlist" - Ajout à la watchlist
│  • "remove_watchlist" - Suppression de la watchlist
│  • "search" - Recherche d'action
│
├─ Champs de Tracking
│  • timestamp: DateTime (Quand l'action s'est produite)
│
└─ Relations
   • user: User (N:1) - Cascade delete
```

### Règles de Cascade

```
Quand un User est supprimé:
├─ Toutes ses WatchlistItem sont supprimées (CASCADE)
├─ Toutes ses UserPrediction sont supprimées (CASCADE)
└─ Tous ses ActivityLog sont supprimés (CASCADE)

Avantage : Pas de données orphelines en base
```

---

## 3. Architecture Frontend

### Structure des Dossiers

```
frontend/
│
├── app/                           # App Router de Next.js 15
│   │
│   ├── (auth)/                    # Groupe de pages d'authentification
│   │   ├── sign-in/               # Page de connexion
│   │   ├── sign-up/               # Page d'inscription
│   │   └── layout.tsx             # Layout partagé auth
│   │
│   ├── (root)/                    # Groupe de pages principales
│   │   ├── page.tsx               # Dashboard principal
│   │   ├── dashboard/             # Section tableau de bord
│   │   │   └── page.tsx
│   │   ├── search/                # Recherche d'actions
│   │   │   └── page.tsx
│   │   ├── watchlist/             # Watchlist utilisateur
│   │   │   └── page.tsx
│   │   ├── prediction/            # Prédictions IA
│   │   │   └── page.tsx
│   │   ├── settings/              # Paramètres utilisateur
│   │   │   └── page.tsx
│   │   ├── admin/                 # Panneau administrateur
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   └── layout.tsx             # Layout partagé principal
│   │
│   ├── api/                       # API Routes (Next.js)
│   │   ├── auth/                  # Endpoints authentification
│   │   ├── watchlist/             # Endpoints watchlist
│   │   └── predictions/           # Endpoints prédictions
│   │
│   ├── context/                   # React Context API
│   │   └── ThemeContext.tsx       # Contexte de thème
│   │
│   ├── globals.css                # Styles globaux
│   ├── layout.tsx                 # Layout racine
│   ├── providers.tsx              # Providers globaux (Redux, Theme, etc.)
│   └── RootLayoutClient.tsx       # Client wrapper
│
├── components/                    # Composants réutilisables
│   │
│   ├── AuthGuard.tsx              # Garde pour routes protégées
│   ├── AuthModal.tsx              # Modal d'authentification
│   ├── Header.tsx                 # En-tête de l'app
│   ├── Sidebar.tsx                # Barre latérale
│   ├── AdminSidebar.tsx           # Sidebar admin
│   ├── UserDropdown.tsx           # Menu utilisateur
│   ├── Logo.tsx                   # Logo de l'app
│   ├── NavItems.tsx               # Éléments de navigation
│   │
│   ├── market/                    # Composants liés au marché
│   │   ├── StockChart.tsx         # Graphique d'action
│   │   ├── LineChart.tsx          # Graphique en ligne
│   │   ├── TradingViewWidget.tsx  # Widget TradingView
│   │   └── ...
│   │
│   ├── forms/                     # Composants de formulaire
│   │   └── ...
│   │
│   └── ui/                        # Composants UI génériques
│       ├── Button.tsx
│       ├── Dialog.tsx
│       ├── Input.tsx
│       └── ...
│
├── hooks/                         # Hooks personnalisés React
│   ├── useAdminAuth.ts            # Authentification admin
│   ├── useAdminProtection.ts      # Protection des routes admin
│   ├── useCache.ts                # Gestion du cache
│   ├── useDashboardRefresh.ts     # Refresh du dashboard
│   ├── useTradingViewWidget.tsx   # Widget TradingView
│   ├── useUserTracking.ts         # Suivi utilisateur
│   └── useWatchlistRefresh.ts     # Refresh de la watchlist
│
├── lib/                           # Utilitaires et clients API
│   ├── api.ts                     # Client API général
│   ├── prediction-api.ts          # Client API prédictions
│   ├── Constants.tsx              # Constantes de l'app
│   ├── utils.ts                   # Fonctions utilitaires
│   ├── sp500-symbols.ts           # Symboles S&P 500
│   ├── sp500-domains.ts           # Domaines S&P 500
│   └── generate_symbol_mapping.js # Générateur de mappings
│
├── styles/                        # Feuilles de styles CSS
│   ├── globals.css
│   ├── dashboard.css
│   ├── heatmap.css
│   ├── heatmap-interactive.css
│   ├── heatmap-tooltip.css
│   ├── stockheatmap.css
│   └── marketnews.css
│
├── types/                         # Définitions TypeScript
│   ├── global.d.ts                # Types globaux
│   ├── trading.ts                 # Types trading/finance
│   ├── heatmap.ts                 # Types heatmap
│   └── lucide-react.d.ts          # Types icônes
│
├── public/                        # Ressources statiques
│   ├── manifest.json              # PWA manifest
│   ├── clear-cache.html           # Utilitaire clear cache
│   └── assets/                    # Images, fonts, etc.
│
└── shared/                        # Code partagé
    ├── index.ts
    ├── data/
    └── utils/
```

### Flux de Navigation Frontend

```
┌─ Utilisateur Non Authentifié
│  └─ Accessible: (auth)/sign-in, (auth)/sign-up
│
└─ Utilisateur Authentifié
   ├─ (root)/
   │  ├─ page.tsx (Dashboard principal)
   │  ├─ dashboard/page.tsx
   │  ├─ search/page.tsx
   │  ├─ watchlist/page.tsx
   │  ├─ prediction/page.tsx
   │  └─ settings/page.tsx
   │
   └─ Admin (si isAdmin = true)
      └─ admin/page.tsx (Panneau de contrôle admin)
```

### Composants Clés

#### AuthGuard Component
```
Responsabilité: Protéger les routes et rediriger vers authentification
├─ Vérifie si l'utilisateur est authentifié
├─ Récupère le token JWT
├─ Redirige vers /sign-in si pas authentifié
└─ Affiche le contenu si authentifié
```

#### Header Component
```
Responsabilité: En-tête principal de l'application
├─ Affiche le logo
├─ Affiche la barre de recherche
├─ Affiche les notifications
└─ Affiche le menu utilisateur (UserDropdown)
```

#### Sidebar Component
```
Responsabilité: Navigation principale pour utilisateurs normaux
├─ Dashboard
├─ Recherche
├─ Watchlist
├─ Prédictions
└─ Paramètres
```

---

## 4. Architecture Backend

### Structure des Dossiers

```
backend/
│
├── src/
│   │
│   ├── index.ts                   # Point d'entrée principal
│   │                              # - Initialisation Express
│   │                              # - Configuration CORS
│   │                              # - Endpoints admin
│   │                              # - Endpoints authentification
│   │
│   ├── middlewares/               # Middleware Express
│   │   ├── auth.ts                # Authentification JWT
│   │   └── ...
│   │
│   ├── routes/                    # Routes Express
│   │   ├── users.ts               # Endpoints utilisateurs
│   │   ├── watchlist.ts           # Endpoints watchlist
│   │   ├── predictions.ts         # Endpoints prédictions
│   │   └── ...
│   │
│   └── services/                  # Logique métier
│       ├── market.service.ts      # Service marché
│       ├── cache.service.ts       # Service cache
│       ├── user.service.ts        # Service utilisateurs
│       └── ...
│
├── prisma/
│   ├── schema.prisma              # Schéma base de données
│   └── migrations/                # Historique migrations DB
│
├── package.json                   # Dépendances
├── tsconfig.json                  # Configuration TypeScript
└── backend.dockerfile             # Configuration Docker
```

### Endpoints Principaux

#### Authentification
```
POST /auth/sign-up
├─ Paramètres: { email, username, password }
├─ Validation: Email unique, mot de passe sécurisé
├─ Retour: { user, token }
└─ Statut: 201 (succès), 400 (erreur validation)

POST /auth/sign-in
├─ Paramètres: { email, password }
├─ Validation: Credentials vérifiées contre DB
├─ Retour: { user, token }
└─ Statut: 200 (succès), 401 (non autorisé)

POST /auth/verify
├─ Headers: Authorization: Bearer <token>
├─ Validation: Vérifie la validité du JWT
└─ Retour: { valid: boolean, user: User }
```

#### Watchlist
```
GET /watchlist
├─ Headers: Authorization: Bearer <token>
├─ Retour: WatchlistItem[]
└─ Filtre: Par utilisateur authentifié

POST /watchlist
├─ Headers: Authorization: Bearer <token>
├─ Paramètres: { symbol, companyName }
├─ Validation: Unicité userId+symbol
├─ Retour: WatchlistItem
└─ Statut: 201 (succès), 409 (doublon)

DELETE /watchlist/:id
├─ Headers: Authorization: Bearer <token>
├─ Validation: Vérifie que l'utilisateur possède l'item
└─ Retour: { success: true }
```

#### Prédictions
```
GET /predictions/:symbol
├─ Requête API ML pour obtenir la prédiction
├─ Enregistre dans UserPrediction
└─ Retour: { symbol, predictedPrice, confidence }

GET /predictions/history
├─ Headers: Authorization: Bearer <token>
├─ Retour: UserPrediction[] (historique utilisateur)
└─ Tri: Par date décroissante
```

#### Activités
```
GET /activity-logs
├─ Headers: Authorization: Bearer <token>
├─ Retour: ActivityLog[] (logs utilisateur)
└─ Tri: Par timestamp décroissante

POST /activity-logs
├─ Headers: Authorization: Bearer <token>
├─ Paramètres: { action, details }
├─ Actions valides: login, view_prediction, add_watchlist, remove_watchlist
└─ Retour: ActivityLog
```

### Middleware Authentification

```typescript
Responsabilité: Valider les tokens JWT et authentifier les requêtes

Processus:
1. Récupère le token du header Authorization
2. Vérifie la signature JWT avec la clé secrète
3. Extrait l'ID utilisateur du payload
4. Ajoute l'utilisateur à req.user
5. Si invalide, retourne 401 Unauthorized

Endpoints protégés: Tous ceux qui commencent par /api/protected
```

### Services Backend

#### Market Service
```
Responsabilité: Récupération de données de marché
├─ Appels à Yahoo Finance API
├─ Appels à Finnhub API
├─ Formatage des données
├─ Gestion des erreurs d'API
└─ Historique des prix
```

#### Cache Service
```
Responsabilité: Gestion du cache des données
├─ Cache Redis (optionnel)
├─ Cache en mémoire
├─ TTL (Time To Live) pour expiration
└─ Invalidation du cache
```

---

## 5. Flux de Données

### Flux d'Authentification

```
┌─────────────────────────────────────────────────────────────┐
│                  FLUX D'AUTHENTIFICATION                     │
└─────────────────────────────────────────────────────────────┘

1. Sign-Up
   ┌──────────────┐
   │   Frontend   │
   │  (Sign-Up)   │
   └──────┬───────┘
          │ POST /auth/sign-up {email, username, password}
          ▼
   ┌──────────────┐
   │   Backend    │
   │  /sign-up    │
   └──────┬───────┘
          │ 1. Valide données
          │ 2. Hash password avec bcrypt
          │ 3. Crée User en DB
          │ 4. Génère JWT token
          ▼
   ┌──────────────┐
   │  PostgreSQL  │
   │ Crée User    │
   └──────┬───────┘
          │ Retourne { user, token }
          ▼
   ┌──────────────┐
   │   Frontend   │
   │  Stocke JWT  │
   │  localStorage│
   └──────────────┘

2. Sign-In
   ┌──────────────┐
   │   Frontend   │
   │  (Sign-In)   │
   └──────┬───────┘
          │ POST /auth/sign-in {email, password}
          ▼
   ┌──────────────┐
   │   Backend    │
   │  /sign-in    │
   └──────┬───────┘
          │ 1. Trouve User par email
          │ 2. Compare password avec hash
          │ 3. Si match, génère JWT token
          │ 4. Enregistre lastLogin et loginCount
          ▼
   ┌──────────────┐
   │  PostgreSQL  │
   │ Update User  │
   │ lastLogin    │
   └──────┬───────┘
          │ Retourne { user, token }
          ▼
   ┌──────────────┐
   │   Frontend   │
   │  Stocke JWT  │
   │  Redirige    │
   └──────────────┘
```

### Flux de Watchlist

```
┌─────────────────────────────────────────────────────────────┐
│              FLUX DE GESTION DE WATCHLIST                    │
└─────────────────────────────────────────────────────────────┘

1. Ajouter à la Watchlist
   ┌──────────────┐
   │   Frontend   │
   │   Clique +   │
   │  Ajouter     │
   └──────┬───────┘
          │ POST /watchlist {symbol, companyName}
          │ Headers: Authorization: Bearer <token>
          ▼
   ┌──────────────┐
   │   Backend    │
   │  /watchlist  │
   └──────┬───────┘
          │ 1. Middleware valide JWT
          │ 2. Extrait userId
          │ 3. Vérifie unicité (userId+symbol)
          │ 4. Crée WatchlistItem
          │ 5. Enregistre ActivityLog (add_watchlist)
          ▼
   ┌──────────────┐
   │  PostgreSQL  │
   │ Insère dans  │
   │ watchlist_   │
   │ items        │
   └──────┬───────┘
          │ Retourne WatchlistItem
          ▼
   ┌──────────────┐
   │   Frontend   │
   │  Affiche     │
   │  Confirmation│
   └──────────────┘

2. Afficher la Watchlist
   ┌──────────────┐
   │   Frontend   │
   │ Page         │
   │ Watchlist    │
   └──────┬───────┘
          │ GET /watchlist
          │ Headers: Authorization: Bearer <token>
          ▼
   ┌──────────────┐
   │   Backend    │
   │  /watchlist  │
   └──────┬───────┘
          │ 1. Middleware valide JWT
          │ 2. Extrait userId
          │ 3. Requête: SELECT * FROM watchlist_items WHERE userId = ?
          ▼
   ┌──────────────┐
   │  PostgreSQL  │
   │ Retourne     │
   │ WatchlistItem│
   │ pour user    │
   └──────┬───────┘
          │ Retourne WatchlistItem[]
          ▼
   ┌──────────────┐
   │   Frontend   │
   │  Affiche la  │
   │  liste       │
   └──────────────┘

3. Supprimer de la Watchlist
   ┌──────────────┐
   │   Frontend   │
   │   Clique X   │
   │  Supprimer   │
   └──────┬───────┘
          │ DELETE /watchlist/:id
          │ Headers: Authorization: Bearer <token>
          ▼
   ┌──────────────┐
   │   Backend    │
   │  /watchlist/:id
   └──────┬───────┘
          │ 1. Middleware valide JWT
          │ 2. Vérifie que l'utilisateur possède l'item
          │ 3. Supprime WatchlistItem
          │ 4. Enregistre ActivityLog (remove_watchlist)
          ▼
   ┌──────────────┐
   │  PostgreSQL  │
   │ Supprime     │
   │ watchlist_   │
   │ items        │
   └──────┬───────┘
          │ Retourne { success: true }
          ▼
   ┌──────────────┐
   │   Frontend   │
   │  Retire item │
   │  du UI       │
   └──────────────┘
```

### Flux de Prédictions

```
┌─────────────────────────────────────────────────────────────┐
│             FLUX DE PRÉDICTIONS IA                           │
└─────────────────────────────────────────────────────────────┘

1. Demander une Prédiction
   ┌──────────────┐
   │   Frontend   │
   │ Page         │
   │ Prediction   │
   └──────┬───────┘
          │ GET /predictions/:symbol
          │ Headers: Authorization: Bearer <token>
          ▼
   ┌──────────────┐
   │   Backend    │
   │ /predictions │
   │ /:symbol     │
   └──────┬───────┘
          │ 1. Middleware valide JWT
          │ 2. Récupère données historiques du marché
          │ 3. Appelle ML API pour prédiction
          ▼
   ┌──────────────────────┐
   │   ML API (FastAPI)   │
   │   Port 8000          │
   │ Modèle IA            │
   └──────┬───────────────┘
          │ 1. Reçoit données historiques
          │ 2. Lance modèle ML (LSTM, Random Forest, etc.)
          │ 3. Retourne prédiction + confiance
          ▼
   ┌──────────────┐
   │   Backend    │
   │ Enregistre   │
   │ prédiction   │
   └──────┬───────┘
          │ 1. Crée UserPrediction en DB
          │ 2. Enregistre ActivityLog
          │ 3. Cache le résultat
          ▼
   ┌──────────────┐
   │  PostgreSQL  │
   │ Insère       │
   │ user_        │
   │ predictions  │
   └──────┬───────┘
          │ Retourne { symbol, predictedPrice, confidence, timestamp }
          ▼
   ┌──────────────┐
   │   Frontend   │
   │  Affiche     │
   │  prédiction  │
   └──────────────┘

2. Historique des Prédictions
   ┌──────────────┐
   │   Frontend   │
   │ Page History │
   └──────┬───────┘
          │ GET /predictions/history
          │ Headers: Authorization: Bearer <token>
          ▼
   ┌──────────────┐
   │   Backend    │
   │ /predictions │
   │ /history     │
   └──────┬───────┘
          │ 1. Middleware valide JWT
          │ 2. Requête: SELECT * FROM user_predictions WHERE userId = ? ORDER BY viewedAt DESC
          ▼
   ┌──────────────┐
   │  PostgreSQL  │
   │ Retourne     │
   │ Historique   │
   │ utilisateur  │
   └──────┬───────┘
          │ Retourne UserPrediction[]
          ▼
   ┌──────────────┐
   │   Frontend   │
   │  Affiche     │
   │  historique  │
   └──────────────┘
```

---

## 6. Relations Entre Entités

### Diagramme de Relations Complet

```
┌──────────────────────────────────────────────────────────────┐
│                    MODÈLE DE DONNÉES                          │
└──────────────────────────────────────────────────────────────┘

                        ┌─────────────┐
                        │    USERS    │
                        ├─────────────┤
                        │  • id (PK)  │
                        │  • email    │
                        │  • username │
                        │  • password │
                        │  • isAdmin  │
                        │  • created  │
                        └────────┬────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                │ 1:N            │ 1:N            │ 1:N
                │                │                │
      ┌─────────▼────────┐  ┌────▼──────────────┐  ┌────▼──────────┐
      │ WATCHLIST_ITEMS  │  │ USER_PREDICTIONS │  │ ACTIVITY_LOGS │
      ├──────────────────┤  ├──────────────────┤  ├───────────────┤
      │ • id (PK)        │  │ • id (PK)        │  │ • id (PK)     │
      │ • userId (FK)    │  │ • userId (FK)    │  │ • userId (FK) │
      │ • symbol         │  │ • symbol         │  │ • action      │
      │ • companyName    │  │ • companyName    │  │ • details     │
      │ • addedAt        │  │ • predictedPrice │  │ • timestamp   │
      └──────────────────┘  │ • viewedAt       │  └───────────────┘
                             └──────────────────┘

Cardinalités:
• 1 User → N WatchlistItem (Un utilisateur a plusieurs actions suivies)
• 1 User → N UserPrediction (Un utilisateur a plusieurs prédictions)
• 1 User → N ActivityLog (Un utilisateur a plusieurs logs d'activité)

Cascade Delete:
• Quand on supprime un User → Toutes ses relations sont supprimées
```

### Cas d'Utilisation - Relations en Action

#### Cas 1: Nouvel Utilisateur
```
1. User crée un compte
   ├─ Crée une ligne dans USERS
   └─ ID: 1, Email: john@example.com, isAdmin: false

2. User suit l'action AAPL
   ├─ Crée ligne dans WATCHLIST_ITEMS
   ├─ userId: 1, symbol: AAPL, companyName: Apple Inc
   └─ Crée log d'activité: action = "add_watchlist"

3. User consulte prédiction de AAPL
   ├─ Crée ligne dans USER_PREDICTIONS
   ├─ userId: 1, symbol: AAPL, predictedPrice: $185.50
   └─ Crée log d'activité: action = "view_prediction"

État DB:
┌─ USERS: 1 row (John)
├─ WATCHLIST_ITEMS: 1 row (AAPL suivie par John)
├─ USER_PREDICTIONS: 1 row (AAPL prédiction consultée)
└─ ACTIVITY_LOGS: 2 rows (add_watchlist, view_prediction)
```

#### Cas 2: Suppression d'Utilisateur
```
Avant suppression:
├─ USERS: 1 row (John)
├─ WATCHLIST_ITEMS: 3 rows (AAPL, MSFT, GOOGL suivies par John)
├─ USER_PREDICTIONS: 5 rows (prédictions John)
└─ ACTIVITY_LOGS: 10 rows (logs John)

Exécution: DELETE FROM users WHERE id = 1

Après suppression (CASCADE):
├─ USERS: 0 rows
├─ WATCHLIST_ITEMS: 0 rows (cascade delete)
├─ USER_PREDICTIONS: 0 rows (cascade delete)
└─ ACTIVITY_LOGS: 0 rows (cascade delete)

Avantage: Intégrité referentielle garantie, pas de données orphelines
```

---

## 7. Services et API

### Architecture des Services

```
┌─────────────────────────────────────────────────────────┐
│                  SERVICE LAYER                          │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│         EXTERNAL SERVICES/APIs           │
├──────────────────────────────────────────┤
│ • Yahoo Finance API                      │
│ • Finnhub API                            │
│ • ML Service (FastAPI)                   │
│ • PostgreSQL Database                    │
└────────────┬─────────────────────────────┘
             │
    ┌────────▼──────────┐
    │  Services Layer   │
    ├───────────────────┤
    │ • UserService     │
    │ • MarketService   │
    │ • CacheService    │
    │ • PredictionSvc   │
    └────────┬──────────┘
             │
    ┌────────▼──────────┐
    │   Routes Layer    │
    ├───────────────────┤
    │ • Auth Routes     │
    │ • User Routes     │
    │ • Watchlist       │
    │ • Predictions     │
    └────────┬──────────┘
             │
    ┌────────▼──────────┐
    │  Middleware       │
    ├───────────────────┤
    │ • Auth JWT        │
    │ • CORS            │
    │ • Error Handler   │
    └────────┬──────────┘
             │
    ┌────────▼──────────┐
    │  Express Server   │
    │  Port: 4000       │
    └───────────────────┘
```

### Service Market

```
Responsabilité: Récupération et gestion des données de marché

Méthodes principales:

1. getStockPrice(symbol: string)
   └─ Appelle Yahoo Finance API
   └─ Retourne: { symbol, price, change, changePercent, timestamp }

2. getStockHistory(symbol: string, range: string)
   └─ Appelle Yahoo Finance API
   └─ Paramètres range: 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y
   └─ Retourne: { dates[], prices[], volumes[] }

3. searchStock(query: string)
   └─ Appelle Yahoo Finance search API
   └─ Retourne: { symbol, name, exchange, type }[]

4. getMarketNews()
   └─ Appelle Finnhub API
   └─ Retourne: { headlines, sentiment }

Gestion d'erreurs:
├─ Retry avec backoff exponentiel
├─ Fallback sur cache si API indisponible
└─ Logging détaillé des erreurs
```

### Service Cache

```
Responsabilité: Optimisation des performances via cache

Stratégies:

1. In-Memory Cache (par défaut)
   ├─ Stockage: Map<string, CacheEntry>
   ├─ TTL: Configurable par type de données
   │  ├─ Prix: 1 minute
   │  ├─ Historique: 1 heure
   │  └─ Recherche: 24 heures
   └─ Limit: 1000 entries max

2. Redis Cache (optionnel)
   ├─ Persistence entre redémarrages
   ├─ Partage entre instances
   └─ Expiration automatique (TTL)

Méthodes:
├─ get(key: string): Promise<any>
├─ set(key: string, value: any, ttl?: number): Promise<void>
├─ invalidate(pattern: string): Promise<void>
└─ clear(): Promise<void>

Avantage:
├─ Réduit latence API externe (1 min → 1ms)
├─ Réduit charge serveurs externes
└─ Améliore UX avec réponses rapides
```

### Service Prédictions

```
Responsabilité: Orchestration des prédictions IA

Processus:

1. getUserPredictions(userId: number)
   ├─ Récupère historique utilisateur
   └─ Retourne: UserPrediction[]

2. predictStockPrice(symbol: string, userId: number)
   ├─ Récupère données historiques (via MarketService)
   ├─ Appelle ML API (FastAPI, port 8000)
   ├─ Récupère réponse: { price, confidence, timeframe }
   ├─ Enregistre en DB
   ├─ Enregistre log d'activité
   └─ Retourne: UserPrediction avec métadonnées

3. invalidatePrediction(predictionId: number)
   ├─ Marque comme obsolète
   └─ Demande nouvelle prédiction

Intégration ML API:
┌─────────────────────────────────────────┐
│        Backend Service                   │
│ (Express)                                │
└────────────┬────────────────────────────┘
             │ HTTP POST /predict
             │ Body: { symbol, historicalData }
             ▼
┌─────────────────────────────────────────┐
│        ML API                            │
│        (FastAPI, Port 8000)              │
├─────────────────────────────────────────┤
│ • Reçoit données                         │
│ • Lance modèle ML (LSTM/RF)              │
│ • Retourne prédiction + confiance        │
└────────────┬────────────────────────────┘
             │ Response: { price, confidence }
             ▼
┌─────────────────────────────────────────┐
│        Backend Service                   │
│ • Enregistre en DB                       │
│ • Cache résultat                         │
│ • Retourne à Frontend                    │
└─────────────────────────────────────────┘
```

---

## 8. Intégration Complète - Exemple Concret

### Scénario: Nouvel Utilisateur Consulte une Prédiction

```
ÉTAPE 1: INSCRIPTION
═══════════════════
Frontend ──POST /auth/sign-up──► Backend
                                 ├─ Hash password (bcrypt)
                                 ├─ Crée User en DB
                                 ├─ Génère JWT token
                                 └─ Retourne { user, token }
Frontend ◄──{ user, token }──────Backend
├─ Stocke token en localStorage
└─ Redirige vers /dashboard

DB State:
USERS: 
  id | email           | username | password | isAdmin
  1  | john@gmail.com  | john     | $2b$... | false

─────────────────────────────────────────────────────────────

ÉTAPE 2: ACCÈS AU DASHBOARD
════════════════════════════
Frontend /dashboard
├─ Lit token de localStorage
├─ Envoie: GET /watchlist
│         Authorization: Bearer <token>
└─ Envoie: GET /activity-logs
            Authorization: Bearer <token>

Backend
├─ Valide JWT (middleware auth)
├─ Extrait userId = 1
├─ Requête: SELECT * FROM watchlist_items WHERE userId = 1
├─ Requête: SELECT * FROM activity_logs WHERE userId = 1 ORDER BY timestamp DESC
└─ Retourne: [], [] (vide, nouvel utilisateur)

Frontend ◄─── {watchlist: [], activityLogs: []} ──── Backend
└─ Affiche dashboard vide

─────────────────────────────────────────────────────────────

ÉTAPE 3: AJOUTER ACTION À WATCHLIST
═════════════════════════════════════
Frontend ──POST /watchlist──► Backend
  Body: {symbol: "AAPL", companyName: "Apple Inc"}
  Headers: Authorization: Bearer <token>
                                 ├─ Valide JWT
                                 ├─ Extrait userId = 1
                                 ├─ Vérifie unicité (1, AAPL)
                                 ├─ Crée WatchlistItem
                                 ├─ Crée ActivityLog (action: "add_watchlist")
                                 └─ Retourne WatchlistItem
Frontend ◄─── WatchlistItem ────Backend

DB State:
WATCHLIST_ITEMS:
  id | userId | symbol | companyName | addedAt
  1  | 1      | AAPL   | Apple Inc   | 2024-01-15 10:30:00

ACTIVITY_LOGS:
  id | userId | action        | details | timestamp
  1  | 1      | add_watchlist | {..}    | 2024-01-15 10:30:00

─────────────────────────────────────────────────────────────

ÉTAPE 4: CONSULTER PRÉDICTION
═══════════════════════════════
Frontend ──GET /predictions/AAPL──► Backend
  Headers: Authorization: Bearer <token>
                                     ├─ Valide JWT (userId = 1)
                                     ├─ Récupère données AAPL (market service)
                                     ├─ Appelle ML API: POST http://ml:8000/predict
                                     │  {symbol: "AAPL", historicalData: [...]}
                                     │
                                     ML API (FastAPI, port 8000)
                                     ├─ Reçoit données
                                     ├─ Lance modèle IA
                                     └─ Retourne: {price: 185.50, confidence: 0.87}
                                     │
                                     ├─ Crée UserPrediction en DB
                                     ├─ Crée ActivityLog (action: "view_prediction")
                                     └─ Cache résultat (1 heure)
Frontend ◄─── UserPrediction ──Backend
└─ Affiche: "Prédiction AAPL: $185.50 (87% confiance)"

DB State:
USER_PREDICTIONS:
  id | userId | symbol | companyName | predictedPrice | viewedAt
  1  | 1      | AAPL   | Apple Inc   | 185.50         | 2024-01-15 10:35:00

ACTIVITY_LOGS:
  id | userId | action          | details | timestamp
  1  | 1      | add_watchlist   | {..}    | 2024-01-15 10:30:00
  2  | 1      | view_prediction | {..}    | 2024-01-15 10:35:00

─────────────────────────────────────────────────────────────

ÉTAPE 5: AFFICHER HISTORIQUE
══════════════════════════════
Frontend ──GET /predictions/history──► Backend
  Headers: Authorization: Bearer <token>
                                        ├─ Valide JWT (userId = 1)
                                        ├─ Requête: SELECT * FROM user_predictions
                                        │             WHERE userId = 1
                                        │             ORDER BY viewedAt DESC
                                        └─ Retourne: [{id:1, symbol:AAPL, ...}]
Frontend ◄─── UserPrediction[] ────Backend
└─ Affiche historique:
   ┌────────────────────────────────┐
   │ Prédictions Consultées         │
   ├────────────────────────────────┤
   │ • AAPL: $185.50 (87%) - 10:35  │
   │                                │
   └────────────────────────────────┘

─────────────────────────────────────────────────────────────

État Final Complet:

USERS (1 ligne):
┌─────┬─────────────────┬──────────┬────────────────┬──────────┬──────────┬────────────┐
│ id  │ email           │ username │ password       │ isAdmin  │ created  │ lastLogin  │
├─────┼─────────────────┼──────────┼────────────────┼──────────┼──────────┼────────────┤
│ 1   │ john@gmail.com  │ john     │ $2b$10$..hash. │ false    │ 10:20    │ 10:35      │
└─────┴─────────────────┴──────────┴────────────────┴──────────┴──────────┴────────────┘

WATCHLIST_ITEMS (1 ligne):
┌─────┬─────────┬──────────┬────────────────┬──────────────────────┐
│ id  │ userId  │ symbol   │ companyName    │ addedAt              │
├─────┼─────────┼──────────┼────────────────┼──────────────────────┤
│ 1   │ 1       │ AAPL     │ Apple Inc      │ 2024-01-15 10:30:00  │
└─────┴─────────┴──────────┴────────────────┴──────────────────────┘

USER_PREDICTIONS (1 ligne):
┌─────┬─────────┬──────────┬────────────────┬────────────────┬──────────────────────┐
│ id  │ userId  │ symbol   │ companyName    │ predictedPrice │ viewedAt             │
├─────┼─────────┼──────────┼────────────────┼────────────────┼──────────────────────┤
│ 1   │ 1       │ AAPL     │ Apple Inc      │ 185.50         │ 2024-01-15 10:35:00  │
└─────┴─────────┴──────────┴────────────────┴────────────────┴──────────────────────┘

ACTIVITY_LOGS (2 lignes):
┌─────┬─────────┬──────────────────┬───────────┬──────────────────────┐
│ id  │ userId  │ action           │ details   │ timestamp            │
├─────┼─────────┼──────────────────┼───────────┼──────────────────────┤
│ 1   │ 1       │ add_watchlist    │ AAPL      │ 2024-01-15 10:30:00  │
│ 2   │ 1       │ view_prediction  │ AAPL      │ 2024-01-15 10:35:00  │
└─────┴─────────┴──────────────────┴───────────┴──────────────────────┘
```

---

## 9. Résumé des Relations Clés

| Relation | Type | Cardinalité | Exemple |
|----------|------|-------------|---------|
| User ↔ WatchlistItem | 1:N | 1 User a N actions | 1 John a 5 actions |
| User ↔ UserPrediction | 1:N | 1 User a N prédictions | 1 John a 10 prédictions |
| User ↔ ActivityLog | 1:N | 1 User a N logs | 1 John a 25 actions |
| WatchlistItem ↔ UserPrediction | N:M indirect | Via symbol | AAPL en watchlist + prédiction |

---

## 10. Architecture Déploiement

```
┌──────────────────────────────────────────────────────────┐
│           ARCHITECTURE PRODUCTION (Docker)               │
└──────────────────────────────────────────────────────────┘

docker-compose.yml structure:
├─ frontend (Next.js)
│  ├─ Port: 3000
│  ├─ Dockerfile: frontend.dockerfile
│  ├─ Env: NEXT_PUBLIC_API_URL=http://backend:4000
│  └─ Volumes: source code
│
├─ backend (Express)
│  ├─ Port: 4000
│  ├─ Dockerfile: backend.dockerfile
│  ├─ Env: DATABASE_URL=postgres://...
│  │        JWT_SECRET=...
│  │        ML_API_URL=http://ml:8000
│  └─ Volumes: source code
│
├─ ml (FastAPI)
│  ├─ Port: 8000
│  ├─ Dockerfile: stock-prediction-api/Dockerfile
│  ├─ Env: DATABASE_URL=postgres://...
│  └─ Volumes: models
│
├─ postgres (Database)
│  ├─ Port: 5432
│  ├─ Image: postgres:14
│  ├─ Volumes: data persist
│  └─ Env: POSTGRES_PASSWORD=...
│
└─ redis (Optional Cache)
   ├─ Port: 6379
   ├─ Image: redis:latest
   └─ Volumes: data persist

Network: Custom bridge network (stocknex-network)
Tous les services communiquent via le network interne
```

---

## Conclusion

Ce guide couvre:
✅ Architecture complète (Frontend, Backend, ML)
✅ Structure de données (4 modèles Prisma)
✅ Relations entre entités (1:N relationships)
✅ Flux de données complets (Auth, Watchlist, Prédictions)
✅ Services et APIs
✅ Déploiement Docker

Pour les schémas visuels, vous pouvez générer des diagrammes à partir des descriptions en utilisant:
- **PlantUML** pour les diagrammes de classe
- **Mermaid** pour les diagrammes de flux
- **Draw.io** pour les architectures
