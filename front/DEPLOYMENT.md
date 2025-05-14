# 🚀 Procédure de Déploiement Front-End - Kalhyge

Ce document décrit comment déployer le frontend de l'application Kalhyge sur Surge.

## 🛠️ Pré-requis
- Node.js et npm installés
- Compte Surge (https://surge.sh)
- Variables d’environnement correctement définies dans `.env.production`

## ⚙️ Variables d'environnement

- `VITE_API_URL` : URL de l'API (ex: https://api-kalhygee.onrender.com)
- `VITE_BASE_URL` : `/Kalhyge-prod/` pour la version hébergée dans un sous-dossier

Ces variables sont définies dans `.env.production`.

## 📦 Déploiement

Depuis la racine du projet, exécute :

```bash
bash deploy-front.sh
