Cordova ToDo List application
===================================

# Prerequiresites
In order to develop this application you should have following software installed on your PC.

- Node.JS >= 0.10 (http://nodejs.org)
- Bower (http://bower.io/)
- Gulp (http://gulpjs.com)
- Apache Cordova (http://cordova.io) 
- GitHub for Windows (https://windows.github.com/) (Only Windows users)

Please make sure that you have account on GitHub.

## Clone source code

Clone source code repository following directions from https://help.github.com/articles/adding-repositories-with-github-for-windows/
Or from Git Shell run 

    git clone https://github.com/DeutchKazakhUnivercity/cordova-todo-app
    
That will create sub-folder `cordova-todo-app` with all source code. That folder would be later called the project root.

## Webdev setup

After the installing the Node JS, you could use following commands to install prerequiresites.
You have to run these commands from the your terminal (CMD or Powershell from Windows, from Terminal on Mac, or from Bash on Linux)

    npm -g install bower
    npm -g install cordova
    npm -g install gulp
    
After the prerequiresites installed, project dependencies has to initialized. Run commands below in the terminal from the project root.
The installation process is slightly different for the users who has different version of Visual Studio installed.

### For VS2013 user 
    npm install --msvs_version=2013
    
### No Visual Studio or earlier version then VS2013
Go ahead and install VS2013 Community Edition for free from https://www.visualstudio.com/en-us/products/visual-studio-community-vs.aspx
    
Also from `www` folder run command:

    cd www
    bower install
    cd ..
    
Bower will install frontend dependencies for the project.

## Cordova setup

For the first time Cordova setup please refer to the official Cordova docs.
Link for the Android: http://cordova.apache.org/docs/en/4.0.0/guide_platforms_android_index.md.html

Re-initialize Cordova platform and plugins

    cordova prepare browser
    cordova prepare android

## Develop application
To run application in the browser, for faster development run following commands from the project root.

    gulp serve

That will open your default browser with the application running. You could use F12 key to open 
developer tools for your browser. This shortcut is definitely working for the Chrome, IE and FF.

All application files located in the `www` folder. This folder is embedded in the native application when you build it.

## Build native application

### Android 
Run application on Android phone attached to your PC/Mac:

    cordova run android --device
    
Run application in Android emulator.

    cordova run android --emulator
    
**Note**: you have to configure Android emulator first, before using it.
    
## Testing application
All application tests could be run as individual pages from the browser.
you could open for example page [http://localhost:3000/tests/todo-app.html](http://localhost:3000/tests/todo-app.html) to run Application tests suite.
You may need to change port, depending on which port your application will run in the browser.