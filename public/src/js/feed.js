const DOMSelectors = {
  shareImageButton: "#share-image-button",
  createPostArea: "#create-post",
  closeCreatePostModalButton: "#close-create-post-modal-btn",
  sharedMomentsArea: "#shared-moments",
  form: "form",
  titleInput: "#title",
  txtInput: "#text",
  locationInput: "#location",
  videoPlayer: "#player",
  canvasElement: "#canvas",
  captureButton: "#capture-btn",
  imagePicker: "#image-picker",
  imagePickerArea: "#pick-image",
  locationButton: "#location-btn",
  locationLoader: "#location-loader",
  mapDiv: ".map",
};

const state = {
  fetchedLocation: null,
  file: null,
  titleValue: "",
  locationValue: "",
  txtValue: "",
  imageURI: "",
};

async function fetchLocationName(latitude, longitude) {
  const nominatimURL = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
  const res = await fetch(nominatimURL);
  const data = await res.json();
  return data.display_name;
}

async function getUserMedia(constraints) {
  return await navigator.mediaDevices.getUserMedia(constraints);
}

// Nutzen der Geolocation (automatisches Hinzufügen der Location)
locationButton.addEventListener("click", (event) => {
  if (!("geolocation" in navigator)) {
    return;
  }

  locationButton.style.display = "none";
  locationLoader.style.display = "block";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      locationButton.style.display = "inline";
      locationLoader.style.display = "none";
      fetchedLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      console.log("current position: ", fetchedLocation);

      let nominatimURL = "https://nominatim.openstreetmap.org/reverse";
      nominatimURL += "?format=jsonv2"; // format=[xml|json|jsonv2|geojson|geocodejson]
      nominatimURL += "&lat=" + fetchedLocation.latitude;
      nominatimURL += "&lon=" + fetchedLocation.longitude;

      fetch(nominatimURL)
        .then((res) => {
          console.log("nominatim res ...", res);
          return res.json();
        })
        .then((data) => {
          console.log("nominatim res.json() ...", data);
          locationInput.value = data.display_name;
          return data;
        })
        .then((d) => {
          locationButton.style.display = "none";
          locationLoader.style.display = "none";
          mapDiv.style.display = "block";

          const map = new ol.Map({
            target: "map",
            layers: [
              new ol.layer.Tile({
                source: new ol.source.OSM(),
              }),
            ],
            view: new ol.View({
              center: ol.proj.fromLonLat([
                fetchedLocation.longitude,
                fetchedLocation.latitude,
              ]),
              zoom: 12,
            }),
          });

          const layer = new ol.layer.Vector({
            source: new ol.source.Vector({
              features: [
                new ol.Feature({
                  geometry: new ol.geom.Point(
                    ol.proj.fromLonLat([
                      fetchedLocation.longitude,
                      fetchedLocation.latitude,
                    ])
                  ),
                }),
              ],
            }),
          });

          map.addLayer(layer);

          console.log("map", map);
        })
        .catch((err) => {
          console.error("err", err);
          locationInput.value = "In Berlin";
        });

      document.querySelector("#manual-location").classList.add("is-focused");
    },
    (err) => {
      console.log(err);
      locationButton.style.display = "inline";
      locationLoader.style.display = "none";
      alert("Couldn't fetch location, please enter manually!");
      fetchedLocation = null;
    },
    { timeout: 5000 }
  );
});

function initializeLocation() {
  if (!("geolocation" in navigator)) {
    locationButton.style.display = "none";
  }
}

function initializeMedia() {
  if (!("mediaDevices" in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!("getUserMedia" in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      let getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error("getUserMedia is not implemented"));
      }

      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = "block";
    })
    .catch((err) => {
      imagePickerArea.style.display = "block";
    });
}

// Formular zum Erstellen einer neuen Karte
function openCreatePostModal() {
  setTimeout(() => {
    createPostArea.style.transform = "translateY(0)";
  }, 1);
  initializeMedia();
  initializeLocation();
}

// Schließen des Formulares zur Erstellung einer neuen Karte
function closeCreatePostModal() {
  imagePickerArea.style.display = "none";
  videoPlayer.style.display = "none";
  canvasElement.style.display = "none";
  locationButton.style.display = "inline";
  locationLoader.style.display = "none";
  if (videoPlayer.srcObject) {
    videoPlayer.srcObject.getVideoTracks().forEach((track) => track.stop());
  }
  setTimeout(() => {
    createPostArea.style.transform = "translateY(100vH)";
  }, 1);
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

// Funktion zur Erstellung einer neuen Karte
function createCard(card) {
  let cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  let cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  let image = new Image();
  image.src = card.image_id;
  cardTitle.style.backgroundImage = "url(" + image.src + ")";
  cardTitle.style.backgroundSize = "contain";
  cardTitle.style.backgroundRepeat = "no-repeat";
  cardTitle.style.backgroundPosition = "center";
  cardTitle.style.backgroundColor = "#FBF4ED";

  cardWrapper.appendChild(cardTitle);
  let cardTitleTextElement = document.createElement("div");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = card.title;
  cardTitleTextElement.classList.add("blackText");
  cardTitleTextElement.style.alignSelf = "center";
  cardWrapper.appendChild(cardTitleTextElement);
  let cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = card.location;
  cardSupportingText.style.textAlign = "center";
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

fetch("http://localhost:8000/posts")
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    console.log("From backend ...", data);
    updateUI(data);
  })
  .catch((err) => {
    if ("indexedDB" in window) {
      readAllData("posts").then((data) => {
        console.log("From cache ...", data);
        updateUI(data);
      });
    }
  });

async function updateUI() {
  try {
    const res = await fetch("http://localhost:8000/posts");
    const data = await res.json();
    for (let card of data) {
      createCard(card);
    }
  } catch (err) {
    console.log("Error updating UI", err);
  }
}

// Daten an das Backend senden
function sendDataToBackend() {
  const formData = new FormData();
  formData.append("title", titleValue);
  formData.append("location", locationValue);
  formData.append("file", file);
  formData.append("txt", txtValue);

  for (var pair of formData.entries()) {
    console.log(pair[0] + ", " + pair[1]);
  }

  fetch("http://localhost:8000/posts", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      console.log("Data sent to backend ...", response);
      return response.json();
    })
    .then((data) => {
      console.log("data ...", data);
      const newPost = {
        title: data.title,
        location: data.location,
        image_id: imageURI,
        txt: data.txt,
      };
      updateUI([newPost]);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  // Dynamically assign DOM selectors to window object for easier reference
  Object.keys(DOMSelectors).forEach((key) => {
    window[key] = document.querySelector(DOMSelectors[key]);
  });

  // Handle image picking
  imagePicker.addEventListener("change", (event) => {
    state.file = event.target.files[0];
  });

  // Handle clicking the location button
  locationButton.addEventListener("click", async () => {
    if (!("geolocation" in navigator)) {
      // Geolocation API not supported
      return;
    }

    locationButton.style.display = "none";
    locationLoader.style.display = "block";

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
        });
      });

      const { latitude, longitude } = position.coords;
      const locationName = await fetchLocationName(latitude, longitude);

      locationInput.value = locationName;
      state.fetchedLocation = { latitude, longitude };
    } catch (err) {
      console.error("Could not fetch location:", err);
    } finally {
      locationButton.style.display = "block";
      locationLoader.style.display = "none";
    }
  });

  // Handle form submission
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Capture form data into the state object
    state.titleValue = titleInput.value;
    state.locationValue = locationInput.value;
    state.txtValue = txtInput.value;
    // Assuming that `state.file` and `state.imageURI` are populated elsewhere

    // Now send this data to the backend
    await sendDataToBackend(state);

    // Clear the form and state
    form.reset();
    for (let key in state) {
      state[key] = null;
    }

    // Update the UI
    await updateUI();
  });

  // Initialize the UI
  updateUI();
});
