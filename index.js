const WebSocket = require('ws');
const net = require('net');

const wsPort = 8080; // WebSocket server port
const sshHost = '127.0.0.1'; // SSH server address
const sshPort = 31337; // SSH server port

// Create WebSocket server
const wss = new WebSocket.Server({ port: wsPort });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    // Create a connection to the SSH server
    const sshSocket = net.createConnection(sshPort, sshHost, () => {
        console.log('Connected to SSH server');
    });

    // Forward data from WebSocket to SSH
    ws.on('message', (message) => {
        sshSocket.write(message);
    });

    // Forward data from SSH to WebSocket
    sshSocket.on('data', (data) => {
        ws.send(data);
    });

    // Handle WebSocket close
    ws.on('close', () => {
        console.log('WebSocket connection closed');
        sshSocket.end();
    });

    // Handle SSH socket close
    sshSocket.on('close', () => {
        console.log('SSH connection closed');
        ws.close();
    });

    // Handle errors
    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
        sshSocket.end();
    });

    sshSocket.on('error', (err) => {
        console.error('SSH socket error:', err);
        ws.close();
    });
});

console.log(`WebSocket server is running on ws://localhost:${wsPort}`);