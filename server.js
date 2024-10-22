process.env.RUST_LOG = 'quiche=trace'; // Enable detailed logging for the Quiche library

const fs = require('fs');
const path = require('path');

// Load the Quiche bindings
let quiche;
try {
    console.log('Attempting to load Quiche bindings...');
    quiche = require('./napi/quiche-node-bindings/target/release/libquiche_node_bindings.node');
    console.log('Quiche bindings loaded successfully.');
} catch (err) {
    console.error('Error loading Quiche bindings:', err);
    process.exit(1);
}

// Check what is exported from the Quiche bindings
console.log('Exports from Quiche bindings:', Object.keys(quiche));

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
    
    // Call the Rust function to setup the QUIC server
    //const result = quiche.setup_quic_server(certPath, keyPath);
   // const result = quiche.setup_quic_server(certPath, keyPath); // Use snake_case here
    const result = quiche.setupQuicServer(certPath, keyPath); // Use camelCase

	console.log('Exports from Quiche bindings:', Object.keys(quiche));


    
    console.log('QUIC server setup result:', result);
    console.log('QUIC server setup complete. Listening for connections...');
} catch (err) {
    console.error('Error during QUIC server setup:', err.stack);
    process.exit(1);
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
});

// Graceful shutdown on SIGINT
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    process.exit(0);
});

