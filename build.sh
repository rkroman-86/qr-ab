#!/bin/sh
# Rassemble les fichiers communs servis par le Worker (tous clients confondus)
set -e
rm -rf dist
mkdir -p dist
cp admin.html commun.js i18n.js qrcode.js qrbc.html outil-qr.html gestion.html constructeur.html cgv.html cgv.en.html cgv.ru.html mentions-legales.html mentions-legales.en.html mentions-legales.ru.html dist/
cp pwa/* dist/
if [ -d videos ]; then mkdir -p dist/videos && cp videos/*.mp4 dist/videos/ 2>/dev/null || true; fi
