#!/bin/zsh
# Lance le site en local sur http://localhost:8765 puis l'ouvre dans le navigateur.
cd "$(dirname "$0")/docs"
( sleep 1; open "http://localhost:8765/" ) &
echo "Site Q-LEAP refonte : http://localhost:8765  (Ctrl+C pour arrêter)"
python3 -m http.server 8765 --bind 127.0.0.1
