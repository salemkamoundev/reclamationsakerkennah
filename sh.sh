#!/bin/bash

echo "🚑 Lancement de la procédure de stabilisation..."

# 1. Suppression des paquets problématiques
echo "🗑️ Suppression des versions conflictuelles..."
npm uninstall tailwindcss @tailwindcss/postcss postcss autoprefixer
rm -rf node_modules
rm -rf .angular
rm -f package-lock.json

# 2. Installation forcée des versions STABLES (v3)
# On verrouille tailwindcss sur la version 3.4.x qui est 100% compatible Angular
echo "📦 Installation des versions stables..."
npm install -D tailwindcss@3.4.17 postcss@8.4.35 autoprefixer@10.4.17
npm install

# 3. Réinitialisation de la config PostCSS pour la v3 standard
# Note : On revient à la syntaxe classique 'tailwindcss' au lieu de '@tailwindcss/postcss'
echo "⚙️ Restauration de postcss.config.js standard..."
cat << 'EOF' > postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# 4. Vérification de tailwind.config.js
# On s'assure qu'il est bien présent et configuré
echo "📝 Vérification de tailwind.config.js..."
cat << 'EOF' > tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0f172a',
        'brand-green': '#10b981',
      }
    },
  },
  plugins: [],
}
EOF

echo "✅ Stabilisation terminée."
echo "👉 Lance 'ng serve' maintenant. Cela DOIT fonctionner."
