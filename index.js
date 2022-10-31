import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { webRTCStar } from "@libp2p/webrtc-star";
import { Noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { bootstrap } from "@libp2p/bootstrap";
import { floodsub } from "@libp2p/floodsub";

document.addEventListener("DOMContentLoaded", async () => {
  const topic = "zksnark";
  const wrtcStar = webRTCStar();

  // Create our libp2p node
  const libp2p = await createLibp2p({
    addresses: {
      // Add the signaling server address, along with our PeerId to our multiaddrs list
      // libp2p will automatically attempt to dial to the signaling server so that it can
      // receive inbound connections from other peers
      listen: [
        "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
        "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
      ],
    },
    transports: [webSockets(), wrtcStar.transport],
    connectionEncryption: [() => new Noise()],
    streamMuxers: [mplex()],
    pubsub: floodsub(),
    peerDiscovery: [
      wrtcStar.discovery,
      bootstrap({
        list: [
          "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
          "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
          "/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp",
          "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
          "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
        ],
      }),
    ],
  });

  // UI elements
  const status = document.getElementById("status");
  const output = document.getElementById("output");

  output.textContent = "";

  function log(txt) {
    output.textContent += `${txt.trim()}\n`;
  }

  // Listen for new peers
  libp2p.addEventListener("peer:discovery", (evt) => {
    const peer = evt.detail;
    log(`Found peer ${peer.id.toString()}`);

    // dial them when we discover them
    libp2p.dial(evt.detail.id).catch((err) => {
      log(`Could not dial ${evt.detail.id}`, err);
    });
  });

  // Listen for new connections to peers
  libp2p.connectionManager.addEventListener("peer:connect", (evt) => {
    const connection = evt.detail;
    log(`Connected to ${connection.remotePeer.toString()}`);
  });

  // Listen for peers disconnecting
  libp2p.connectionManager.addEventListener("peer:disconnect", (evt) => {
    const connection = evt.detail;
    log(`Disconnected from ${connection.remotePeer.toString()}`);
  });

  await libp2p.start();
  // Export libp2p to the window so you can play with the API
  window.libp2p = libp2p;

  //subscribe
  libp2p.pubsub.addEventListener("message", (evt) => {
    if (evt.detail.topic !== topic) {
      return;
    }

    // Will not receive own published messages by default
    console.log(`libp2p received: ${evt.detail.data}`);
  });
  libp2p.pubsub.subscribe(topic);

  status.innerText = "libp2p started!";
  log(`libp2p id is ${libp2p.peerId.toString()}`);

  while (true) {
    const fruit = "banana";
    console.log("############## fruit " + fruit + " ##############");
    await libp2p.pubsub.publish(topic, fruit);
    // wait a few seconds for messages to be received
    await delay(5000);
  }
});

async function delay(ms) {
  await new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}
