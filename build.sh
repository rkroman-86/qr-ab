#!/bin/sh
# Rassemble les fichiers communs servis par le Worker (tous clients confondus)
set -e
rm -rf dist
mkdir -p dist
cp admin.html commun.js i18n.js qrcode.js qrbc.html gestion.html cgv.html cgv.en.html cgv.ru.html mentions-legales.html mentions-legales.en.html mentions-legales.ru.html dist/
cp pwa/* dist/
