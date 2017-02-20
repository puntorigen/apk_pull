Helper to extract any given apk app from any connected device or running Genymotion Player
==============================
## INTRO

This command-line (CLI) helps you recover any given APK from any connected Android device. It can also be a running Genymotion Player.<br/><br/>
Just give it the name of the app and it will extract it to the current directory. If no name is given, it will show you a menu with the available apps to select the one you wish. 

## Installation
```javascript
npm install apk_pull -g
```

## Usage
You can use the CLI as follows:  

```javascript
apk_pull appname/appid
```

## UPDATES

version 1.1.6:
- added usage of adb pull when posible.
- filtered packages for 3rd party apps.

version 1.1.5:
- added no apps detected recognition message.

version 1.1.3:
- now 'exit' cmd works, and added aditional packages to omit.

version 1.1.2:
- updated included ADB to newest version

version 1.1.1:
- small bugfix

version 1.0.8:
- appname/id match is now case insensitive
- fixed apk resulting filename.

version 1.0.3-5: 
- cleaned daemon from app choices.
- small bugfix
- added appname/id not found message.

version 1.0.2: 
- fixed bin location when in global mode.

version 1.0.0: 
- first beta version, Mac/Linux compatible.
- Add readme.md file