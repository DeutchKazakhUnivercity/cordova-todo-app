Cordova ToDo List application
===================================

# Prerequiresites
In order to develop this application you should have following software installed on your PC.

- Node.JS >= 0.10 (http://nodejs.org)
- Bower (http://bower.io/)
- Apache Cordova (http://cordova.io) 

## Webdev setup

After the installing the Node JS, you could use following commands to install prerequiresites.
You have to run these commands from the your terminal (CMD or Powershell from Windows, from Terminal on Mac, or from Bash on Linux)


    npm -g install bower
    npm -g install
    
After the prerequiresites installed, project dependencies has to initialized. Run commands below in the terminal from the project root.

    npm install
    
Also from `www` folder run command:

    bower install
    
Bower will install frontend dependencies for the project.

## Cordova setup
Reinitialize Cordova platform and plugins

    cordova prepare browser
    cordova prepare android

