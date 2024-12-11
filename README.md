# Photo Collage Application

Photo Collage Application est une application simple basée sur HTML, CSS et JavaScript qui permet aux utilisateurs de créer des collages de photos directement dans leur navigateur. L'application est contenue dans un conteneur Docker pour un déploiement facile.

## Fonctionnalités

- Glissez-déposez des images dans la zone de travail.
- Redimensionnez, déplacez et pivotez les images.
- Auto-arrangez les images pour un agencement automatique.
- Exportez le collage final en format JPG.
- Changez la taille du cadre de travail (4:3, 16:9, 1:1).

## Structure du projet
photo-collage/
├── index.html        # Fichier HTML principal
├── styles.css        # Feuille de style pour la mise en page
├── script.js         # Script JavaScript pour l’interactivité
├── Dockerfile        # Fichier pour construire l’image Docker
├── .dockerignore     # Fichier pour ignorer certains fichiers lors de la construction Docker
