import {app,BrowserWindow} from 'electron';
import path from 'path';
import { Global } from './global';
import { test } from './modules/test';

function createWindow() {
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(Global.ROOT_FOLDER, 'preload.js')
        },
    })

    win.setMenuBarVisibility(false);

    if(app.isPackaged) {
        win.loadFile(path.join(Global.ROOT_FOLDER, 'index.html'));
    } else {
        win.loadURL('http://localhost:3000');
    }
}

app.whenReady().then(() => {

    createWindow();
    test();
    
    app.on('window-all-closed', () => {
        app.exit();
    })
})