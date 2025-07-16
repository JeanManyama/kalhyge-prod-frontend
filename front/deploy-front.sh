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