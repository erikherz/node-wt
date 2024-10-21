let webTransport = null;
let controlStream = null;
document.addEventListener("DOMContentLoaded", () => {
  console.log("Page loaded, setting up event listeners...");
  document.getElementById("connectButton").addEventListener("click", async () => {
    const serverUrl = document.getElementById("serverUrl").value;
    logMessage(`Attempting to connect to: ${serverUrl}`);
    console.log(`Attempting to connect to: ${serverUrl}`);
    try {
      webTransport = new WebTransport(serverUrl);
      logMessage("WebTransport object created, awaiting connection...");
      console.log("WebTransport object created, awaiting connection...");
      await webTransport.ready;
      logMessage("Connected to WebTransport server");
      console.log("Connected to WebTransport server");
      // Open control stream
      controlStream = await webTransport.createBidirectionalStream();
      logMessage("Control stream established.");
      console.log("Control stream established.");
      // Initiate handshake using proper binary encoding
      await initiateHandshake();
      // Enable send and disconnect buttons
      document.getElementById("sendButton").disabled = false;
      document.getElementById("disconnectButton").disabled = false;
      // Listen for control responses
      handleControlStream(controlStream.readable);
    } catch (error) {
      logMessage(`Connection failed: ${error.message}`);
      console.error("Detailed connection error:", error);
    }
  });
  document.getElementById("disconnectButton").addEventListener("click", () => {
    if (webTransport) {
      webTransport.close();
      logMessage("Disconnected from WebTransport server");
      console.log("Disconnected from WebTransport server");
      document.getElementById("sendButton").disabled = true;
      document.getElementById("disconnectButton").disabled = true;
    }
  });
  document.getElementById("sendButton").addEventListener("click", () => {
    if (controlStream) {
      subscribeToStream("ffmpegtest", "teststream");
    }
  });
});
function logMessage(message) {
  const output = document.getElementById("output");
  output.value += `${new Date().toISOString()} - ${message}\n`;
  output.scrollTop = output.scrollHeight;
}
async function initiateHandshake() {
  try {
    const writer = controlStream.writable.getWriter();
    // Construct binary buffer for handshake
    const buffer = new ArrayBuffer(12); // Adjust buffer size as needed
    const view = new DataView(buffer);
    // Example: setting version (uint32), role (uint32), and other params
    // Protocol version (DRAFT_04): 0xFF000004
    view.setUint32(0, 0xFF000004, true); // true for little-endian
    // Role (ROLE_SUBSCRIBER): 0x02
    view.setUint32(4, 0x02, true); // Assuming uint32 for role
    await writer.write(buffer);
    writer.releaseLock();
    logMessage("Handshake initiated with role set as subscriber.");
    console.log("Handshake initiated with role set as subscriber.");
  } catch (error) {
    logMessage(`Error during handshake: ${error.message}`);
    console.error("Handshake error:", error);
  }
}
async function handleControlStream(readable) {
  const reader = readable.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      // Parse received binary message
      const response = new TextDecoder().decode(value);
      logMessage(`Received control message: ${response}`);
      console.log(`Received control message: ${response}`);
    }
  } catch (error) {
    logMessage(`Error receiving control messages: ${error.message}`);
    console.error("Control stream error:", error);
  } finally {
    reader.releaseLock();
  }
}
async function subscribeToStream(namespace, stream) {
  try {
    const writer = controlStream.writable.getWriter();
    // Construct binary subscription message
    const buffer = new ArrayBuffer(100); // Placeholder buffer size
    const view = new DataView(buffer);
    // Binary encoding example:
    // Set TrackAlias, Namespace, and StreamName correctly
    view.setUint32(0, 0x00000001, true); // Subscription ID
    view.setUint32(4, 0x00000002, true); // Alias (example)
    
    // Simulate adding strings - encode as length-prefixed
    const nsEncoder = new TextEncoder();
    const nsEncoded = nsEncoder.encode(namespace);
    const streamEncoder = new TextEncoder();
    const streamEncoded = streamEncoder.encode(stream);
    
    view.setUint8(8, nsEncoded.length);
    nsEncoded.forEach((byte, i) => {
      view.setUint8(9 + i, byte);
    });
    // Similar encoding for stream name
    view.setUint8(9 + nsEncoded.length, streamEncoded.length);
    streamEncoded.forEach((byte, i) => {
      view.setUint8(10 + nsEncoded.length + i, byte);
    });
    await writer.write(buffer);
    writer.releaseLock();
    logMessage(`Subscribed to stream: ${namespace}/${stream}`);
    console.log(`Subscribed to stream: ${namespace}/${stream}`);
  } catch (error) {
    logMessage(`Error subscribing to stream: ${error.message}`);
    console.error("Error subscribing to stream:", error);
  }
}
