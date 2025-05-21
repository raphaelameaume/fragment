import { contextBridge, ipcRenderer } from 'electron';

// Expose specific APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
	// Example function to send messages to main process
	sendMessage: (channel, data) => {
		// Whitelist channels for security
		const validChannels = ['toMain'];
		if (validChannels.includes(channel)) {
			ipcRenderer.send(channel, data);
		}
	},
	// Example function to receive messages from main process
	receive: (channel, func) => {
		const validChannels = ['fromMain'];
		if (validChannels.includes(channel)) {
			// Remove the event handler to avoid memory leaks
			ipcRenderer.on(channel, (event, ...args) => func(...args));
		}
	},
});
