const { app, dialog, Tray, nativeImage, Menu } = require('electron');
const fs = require('fs');
const path = require('path');

let tray;
const appName = 'SteamGameImporter';
const configDir = path.join(app.getPath('appData'), appName);
const configPath = path.join(configDir, 'config.json');
const iconFile = path.join(configDir, 'icon.png');

// Load configuration (returns null if missing/invalid)
function loadConfig() {
  if (!fs.existsSync(configPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {
    return null;
  }
}

// Save configuration object to disk
function saveConfig(config) {
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}

// Show a folder-picker dialog to select Steam installation
async function promptSteamFolder() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Select your Steam installation folder',
    properties: ['openDirectory']
  });
  if (canceled || filePaths.length === 0) return null;
  return filePaths[0];
}

// Check whether a folder has required Steam subfolders
function validateSteamFolder(folder) {
  const pluginPath = path.join(folder, 'config', 'stplug-in');
  const depotPath = path.join(folder, 'config', 'depotcache');
  return fs.existsSync(pluginPath) && fs.existsSync(depotPath);
}

// Attempt to get a valid Steam folder (up to two attempts), then save in config
async function getValidSteamFolder() {
  const existingConfig = loadConfig();
  if (existingConfig && existingConfig.steamDir && validateSteamFolder(existingConfig.steamDir)) {
    return existingConfig.steamDir;
  }

  // First prompt
  let chosen = await promptSteamFolder();
  if (!chosen || !validateSteamFolder(chosen)) {
    const retry = await dialog.showMessageBox({
      type: 'warning',
      buttons: ['Retry', 'Cancel'],
      defaultId: 0,
      cancelId: 1,
      title: 'Invalid Steam Folder',
      message:
        'The folder you chose does not contain required Steam subfolders.\n' +
        'Please select the correct Steam installation folder.'
    });
    if (retry.response === 0) {
      // Second prompt
      chosen = await promptSteamFolder();
      if (!chosen || !validateSteamFolder(chosen)) {
        dialog.showErrorBox('Failed', 'Steam folder invalid or missing required subfolders. Exiting.');
        app.quit();
        return null;
      }
    } else {
      app.quit();
      return null;
    }
  }

  saveConfig({ steamDir: chosen });
  return chosen;
}

// Extract the EXE’s icon once and save it as PNG under configDir
async function extractIconIfNeeded() {
  if (fs.existsSync(iconFile)) return;
  try {
    const exePath = process.execPath;
    const icon = await app.getFileIcon(exePath, { size: 'normal' });
    if (!icon.isEmpty()) {
      const pngBuffer = icon.toPNG();
      if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
      fs.writeFileSync(iconFile, pngBuffer);
    }
  } catch (e) {
    console.error('Icon extraction failed:', e);
  }
}

// Prompt for a source folder and move .lua, .manifest, .st files into Steam
async function runImport() {
  try {
    const config = loadConfig();
    if (!config || !config.steamDir) {
      throw new Error('Steam directory not configured. Please restart.');
    }
    const steamDir = config.steamDir;
    const pluginPath = path.join(steamDir, 'config', 'stplug-in');
    const depotPath = path.join(steamDir, 'config', 'depotcache');

    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Select Folder with .lua, .manifest, and .st files',
      properties: ['openDirectory']
    });
    if (canceled || filePaths.length === 0) return;
    const selectedDir = filePaths[0];

    const luaFiles = [];
    const manifestFiles = [];
    const stFiles = [];

    fs.readdirSync(selectedDir).forEach(file => {
      if (file.endsWith('.lua')) luaFiles.push(file);
      else if (file.endsWith('.manifest')) manifestFiles.push(file);
      else if (file.endsWith('.st')) stFiles.push(file);
    });

    const conflicts = [];
    [...luaFiles, ...stFiles].forEach(file => {
      if (fs.existsSync(path.join(pluginPath, file))) conflicts.push(file);
    });
    manifestFiles.forEach(file => {
      if (fs.existsSync(path.join(depotPath, file))) conflicts.push(file);
    });

    let overwrite = true;
    if (conflicts.length > 0) {
      const response = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Yes', 'No'],
        defaultId: 0,
        cancelId: 1,
        title: 'File Conflict',
        message: `${conflicts.length} file(s) already exist in Steam directories.\nDo you want to replace them?`
      });
      overwrite = response.response === 0;
    }

    let luaMoved = 0, manifestMoved = 0, stMoved = 0;

    for (const file of [...luaFiles, ...stFiles]) {
      const from = path.join(selectedDir, file);
      const to = path.join(pluginPath, file);
      if (!fs.existsSync(to) || overwrite) {
        fs.renameSync(from, to);
        file.endsWith('.lua') ? luaMoved++ : stMoved++;
      }
    }

    for (const file of manifestFiles) {
      const from = path.join(selectedDir, file);
      const to = path.join(depotPath, file);
      if (!fs.existsSync(to) || overwrite) {
        fs.renameSync(from, to);
        manifestMoved++;
      }
    }

    await dialog.showMessageBox({
      type: 'info',
      title: 'Done',
      message:
        `Imported:\n` +
        `• ${luaMoved} lua file(s)\n` +
        `• ${manifestMoved} manifest file(s)\n` +
        `• ${stMoved} .st file(s)\n\n` +
        `The app is still running in the background. Use the tray icon for more operations. (You need to restart Steam for effects)`
    });
  } catch (err) {
    if (err.message.startsWith('Steam directory not configured')) {
      dialog.showErrorBox('Configuration Error', err.message);
      app.quit();
    } else {
      console.error(err);
      dialog.showErrorBox('Unexpected Error', err.message || String(err));
    }
  }
}

// Create the tray icon and its menu
function createTray() {
  let trayIcon;
  if (fs.existsSync(iconFile)) {
    trayIcon = nativeImage.createFromPath(iconFile);
  } else {
    // Fallback: use executable’s icon directly
    trayIcon = nativeImage.createFromPath(process.execPath);
  }

  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Use', click: runImport },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('SteamGameImporter');
  tray.setContextMenu(contextMenu);
}

// Application entry
app.whenReady().then(async () => {
  const steamDir = await getValidSteamFolder();
  if (!steamDir) return; // app.quit already called if invalid

  await extractIconIfNeeded();
  createTray();

  // Inform user that app is now in tray
  dialog.showMessageBox({
    type: 'info',
    title: 'Ready',
    message: 'SteamGameImporter is now running in the background.\nRight-click the tray icon and select "Use" to Import your game.'
  });
}).catch(err => {
  console.error('App failed to start:', err);
  app.quit();
});

// Do not quit when all windows are closed (we have no windows)
app.on('window-all-closed', e => {
  e.preventDefault();
});
