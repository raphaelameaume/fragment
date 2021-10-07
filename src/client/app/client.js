const socketProtocol = (location.protocol === 'https:' ? 'wss' : 'ws');
const socketHost = `${location.hostname}:${__FRAGMENT_PORT__}`;

const socket = new WebSocket(`${socketProtocol}://${socketHost}`);

socket.addEventListener('message', async ({ data }) => {
    handleMessage(JSON.parse(data))
});

function handleMessage(payload) {
    console.log(payload);
}
