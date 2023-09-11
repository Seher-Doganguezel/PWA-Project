let shareImageButton = document.querySelector('#share-image-button');
let createPostArea = document.querySelector('#create-post');
let closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
let sharedMomentsArea = document.querySelector('#shared-moments');
let form = document.querySelector('form');
let titleInput = document.querySelector('#title');
let txtInput = document.querySelector('#text');
let locationInput = document.querySelector('#location');
let videoPlayer = document.querySelector('#player');
let canvasElement = document.querySelector('#canvas');
let captureButton = document.querySelector('#capture-btn');
let imagePicker = document.querySelector('#image-picker');
let imagePickerArea = document.querySelector('#pick-image');
let file = null;
let titleValue = '';
let locationValue = '';
let imageURI = '';
let txtValue = '';
let locationButton = document.querySelector('#location-btn');
let locationLoader = document.querySelector('#location-loader');
let fetchedLocation;
let mapDiv = document.querySelector('.map');

// Nutzen der Geolocation (automatisches Hinzufügen der Location)
locationButton.addEventListener('click', event => {
    if (!('geolocation' in navigator)) {
        return;
    }

    locationButton.style.display = 'none';
    locationLoader.style.display = 'block';

    navigator.geolocation.getCurrentPosition(position => {
        locationButton.style.display = 'inline';
        locationLoader.style.display = 'none';
        fetchedLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        console.log('current position: ', fetchedLocation);

        let nominatimURL = 'https://nominatim.openstreetmap.org/reverse';
        nominatimURL += '?format=jsonv2';   // format=[xml|json|jsonv2|geojson|geocodejson]
        nominatimURL += '&lat=' + fetchedLocation.latitude;
        nominatimURL += '&lon=' + fetchedLocation.longitude;

        fetch(nominatimURL)
            .then((res) => {
                console.log('nominatim res ...', res);
                return res.json();
            })
            .then((data) => {
                console.log('nominatim res.json() ...', data);
                locationInput.value = data.display_name;
                return data;
            })
            .then(d => {
                locationButton.style.display = 'none';
                locationLoader.style.display = 'none';
                mapDiv.style.display = 'block';

                const map = new ol.Map({
                    target: 'map',
                    layers: [
                        new ol.layer.Tile({
                            source: new ol.source.OSM()
                        })
                    ],
                    view: new ol.View({
                        center: ol.proj.fromLonLat([fetchedLocation.longitude, fetchedLocation.latitude]),
                        zoom: 12
                    })
                });

                const layer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: [
                            new ol.Feature({
                                geometry: new ol.geom.Point(ol.proj.fromLonLat([fetchedLocation.longitude, fetchedLocation.latitude]))
                            })
                        ]
                    })
                });

                map.addLayer(layer);

                console.log('map', map)
            })
            .catch((err) => {
                console.error('err', err)
                locationInput.value = 'In Berlin';
            });

        document.querySelector('#manual-location').classList.add('is-focused');

    }, err => {
        console.log(err);
        locationButton.style.display = 'inline';
        locationLoader.style.display = 'none';
        alert('Couldn\'t fetch location, please enter manually!');
        fetchedLocation = null;
    }, { timeout: 5000 });
});

function initializeLocation() {
    if (!('geolocation' in navigator)) {
        locationButton.style.display = 'none';
    }
}

function initializeMedia() {
    if (!('mediaDevices' in navigator)) {
        navigator.mediaDevices = {};
    }

    if (!('getUserMedia' in navigator.mediaDevices)) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
            let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented'));
            }

            return new Promise((resolve, reject) => {
                getUserMedia.call(navigator, constraints, resolve, reject);
            })
        }
    }

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            videoPlayer.srcObject = stream;
            videoPlayer.style.display = 'block';
        })
        .catch(err => {
            imagePickerArea.style.display = 'block';
        });
}

// Formular zum Erstellen einer neuen Karte
function openCreatePostModal() {
    setTimeout(() => {
        createPostArea.style.transform = 'translateY(0)';
    }, 1);
    initializeMedia();
    initializeLocation();
}

// Schließen des Formulares zur Erstellung einer neuen Karte
function closeCreatePostModal() {
    imagePickerArea.style.display = 'none';
    videoPlayer.style.display = 'none';
    canvasElement.style.display = 'none';
    locationButton.style.display = 'inline';
    locationLoader.style.display = 'none';
    if (videoPlayer.srcObject) {
        videoPlayer.srcObject.getVideoTracks().forEach(track => track.stop());
    }
    setTimeout(() => {
        createPostArea.style.transform = 'translateY(100vH)';
    }, 1);
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// Funktion zur Erstellung einer neuen Karte
function createCard(card) {
    let cardWrapper = document.createElement('div');
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
    let cardTitle = document.createElement('div');
    cardTitle.className = 'mdl-card__title';
    let image = new Image();
    image.src = card.image_id;
    cardTitle.style.backgroundImage = 'url(' + image.src + ')';
    cardTitle.style.backgroundSize = 'contain';
    cardTitle.style.backgroundRepeat = 'no-repeat';
    cardTitle.style.backgroundPosition = 'center';
    cardTitle.style.backgroundColor = '#FBF4ED'

    cardWrapper.appendChild(cardTitle);
    let cardTitleTextElement = document.createElement('div');
    cardTitleTextElement.className = 'mdl-card__title-text';
    cardTitleTextElement.textContent = card.title;
    cardTitleTextElement.classList.add('blackText');
    cardTitleTextElement.style.alignSelf = 'center';
    cardWrapper.appendChild(cardTitleTextElement);
    let cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.textContent = card.location;
    cardSupportingText.style.textAlign = 'center';
    cardWrapper.appendChild(cardSupportingText);
    componentHandler.upgradeElement(cardWrapper);
    sharedMomentsArea.appendChild(cardWrapper);
}



fetch('http://localhost:8000/posts')
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        console.log('From backend ...', data);
        updateUI(data);
    })
    .catch( (err) => {
        if('indexedDB' in window) {
            readAllData('posts')
                .then( data => {
                    console.log('From cache ...', data);
                    updateUI(data);
                })
        }
    });

// Karte für jeden Datensatz
function updateUI(data) {
    for (let card of data) {
        createCard(card);
    }
}

// Daten an das Backend senden
function sendDataToBackend() {
    const formData = new FormData();
    formData.append('title', titleValue);
    formData.append('location', locationValue);
    formData.append('file', file);
    formData.append('txt', txtValue);

    for (var pair of formData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
    }

    fetch('http://localhost:8000/posts', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            console.log('Data sent to backend ...', response);
            return response.json();
        })
        .then(data => {
            console.log('data ...', data);
            const newPost = {
                title: data.title,
                location: data.location,
                image_id: imageURI,
                txt: data.txt
            }
            updateUI([newPost]);
        });
}


form.addEventListener('submit', event => {
    event.preventDefault(); // nicht absenden und neu laden

    if (file == null) {
        alert('Erst Foto aufnehmen!')
        return;
    }
    if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
        alert('Bitte Titel und Location angeben!')
        return;
    }


    closeCreatePostModal();

    titleValue = titleInput.value;
    locationValue = locationInput.value;
    txtValue = txtInput.value;

    console.log('titleInput', titleValue)
    console.log('locationInput', locationValue)
    console.log('txtInput', txtValue)

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        console.log("test");
        if (!navigator.onLine) {
            navigator.serviceWorker.ready
                .then(sw => {
                    let post = {
                        id: new Date().toISOString(),
                        title: titleValue,
                        location: locationValue,
                        image_id: file,
                        txt: txtValue      // file durch den Foto-Button belegt
                    };
                    console.log("post",post);
                    writeData('sync-posts', post)
                        .then(() => {
                            return sw.sync.register('sync-new-post');
                        })
                        .then(() => {
                            let snackbarContainer = new MaterialSnackbar(document.querySelector('#confirmation-toast'));
                            let data = {message: 'Eingaben zum Synchronisieren gespeichert!', timeout: 2000};
                            snackbarContainer.showSnackbar(data);
                        });
                });
        } else {
            sendDataToBackend();
        }
    } else {  console.log("tes1t");
        sendDataToBackend();
    }
});

// Foto aufnehmen
captureButton.addEventListener('click', event => {
    event.preventDefault(); // nicht absenden und neu laden
    canvasElement.style.display = 'block';
    videoPlayer.style.display = 'none';
    captureButton.style.display = 'none';
    let context = canvasElement.getContext('2d');
    context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
    videoPlayer.srcObject.getVideoTracks().forEach(track => {
        track.stop();
    })
    imageURI = canvas.toDataURL("image/jpg");
    // console.log('imageURI', imageURI)       // base64-String des Bildes

    fetch(imageURI)
        .then(res => {
            return res.blob()
        })
        .then(blob => {
            file = new File([blob], "myFile.jpg", { type: "image/jpg" })
            console.log('file', file)
        })
});

// Foto hochladen
imagePicker.addEventListener('change', event => {
    file = event.target.files[0];
});