    1  touch WT-VIVOH-IO
    2  sudo apt update
    3  sudo apt install certbot nodejs npm cmake nginx ninja-build
    4  sudo certbot certonly -d wt.vivoh.io
    5  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    6  . "$HOME/.cargo/env"
    8  git clone --recursive https://github.com/erikherz/node-wt.git
    9  git clone --recursive https://github.com/erikherz/quiche-node-bindings.git
    10  sudo vi /etc/nginx/sites-available/default
    11  sudo vi /var/www/html/index.html
    12  npm run build
    13  sudo systemctl restart nginx
    14  sudo mkdir /var/www/html/player
    15  sudo vi /var/www/html/player/index.html
    16  sudo vi /var/www/html/player/wt.js
    17  cd ../quiche-node-bindings
    18  cargo build --release
    19  mv target/release/libquiche_node_bindings.so target/release/libquiche_node_bindings.node
    20  cd ../node-wt
    21  npm install
    22  sudo node server.js
