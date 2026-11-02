#!/bin/sh
# Rassemble les fichiers communs servis par le Worker (tous clients confondus)
set -e
rm -rf dist
mkdir -p dist
cp admin.html commun.js i18n.js qrcode.js qrbc.html gestion.html dist/
cp pwa/* dist/
