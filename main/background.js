import { app, protocol, BrowserWindow, ipcMain, Menu, dialog } from "electron";
import axios from "axios";
import serve from "electron-serve";
import { createWindow } from "./helpers";
const fs = require("fs");
var path = require("path");
const dirTree = require("directory-tree");

const isProd = process.env.NODE_ENV === "production";
var hasBeenSet = false;
if (isProd) {
	serve({ directory: "app" });
} else {
	app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
	await app.whenReady();

	const mainWindow = createWindow("main", {
		width: 1500,
		height: 1000,
	});
	const template = [
		{
			label: "File",
			submenu: [
				{
					label: "New Experiment",
					click() {
						console.log("New expriment created")
					}
				},
				{
					label: "New Workspace",
					click() {
						console.log("New expriment created")
					}
				},
				{ type: "separator" },
				{
					label: "Open Experiment",
					click() {
						console.log("Open expriment")
					}
				},
				{
					label: "Open Workspace",
					click() {
						console.log("Workspace opened")
					}
				},
				{ type: "separator" },
				{ role: "quit" }
			]
		},
		{
			label: "Edit",
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" }
			]
		},
		{
			label: "Hello From Electron!",
			submenu: [
				{
					label: "I have a custom handler",
					click() {
						console.log("👋")
					}
				},
				{ type: "separator" },
				{ role: "reload" },
				{ role: "forcereload" },
				{ role: "toggledevtools" },
				{ type: "separator" },
				{ role: "resetzoom" },
				{ role: "zoomin" },
				{ role: "zoomout" },
				{ type: "separator" }
			]
		}
	]



	ipcMain.handle("request", async (_, axios_request) => {
		const result = await axios(axios_request)
		return { data: result.data, status: result.status }
	})

	ipcMain.on("messageFromNext", (event, data) => {
		console.log("messageFromNext : ", data);
		if (data === "requestDialogFolder") {
			setWorkingDirectory(event, mainWindow);
		}
		else if (data === "requestWorkingDirectory") {
			event.reply("messageFromElectron", { "workingDirectory": dirTree(app.getPath('sessionData')), "hasBeenSet": hasBeenSet });
			event.reply("workingDirectorySet", { "workingDirectory": dirTree(app.getPath('sessionData')), "hasBeenSet": hasBeenSet });
		}
		else if (data === "updateWorkingDirectory") {
			event.reply("updateDirectory", { "workingDirectory": dirTree(app.getPath('sessionData')), "hasBeenSet": hasBeenSet });
		}
		else if (data === "requestAppExit") {
			app.exit();
		}
	});


	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)

	if (isProd) {
		await mainWindow.loadURL("app://./index.html");
	} else {
		const port = process.argv[2];
		await mainWindow.loadURL(`http://localhost:${port}/`);
		mainWindow.webContents.openDevTools();
	}
})();


function setWorkingDirectory(event, mainWindow) {
	dialog.showOpenDialog(mainWindow, {
		properties: ['openDirectory']
	}).then(result => {
		if (result.canceled) {
			console.log('Dialog was canceled')
			event.reply("messageFromElectron", "Dialog was canceled");
		} else {
			const file = result.filePaths[0]
			console.log(file)
			if (file === app.getPath('sessionData')) {
				console.log('Working directory is already set to ' + file)
				event.reply("messageFromElectron", 'Working directory is already set to ' + file);
				event.reply("workingDirectorySet", { "workingDirectory": dirTree(file), "hasBeenSet": hasBeenSet });

			}
			else {
				console.log('Working directory set to ' + file)
				event.reply("messageFromElectron", 'Working directory set to ' + file);
				app.setPath('sessionData', file);
				createWorkingDirectory();
				hasBeenSet = true;
				event.reply("messageFromElectron", dirTree(file));
				event.reply("workingDirectorySet", { "workingDirectory": dirTree(file), "hasBeenSet": hasBeenSet });

				//   app.relaunch({ e})
				//   mainWindow.loadURL(`file://${file}`)
			}
		}
	}).catch(err => {
		console.log(err)
	})
}


function createWorkingDirectory() {
	createFolder("DATA");
	createFolder("EXPERIMENTS");
	createFolder("MODELS");
	createFolder("RESULTS");
}


function createFolder(folderString) {
	const folderPath = path.join(app.getPath('sessionData'), folderString);

	fs.mkdir(folderPath, { recursive: true }, (err) => {
		if (err) {
			console.error(err);
			return;
		}

		console.log('Folder created successfully!');
	});
}


function getTheWorkingDirectoryStructure() {
	const dirTree = require("directory-tree");
	const tree = dirTree(getWorkingDirectory());
	return tree;
}

function getWorkingDirectory() {
	return app.getPath('sessionData');
}


// ipcMain.handle("request", async (_, axios_request) => {
// 	const result = await axios(axios_request)
// 	return { data: result.data, status: result.status }
// })

app.on("window-all-closed", () => {
	app.quit();
});
