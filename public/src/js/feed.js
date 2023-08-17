let shareImageButton = document.querySelector('#share-image-button');
let createPostArea = document.querySelector('#create-post');
let closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
let sharedMomentsArea = document.querySelector('#shared-moments');
let imagePicker = document.querySelector('#image-picker');
let imagePickerArea = document.querySelector('#pick-image');
let form = document.querySelector('form');
let titleInput = document.querySelector('#title');
let locationInput = document.querySelector('#location');
let textInput = document.querySelector('#text'); // Eingabe im Create-Post für Text
let file = null;
let titleValue = '';
let locationValue = '';
let imageURI = '';
let videoPlayer = document.querySelector('#player');//kamera zugriff
let canvasElement = document.querySelector('#canvas');
let captureButton = document.querySelector('#capture-btn');

// im Fall, dass der Browser kein getUserMedia unterstützt (keine Kamera)
function initializeMedia() {
  if(!('mediaDevices' in navigator)) {
      navigator.mediaDevices = {};
  }

  if(!('getUserMedia' in navigator.mediaDevices)) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
          let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

          if(!getUserMedia) {
              return Promise.reject(new Error('getUserMedia is not implemented'));
          }

          return new Promise( (resolve, reject) => {
              getUserMedia.call(navigator, constraints, resolve, reject);
          })
      }
  }

  navigator.mediaDevices.getUserMedia({video: true})
        .then( stream => {
            videoPlayer.srcObject = stream;
            videoPlayer.style.display = 'block';
        })
        .catch( err => {
            imagePickerArea.style.display = 'block';
        });
}


function openCreatePostModal() {
  document.querySelector("#text").value = "";
  document.querySelector("#title").value = "";
  document.querySelector("#location").value = "";
  document.querySelector("#image-picker").value = "";
  setTimeout( () => { // Schließen des Post fließend
    createPostArea.style.transform = 'translateY(0)';
}, 1);
  initializeMedia(); // Abfrage für die Kamera 
  initializeLocation(); // Abfrage für den Standort 
}

function closeCreatePostModal() {
  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvasElement.style.display = 'none';
  if(videoPlayer.srcObject) {
      videoPlayer.srcObject.getVideoTracks().forEach( track => track.stop());
  }
  setTimeout( () => {
      createPostArea.style.transform = 'translateY(100vH)';
  }, 1);
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function createCard(card) {
  let clone = cardTemplate.content.cloneNode(true);
  clone.querySelector('.template-title').textContent=card.title;
  clone.querySelector('.template-location').textContent=card.location;
  clone.querySelector('.template-text').textContent=card.text;
  let cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  let cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  //cardTitle.style.backgroundImage = 'url("/src/images/htw-gebaeude-h.jpg")';
  let image = new Image();
  image.src = card.image_id;
  cardTitle.style.backgroundImage = 'url('+ image.src +')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  let cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = card.title;
  cardTitle.appendChild(cardTitleTextElement);
  let cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.style.textAlign = 'center';
  cardSupportingText.textContent = card.location;
  cardWrapper.appendChild(cardSupportingText);
  //componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
  //let file = null;
}


let networkDataReceived = false;

fetch('http://localhost:8000/posts')
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      networkDataReceived = true;
      console.log('From backend ...', data);
      updateUI(data);
    });

    if('indexedDB' in window) {
      readAllData('posts')
          .then( data => {
              if(!networkDataReceived) {
                  console.log('From cache ...', data);
                  updateUI(data);
              }
          })
  }



//----------------- Submitting-----------------// 
  form.addEventListener('submit', event => {
    event.preventDefault(); // nicht absenden und neu laden

    if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
        alert('Bitte Titel und Location angeben!')
        return;
    }

    closeCreatePostModal();
});
form.addEventListener('submit', event => {
  event.preventDefault(); // nicht absenden und neu laden

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
      alert('Bitte Titel und Location angeben!')
      return;
  }

  closeCreatePostModal();
});

// Image Picker to Bakcned
function sendDataToBackend() {
  const formData = new FormData();
  formData.append('title', titleValue);
  formData.append('location', locationValue);
  formData.append('file', file);
  formData.append('text', textValue);

  console.log('formData', formData)

  fetch('http://localhost:8080/posts', {
      method: 'POST',
      body: formData
  })
  .then( response => {
      console.log('Data sent to backend ...', response);
      return response.json();
  })
  .then( data => {
      console.log('data ...', data);
      const newPost = {
          title: data.title,
          location: data.location,
          image_id: imageURI
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
  titleValue = titleInput.value; 
  locationValue = locationInput.value;
  textValue = textInput.value;
  console.log('titleInput', titleValue)
  console.log('locationInput', locationValue)
  console.log('textInput', textValue)
  console.log('file', file)

  sendDataToBackend();
});

 // Click Ereignis auf den Button
 
 captureButton.addEventListener('click', event => {
  event.preventDefault(); // nicht absenden und neu laden
  canvasElement.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';
  let context = canvasElement.getContext('2d');
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
  videoPlayer.srcObject.getVideoTracks().forEach( track => {
      track.stop();
  })
  imageURI = canvas.toDataURL("image/jpeg");
  // console.log('imageURI', imageURI)       // base64-String des Bildes

  fetch(imageURI)
  .then(res => {
      return res.blob()
  })
  .then(blob => {
      file = new File([blob], "myFile.jpeg", { type: "image/jpeg" })
      console.log('file', file)
  })
});

imagePicker.addEventListener('change', event => {
  file = event.target.files[0];
});
