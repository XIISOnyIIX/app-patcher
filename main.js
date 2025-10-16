const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const https = require('https');
const fs = require('fs');
const os = require('os');

const appsDbPath = path.join(app.getPath('userData'), 'apps.json');

function readApps() {
  try {
    return JSON.parse(fs.readFileSync(appsDbPath, 'utf-8'));
  } catch (error) {
    return [];
  }
}

function writeApps(apps) {
  fs.writeFileSync(appsDbPath, JSON.stringify(apps, null, 2));
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('app-list-update', readApps());
  });
}

function executeScriptFromUrl(event, url) {
  const tempFilePath = path.join(os.tmpdir(), `script-${Date.now()}.sh`);
  const file = fs.createWriteStream(tempFilePath);

  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close(() => {
        fs.chmod(tempFilePath, '755', (err) => {
          if (err) {
            event.reply('command-reply', `Error making script executable: ${err.message}`);
            return;
          }

          exec(tempFilePath, (error, stdout, stderr) => {
            fs.unlink(tempFilePath, () => {}); // Clean up the script
            if (error) {
              event.reply('command-reply', `Error: ${error.message}`);
              return;
            }
            if (stderr) {
              event.reply('command-reply', `Stderr: ${stderr}`);
              return;
            }
            event.reply('command-reply', `Stdout: ${stdout}`);
          });
        });
      });
    });
  }).on('error', (err) => {
    fs.unlink(tempFilePath, () => {}); // Clean up on error
    event.reply('command-reply', `Error downloading script: ${err.message}`);
  });
}

ipcMain.on('add-app', (event, app) => {
  const apps = readApps();
  apps.push(app);
  writeApps(apps);
  mainWindow.webContents.send('app-list-update', apps);
});

ipcMain.on('install-app', (event, installUrl) => {
  executeScriptFromUrl(event, installUrl);
});

ipcMain.on('uninstall-app', (event, uninstallUrl) => {
  executeScriptFromUrl(event, uninstallUrl);
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});