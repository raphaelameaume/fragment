import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import url from 'url';

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

function createWindow() {
	// Create the browser window
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: false, // Security: don't expose Node.js APIs to renderer
			contextIsolation: true, // Security: isolate renderer process
			preload: path.join(process.cwd(), 'src/electron/preload.js'), // Optional: preload script
		},
	});

	// Determine which URL to load
	const startUrl =
		process.env.ELECTRON_START_URL ||
		url.format({
			pathname: path.join(__dirname, '../dist/index.html'),
			protocol: 'file:',
			slashes: true,
		});

	// Load the URL
	mainWindow.loadURL(startUrl);

	// Open DevTools in development mode (optional)
	if (process.env.NODE_ENV === 'development') {
		mainWindow.webContents.openDevTools();
	}

	// Handle window being closed
	mainWindow.on('closed', () => {
		mainWindow = null;
	});
}

// Create window when Electron has initialized
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// On macOS, re-create window when dock icon is clicked
app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
