let enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
            console.log('service worker registriert')
        })
        .catch(
            err => { console.log(err); }
        );
}
function displayConfirmNotification() {
    if('serviceWorker' in navigator) {
        let options = {
        body: 'You successfully subscribed to our Notification service!',
        icon: '/src/images/icons/fiw96x96.png',             //mosquito ersetzen!!!
        image: '/src/images/htw-sm.jpg',
        lang: 'de-DE',
        vibrate: [100, 50, 200],
        badge: '/src/images/icons/fiw96x96.png',
        tag: 'confirm-notification',
        renotify: true,
        actions: [
            { action: 'confirm', title: 'Ok', icon: '/src/images/icons/fiw96x96.png' },
            { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/fiw96x96.png' },
        ]};

        navigator.serviceWorker.ready
            .then( sw => {
                sw.showNotification('Successfully subscribed (from SW)!', options);
            });
    }}

function askForNotificationPermission() {
    Notification.requestPermission( result => {
        console.log('User choice', result);
        if(result !== 'granted') {
            console.log('No notification permission granted');
        } else {
            //displayConfirmNotification();        
            configurePushSubscription();
            
            for(let button of enableNotificationsButtons) {
                button.style.display = 'none';
            }
        }
    });
}

if('Notification' in window && 'serviceWorker' in navigator) {
    for(let button of enableNotificationsButtons) {
        button.style.display = 'inline-block';
        button.addEventListener('click', askForNotificationPermission);
    }
}

function configurePushSubscription() {
    if(!('serviceWorker' in navigator)) {
        return
    }
    let swReg;
    navigator.serviceWorker.ready
        .then( sw => {
            swReg = sw;
            return sw.pushManager.getSubscription();
        })
        .then( sub => {
            if(sub === null) {
                // create a new subscription
                let vapidPublicKey = 'BKqjdfy1FfKWsxwnki4wJKOtGZy1JeX-Tb04x0HudiKzStK5k8XTrr2FvuZcjGCE1-1E2SbDE5ZfFL3oCafQqzA';
                let convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
                return swReg.pushManager.subscribe({
                   userVisibleOnly: true,
                   applicationServerKey: convertedVapidPublicKey,
                });
            } else {
                // already subscribed
                sub.unsubscribe()
                .then( () => {
                    console.log('unsubscribed()', sub)
                })
            }
        })
        .then( newSub => {
            return fetch('http://localhost:8000/subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newSub)
            })
            .then( response => {
                if(response.ok) {
                    displayConfirmNotification();
                }
            })
        });
}

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}