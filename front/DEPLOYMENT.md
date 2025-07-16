
# 🚀 Procédure de Déploiement Front-End – Kalhyge

Ce document décrit comment déployer le front-end de l'application Kalhyge sur Surge.

---

## 🛠️ Pré-requis

- Node.js et npm installés localement
- Un compte Surge actif (https://surge.sh), avec connexion effectuée via surge login
- Fichier deploy-front.sh présent à la racine du dossier /front
- Fichiers d’environnement correctement séparés :
  - .env.development pour le mode local
  - .env.production pour la version en ligne

---

## ⚙️ Variables d'environnement

Les fichiers .env ne sont pas commités (protégés par .gitignore), mais doivent exister localement.

### Exemple de .env.production :

```env
NODE_ENV=production
VITE_API_URL=https://api-kalhygee.onrender.com
VITE_BASE_URL=/Kalhyge-prod/
```

---

## 🧩 Script de Déploiement

Le fichier deploy-front.sh automatise toutes les étapes du déploiement (build, routing SPA, publication). Il est placé dans le dossier /front.

Contenu :

```bash
#!/bin/bash

echo "📦 [1/4] Compilation TypeScript..."
tsc -b

echo "🏗️  [2/4] Build de l'application avec Vite (mode production)..."
npx vite build --mode production

echo "🔁 [3/4] Copie de index.html vers 200.html (support SPA routes)"
cp ./dist/index.html ./dist/200.html

echo "🌍 [4/4] Déploiement sur Surge..."
surge ./dist kalhyge-production.surge.sh

echo "✅ Déploiement terminé avec succès ! 🎉"
```

---

## 📦 Déploiement (2 méthodes)

✅ Méthode 1 – Manuelle

Depuis le dossier /front :

```bash
./deploy-front.sh
```

✅ Méthode 2 – Script npm

Un raccourci est disponible dans le package.json :

```json
"scripts": {
  "deploy": "bash deploy-front.sh"
}
```

Tu peux donc simplement lancer :

```bash
npm run deploy
```

Cela exécute automatiquement tout le script de déploiement.

---

✅ Une fois terminé, ton application est accessible à l’adresse :

🔗 https://kalhyge-production.surge.sh
