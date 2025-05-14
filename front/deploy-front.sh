#!/bin/bash

echo "📦 [1/4] Build de l'application..."
npm run build

echo "🔁 [2/4] Copie de index.html vers 200.html (support SPA routes)"
cp ./dist/index.html ./dist/200.html

echo "🌍 [3/4] Déploiement sur Surge..."
surge ./dist kalhyge-production.surge.sh

echo "✅ [4/4] Déploiement terminé avec succès !"
