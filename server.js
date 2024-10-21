const { createConnection } = require('./napi/quiche-node-bindings/target/release/libquiche_node_bindings.node');

console.log(createConnection());  // Correct function name

