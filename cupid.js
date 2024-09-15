// webrtc-contact-sharing.js

let localConnection, remoteConnection;
let sendChannel, receiveChannel;

// DOM Elements
const sendContactBtn = document.getElementById('sendContactBtn');
const receivedContact = document.getElementById('received-contact');

// Function to create a peer connection and send contact
function createPeerConnection() {
    const servers = null; // Use Google's STUN servers or others if needed
    localConnection = new RTCPeerConnection(servers);
    sendChannel = localConnection.createDataChannel("contactDataChannel");

    sendChannel.onopen = handleSendChannelStatusChange;
    sendChannel.onclose = handleSendChannelStatusChange;

    remoteConnection = new RTCPeerConnection(servers);
    remoteConnection.ondatachannel = receiveChannelCallback;

    // Exchange ICE candidates between peers
    localConnection.onicecandidate = e => {
        if (e.candidate) {
            remoteConnection.addIceCandidate(e.candidate);
        }
    };

    remoteConnection.onicecandidate = e => {
        if (e.candidate) {
            localConnection.addIceCandidate(e.candidate);
        }
    };

    // Create offer and answer
    localConnection.createOffer().then(offer => {
        localConnection.setLocalDescription(offer);
        remoteConnection.setRemoteDescription(offer);
        return remoteConnection.createAnswer();
    }).then(answer => {
        remoteConnection.setLocalDescription(answer);
        localConnection.setRemoteDescription(answer);
    });
}

// Handle send channel status
function handleSendChannelStatusChange() {
    if (sendChannel) {
        const state = sendChannel.readyState;
        if (state === "open") {
            console.log("Connection opened. Ready to send contact.");
        } else {
            console.log("Connection closed.");
        }
    }
}

// Function to handle received contact data
function receiveChannelCallback(event) {
    receiveChannel = event.channel;
    receiveChannel.onmessage = event => {
        receivedContact.textContent = event.data; // Display received contact
    };
    receiveChannel.onopen = () => console.log("Receiving channel opened.");
    receiveChannel.onclose = () => console.log("Receiving channel closed.");
}

// Function to send contact information
function sendContact() {
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;

    const contactData = `Name: ${name}\nPhone: ${phone}\nEmail: ${email}`;
    
    if (sendChannel.readyState === "open") {
        sendChannel.send(contactData);
        alert("Contact Sent!");
    } else {
        alert("Connection is not ready.");
    }
}

// Event Listeners
sendContactBtn.addEventListener('click', () => {
    createPeerConnection();
    sendContact();
});
