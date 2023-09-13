# InstaCat

## Table of Contents
1. [General Info]
2. [Technologies]
3. [Installation]
4. [User Guidebook]

### General Info
***
Die Progressive Web Application InstaCat ist im Rahmen des Moduls "Aktuelle Trends der IKT" des Studiengangs Informatik und Wirtschaft der HTW Berlin entstanden und beruht auf zur Verfügung gestellten Code.

### Technologies
***
* MongoDB
* Express.js
* Node.js

### Installation
***
#### Backend
##### start the nodejs server for development
```
$ cd backend
$ npm i
$ npm run watch
```
##### start the nodejs server to expose the Api
```
$ cd backend
$ npm i
$ npm start
```

#### Frontend
##### start the frontend
```
$ cd frontend
$ npm i
$ ng serve
```
##### Stop the server
```
$ press ctrl+c
```
***
## User Guidebook

Die PWA InstaCat dient der Ergänzung der im Modul "Web-Technologien" entwickelten Webanwendung "CatJournal". Mittels der PWA sollen Fotos der Katzen aufgenommen und hochgeladen werden können.  
Hierzu ist eine Kameraeinbindung erfolgt und der eigene Standort kann abgerufen werden, um einfacher die Location des aufgenommenen Fotos zu verwenden.  
Über den `+` Button kann ein neuer Eintrag erfolgen. Hier kann dann ein Titel vergeben werden und der Standort eingegeben, oder über die Leolocation bestimmt werden. Zudem besteht die Auswahl zwischen einem Foto aufnehmen und ein bestehendes Bild vom Smartphone oder Rechner hochladen.  
Mittels Push-Notifications kann darüber informiert werden, wenn ein neuer Eintrag erfolgt ist. Die PWA ist zudem installierbar und auch teilweise offline nutzbar.
