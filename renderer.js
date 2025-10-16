const statusDiv = document.getElementById('status');
const appListDiv = document.querySelector('.app-list');
const appNameInput = document.getElementById('app-name-input');
const installUrlInput = document.getElementById('install-url-input');
const uninstallUrlInput = document.getElementById('uninstall-url-input');
const addAppButton = document.getElementById('add-app-button');

let apps = [];
let currentCommandOutput = '';

addAppButton.addEventListener('click', () => {
  const name = appNameInput.value;
  const installUrl = installUrlInput.value;
  const uninstallUrl = uninstallUrlInput.value;
  if (name && installUrl && uninstallUrl) {
    window.electronAPI.addApp({ name, installUrl, uninstallUrl });
    appNameInput.value = '';
    installUrlInput.value = '';
    uninstallUrlInput.value = '';
  }
});

appListDiv.addEventListener('click', (event) => {
  const target = event.target;
  if (target.tagName !== 'BUTTON') {
    return;
  }

  const index = parseInt(target.id.split('-')[1], 10);
  const app = apps[index];

  if (target.id.startsWith('install-')) {
    currentCommandOutput = `Installing ${app.name}...`;
    statusDiv.innerText = currentCommandOutput;
    window.electronAPI.installApp(app.installUrl);
  } else if (target.id.startsWith('uninstall-')) {
    currentCommandOutput = `Uninstalling ${app.name}...`;
    statusDiv.innerText = currentCommandOutput;
    window.electronAPI.uninstallApp(app.uninstallUrl);
  }
});

window.electronAPI.onCommandReply((data) => {
  currentCommandOutput += `\n${data}`;
  statusDiv.innerText = currentCommandOutput;
});

window.electronAPI.onAppListUpdate((updatedApps) => {
  apps = updatedApps;
  appListDiv.innerHTML = '';
  apps.forEach((app, index) => {
    const appDiv = document.createElement('div');
    appDiv.className = 'app';
    appDiv.innerHTML = `
      <span class="app-name">${app.name}</span>
      <div class="buttons">
        <button id="install-${index}">Install</button>
        <button id="uninstall-${index}">Uninstall</button>
      </div>
    `;
    appListDiv.appendChild(appDiv);
  });
});