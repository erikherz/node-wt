process.env.RUST_LOG = 'quiche=trace'; // or set this in your environment

const { setupQuicServer } = require('./napi/quiche-node-bindings/target/release/libquiche_node_bindings.node');
const fs = require('fs');

// Certificate and Key Paths
const certPath = '/etc/letsencrypt/live/wt.vivoh.io/fullchain.pem';
const keyPath = '/etc/letsencrypt/live/wt.vivoh.io/privkey.pem';

// Ensure cert and key exist
if (!fs.existsSync(certPath)) {
    console.error(`Certificate not found at path: ${certPath}`);
    process.exit(1);
}
if (!fs.existsSync(keyPath)) {
    console.error(`Private key not found at path: ${keyPath}`);
    process.exit(1);
}

console.log(`Certificate Path: ${certPath}`);
console.log(`Key Path: ${keyPath}`);

try {
    console.log('Starting QUIC server setup...');
    const result = setupQuicServer(certPath, keyPath);
    console.log(result);
    console.log('QUIC server setup complete. Listening for connections...');
} catch (err) {
    console.error('Error during QUIC server setup:', err);
    process.exit(1);
}

// Handle incoming QUIC connections
process.on('uncaughtException', (err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('Shutting down server...');
    process.exit(0);
});

