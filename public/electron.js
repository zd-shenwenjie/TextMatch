const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const xlsx = require("xlsx");
// const fs = require('fs-extra');
const Store = require('electron-store');
const store = new Store();
let mainWindow

function createWindow() {
    Menu.setApplicationMenu(null);
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        resizable: true,
        webPreferences: {
            javascript: true,
            plugins: true,
            nodeIntegration: true,
            preload: __dirname + '/preload.js'
        }
    })

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000/')
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(path.join(__dirname, '/../build/index.html'))
    }

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})

ipcMain.on('load', function (event) {
    // const dirPath = path.join(__dirname, '../static');
    // const filePath = path.join(dirPath, 'data.json');
    const storePath = app.getPath('userData');
    console.log(storePath)
    if (store.has('data')) {
        // const tmp = fs.readJSONSync(filePath).data;
        const tmp = store.get('data');
        event.reply('load-reply', { tmp, msg: `${storePath}` });
    }
})

ipcMain.on('import', function (event, importSheet, importKey, importValue) {
    dialog.showOpenDialog({
        filters: [{ name: 'Excel', extensions: ['xlsx', 'xls'] }],
        properties: ['openFile']
    }).then(result => {
        // console.log(result.canceled, result.filePaths, importSheet, importKey, importValue);
        if (result.filePaths[0]) {
            const workbook = xlsx.readFile(result.filePaths[0]);
            // workbook.SheetNames.forEach(function (sheetName) {
            //     var worksheet = workbook.Sheets[sheetName];
            //     data[sheetName] = xlsx.utils.sheet_to_json(worksheet);
            // });
            if (workbook && workbook.Sheets[importSheet]) {
                const worksheet = workbook.Sheets[importSheet];
                const arr = xlsx.utils.sheet_to_json(worksheet);
                if (arr) {
                    const tmp = []
                    for (let i = 0; i < arr.length; i++) {
                        const o = arr[i];
                        const key = i;
                        const k = o[importKey];
                        const v = o[importValue] ? o[importValue] : '';
                        console.log(key, k, v);
                        tmp.push({ key, k, v });
                    }
                    store.set({ data: tmp });
                    // const dirPath = path.join(__dirname, '../static');
                    // fs.ensureDirSync(dirPath);
                    // const filePath = path.join(dirPath, 'data.json');
                    // fs.ensureFileSync(filePath);
                    // fs.writeJSONSync(filePath, { data: tmp });
                    event.reply('import-reply', tmp);
                } else {
                    event.reply('import-reply', null);
                }
            } else {
                event.reply('import-reply', null);
            }
        }
    }).catch(err => {
        console.log(err)
        event.reply('import-reply', null);
    })
})