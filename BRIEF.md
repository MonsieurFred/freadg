# BRIEF.md — Projet Fridge

> Ce fichier sert de référence complète pour Claude Code.
> Lis ce fichier en entier avant de commencer à coder quoi que ce soit.

---

## 1. Description du projet

**Fridge** est une plateforme web de planification de repas hebdomadaires.
L'utilisateur choisit ses repas pour la semaine parmi une sélection proposée par la plateforme, et reçoit automatiquement une liste de courses personnalisée.

**Phase 1 (MVP) :** Site web uniquement.
**Phase 2 (an 2-3) :** Application mobile.

---

## 2. Stack technique

| Élément | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Langage | TypeScript |
| Base de données | Supabase (PostgreSQL) |
| Authentification | Supabase Auth |
| Paiement | Stripe (abonnements récurrents) |
| API nutrition | Edamam API (calcul macros automatique) |
| Hébergement | Vercel |
| Styling | Tailwind CSS |

---

## 3. Modèle économique

- **Abonnement** : 6,99 €/mois par utilisateur
- **Commission supermarchés** : 3% sur les courses commandées via la plateforme (Collect&Go, Delhaize, Colruyt, etc.)
- **Pas de revenus publicitaires**
- **Structure juridique** : SRL belge

---

## 4. Fonctionnalités (par ordre de priorité)

### 4.1 Authentification
- Inscription / connexion par email + mot de passe
- Connexion Google (OAuth)
- Gestion du profil utilisateur (nombre de personnes dans le foyer, régime alimentaire : végétarien, sans gluten, etc.)
- Gestion de l'abonnement Stripe (activer, annuler, voir la date de renouvellement)

### 4.2 Catalogue de recettes
- **Au lancement** : 100 recettes en base
- Chaque recette contient :
  - Nom, description courte
  - Photo
  - Ingrédients (nom, quantité, unité) — adaptés automatiquement au nombre de personnes du foyer
  - Étapes de préparation
  - Temps de préparation
  - Valeurs nutritionnelles (calories, protéines, glucides, lipides) — calculées via API Edamam
  - Tags : végétarien, sans gluten, rapide (<30 min), etc.
  - Saison recommandée

### 4.3 Sélection de la semaine (fonctionnalité principale)
- Chaque semaine, la plateforme met en avant **20 recettes** (sélection éditoriale)
- L'utilisateur compose sa semaine en combinant 3 sources :
  1. **Sélection de la semaine** — les 20 recettes mises en avant
  2. **Mes favoris** — recettes sauvegardées par l'utilisateur
  3. **Recherche libre** — moteur de recherche dans tout le catalogue
- Interface type planning hebdomadaire (lundi → dimanche, midi + soir)
- Possibilité de définir combien de repas par jour (1 ou 2)

### 4.4 Liste de courses
- Générée automatiquement depuis les repas sélectionnés
- Regroupement par catégorie (légumes, viandes, épicerie, etc.)
- Quantités ajustées au nombre de personnes du foyer
- Export possible (PDF ou copie texte)
- **Intégration supermarchés** : bouton "Commander sur Collect&Go / Delhaize / Colruyt" qui transfère la liste vers leur site (avec tracking pour la commission 3%)

### 4.5 Favoris
- Système de sauvegarde de recettes (cœur / bookmark)
- Page "Mes favoris" avec filtres

### 4.6 Moteur de recherche
- Recherche par nom de recette
- Filtres : végétarien, sans gluten, temps de préparation, saison, calories
- Tri : popularité, nouveauté

### 4.7 Interface Admin (back-office)
- Accès réservé aux admins (rôle dans Supabase)
- **Gestion des recettes** :
  - Formulaire structuré pour ajouter une recette (le chef remplit ce formulaire)
  - Champs : nom, description, photo, ingrédients (tableau nom/quantité/unité), étapes, tags, saison
  - Appel automatique à l'API Edamam pour calculer les valeurs nutritionnelles à l'enregistrement
  - Activation / désactivation d'une recette
- **Sélection de la semaine** :
  - Interface pour choisir les 20 recettes mises en avant chaque semaine
  - Planification à l'avance possible
- **Statistiques basiques** : nombre d'abonnés actifs, recettes les plus sélectionnées

---

## 5. Structure de la base de données (Supabase)

### Table `users` (gérée par Supabase Auth + profil)
```
id (uuid, PK)
email
household_size (int) — nombre de personnes
dietary_preferences (text[]) — ex: ["vegetarian", "gluten_free"]
stripe_customer_id (text)
stripe_subscription_id (text)
subscription_status (text) — active / inactive / trialing
created_at
```

### Table `recipes`
```
id (uuid, PK)
title (text)
description (text)
photo_url (text)
prep_time_minutes (int)
servings_base (int) — portion de base (ex: 4 personnes)
tags (text[]) — ex: ["vegetarian", "quick", "gluten_free"]
season (text[]) — ex: ["autumn", "winter"]
calories (int)
proteins_g (float)
carbs_g (float)
fats_g (float)
steps (jsonb) — tableau d'étapes [{step: 1, instruction: "..."}]
is_active (boolean)
created_at
```

### Table `ingredients`
```
id (uuid, PK)
recipe_id (uuid, FK → recipes)
name (text)
quantity (float)
unit (text) — ex: "g", "ml", "pièce", "c. à soupe"
grocery_category (text) — ex: "légumes", "viandes", "épicerie"
```

### Table `weekly_selection`
```
id (uuid, PK)
week_start_date (date) — lundi de la semaine
recipe_id (uuid, FK → recipes)
```

### Table `user_meal_plans`
```
id (uuid, PK)
user_id (uuid, FK → users)
week_start_date (date)
day_of_week (int) — 1=lundi, 7=dimanche
meal_type (text) — "lunch" ou "dinner"
recipe_id (uuid, FK → recipes)
```

### Table `user_favorites`
```
id (uuid, PK)
user_id (uuid, FK → users)
recipe_id (uuid, FK → recipes)
created_at
```

---

## 6. Pages du site

| Route | Description |
|---|---|
| `/` | Landing page (présentation, prix, CTA inscription) |
| `/register` | Inscription |
| `/login` | Connexion |
| `/dashboard` | Tableau de bord — sélection de la semaine en cours |
| `/recipes` | Catalogue complet avec recherche et filtres |
| `/recipes/[id]` | Détail d'une recette |
| `/my-week` | Planning de la semaine de l'utilisateur |
| `/shopping-list` | Liste de courses générée |
| `/favorites` | Recettes favorites |
| `/account` | Profil, préférences, gestion abonnement |
| `/admin` | Back-office (accès admin uniquement) |
| `/admin/recipes` | Gestion des recettes |
| `/admin/weekly` | Sélection des 20 recettes de la semaine |

---

## 7. Logique métier importante

### Ajustement des quantités
Les quantités d'ingrédients dans la base sont pour `servings_base` personnes.
Quand on génère la liste de courses, multiplier par `(household_size / servings_base)`.

### Génération de la liste de courses
1. Récupérer tous les repas du `user_meal_plans` pour la semaine
2. Pour chaque recette, récupérer ses `ingredients`
3. Ajuster les quantités selon `household_size`
4. Regrouper par `grocery_category`
5. Additionner les quantités des mêmes ingrédients (même nom + même unité)

### Rotation des recettes de la semaine
- La table `weekly_selection` contient 20 lignes par semaine
- Un admin choisit ces 20 recettes chaque semaine via le back-office
- Les recettes peuvent être réutilisées d'une semaine à l'autre (rotation normale)

### Calcul nutritionnel
- À la création d'une recette dans l'admin, appeler l'API Edamam avec la liste d'ingrédients
- Stocker les valeurs nutritionnelles directement dans la table `recipes`
- Ne pas recalculer à chaque affichage

---

## 8. Intégrations externes

### Stripe
- Produit : abonnement mensuel à 6,99 €
- Webhook Stripe pour mettre à jour `subscription_status` dans Supabase
- Page de gestion abonnement via Stripe Customer Portal

### Edamam API
- Endpoint : Nutrition Analysis API
- Utilisation : calcul automatique des macros à la création d'une recette
- Gratuit jusqu'à 10 000 appels/mois (largement suffisant)
- Clé API à stocker dans les variables d'environnement

### Supermarchés (commission 3%)
- Collect&Go (Colruyt), Delhaize, autres enseignes belges
- Intégration par liens affiliés ou API partenaire selon accord négocié
- Bouton "Commander" dans la liste de courses qui redirige vers le supermarché avec tracking UTM

---

## 9. Variables d'environnement nécessaires

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID= (ID du prix à 6,99€/mois)

# Edamam
EDAMAM_APP_ID=
EDAMAM_APP_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 10. Ordre de développement recommandé

1. Setup Next.js + Supabase + Tailwind
2. Schéma base de données (tables + politiques RLS)
3. Authentification (inscription, connexion, profil)
4. Catalogue recettes (affichage)
5. Sélection de la semaine + planning hebdomadaire
6. Liste de courses (génération automatique)
7. Favoris + moteur de recherche
8. Intégration Stripe (abonnement)
9. Interface admin (ajout recettes + sélection semaine)
10. Intégration Edamam (calcul macros)
11. Intégration supermarchés (liens affiliés)
12. Tests + audit sécurité externe

---

## 11. Contexte business (pour comprendre les priorités)

- Marché cible : Belgique francophone
- Utilisateurs cibles : familles actives + jeunes actifs soucieux de leur alimentation
- Seuil de rentabilité : ~160 abonnés actifs (sans salaires fondateurs)
- Seuil déclenchement salaires : ~700 abonnés actifs
- Concurrents : HelloFresh (livraison), Mealime, Plan to Eat (apps recettes)
- Différenciant : liberté de choix + recettes créées par des pros + intégration courses
- Nouveau chef/nutritionniste : crée 5 nouvelles recettes/semaine via formulaire admin à 15€/recette

---

*Dernière mise à jour : avril 2026*
