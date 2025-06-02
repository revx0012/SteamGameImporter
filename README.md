# 🚀 SteamGameImporter

**SteamGameImporter** is an open-source alternative to *SteamTools*.  
It lets you add games to your Steam library using `.lua`, `.manifest`, or `.st` files — perfect for gamers or testing purposes.

> ⚠️ **This project is for educational use only.** We do **not condone piracy**, nor do we support bypassing any DRM or official restrictions.


## 📦 Features

- 🧠 Detects and remembers your Steam install directory
- 🧺 Supports `.lua`, `.manifest`, `.st` files
- 🖼️ Tray support after setup (first launch configures everything)
- 📁 Extracts icon + config to `%appdata%/SteamGameImporter`
- 💾 Fully portable — Can be used anywhere

---

## ✅ Pros

- 🔍 **100% Open Source** — Transparent and safe to audit
- 🧠 **Educational** — Understand how Steam game entries work
- 📦 **Portable** — Clean, simple, and runs locally
- 🛡️ **Safer than random Discord EXEs**

---

## ❌ Cons

- 📦 **Large EXE Size** (~100MB) due to Electron
- ⚙️ **Basic Tooling** — No advanced automation or integration
- ⛔ **No DRM bypass** — Games that need Steamworks/launchers won't function
- 📄 **No multiplayer spoofing or workshop injection**

---

## ⬇️ Download

You can download the latest pre-built portable EXE from the [Releases page](https://github.com/revx0012/SteamGameImporter/releases/).

Just grab the `.exe` for Windows and run it — no installation required.

---

## 📁 Where to Get `.lua`, `.manifest`, and `.st` Files

> ⚠️ Use **at your own risk**. These files simulate ownership and are **used for pirated games**. We do **not** recommend this — for educational purposes only.

| Source | Status | Notes |
|--------|--------|-------|
| [ntjq/ICB-Manifest](https://github.com/ntjq/ICB-Manifest) | ✅ Trustworthy | Clean and open-source |
| [cysaw.org](https://cysaw.org) | ⚠️ Okay | Owned by a known scammer |
| [@steam_tools Telegram](https://t.me/steam_tools) | ❌ Not recommended | May serve malicious `.exe` files |
| [SteamTools Discord](https://discord.gg/Z4bAPhqa4y) | ⚠️ Caution | Helpful but owned by cysaw; avoid purchases |
| [Alt Discord Server](https://discord.gg/WuYafUu5ZT) | ⚠️ Okay | Fine community, be wary of paid stuff |
| [DepotBox](https://depotbox.org/) | ⚠️ Could be trustworthy | I dont know much about it but it could be trustworthy? |

---

## ⚒️ Building the EXE (Windows Only)

> I already ran `npm init` and have a `package.json`. Run the following:

```bash
npm install
npm install -D electron-builder
npx electron-builder --win
````

### 🔧 To Use a Custom Icon:

1. Place `icon.ico` in your project root
2. Update `package.json` with:

```json
"build": {
  "win": {
    "icon": "icon.ico"
  }
}
```

✔️ The icon will be extracted at first run and used in the tray automatically. (I already added it, just update the path of the ico.)

---

## ▶️ Usage

1. **Run the EXE** — On first launch, it will prompt you to select your Steam installation folder.
2. The app will then import any `.lua`, `.manifest`, or `.st` files from the folder you choose.
3. After successful import, the app minimizes to the system tray.
4. **Right-click the tray icon** to:

   * Use the tool again (select a new folder to import files)
   * Exit the app
5. The app runs quietly in the background using minimal RAM.
6. **To delete the EXE**, first right-click the tray icon and choose *Exit*, then you can safely delete the EXE and the `%appdata%/SteamGameImporter` folder if you want a clean uninstall.

> ⚠️ The app is fully portable and does not require installation.

---

## 📢 Legal & Safety Notice

* ❗ **Do not blame us if you're banned** — You use this software entirely at your own risk.
* 🔐 This tool does **not** modify Steam or bypass DRM.
* 🧪 It’s made to help understand how Steam handles game entries.
* 🧼 The code is public and clean, but some antivirus software may report **false positives** because of the Electron build process.

---

## 🤔 Should You Use This?

* ✅ Use **SteamTools** if you trust it and it works.
* 🔐 If you’re unsure or want a transparent alternative, **SteamGameImporter** is open-source and safe.

---

## 📚 Wiki

Need help or ran into a bug?  
Check out the [Wiki](https://github.com/revx0012/SteamGameImporter/wiki) for fixes, explanations, and common issues.

---

## 📝 License

This project is released under the [MIT License](LICENSE).

---

## 👤 Author

Created by [revx0012](https://github.com/revx0012)

---
