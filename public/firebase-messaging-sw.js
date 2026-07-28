importScripts(
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);


firebase.initializeApp({
    apiKey: "AIzaSyA-oP5hm_hVFd_lShfSAqSblkH5HVI4E3Q",
    authDomain: "navik-bro.firebaseapp.com",
    projectId: "navik-bro",
    storageBucket: "navik-bro.firebasestorage.app",
    messagingSenderId: "864304238896",
    appId: "1:864304238896:web:33728bfabaf5bcfc5f78f5",
    measurementId: "G-L0P830TCQJ"
});


const messaging =
    firebase.messaging();


messaging.onBackgroundMessage(
    function (payload) {

        console.log(
            "Background message received:",
            payload
        );


        const notificationTitle =
            payload.notification.title;


        const notificationOptions = {

            body:
                payload.notification.body,

            icon:
                "/icon.png",

        };


        self.registration.showNotification(
            notificationTitle,
            notificationOptions
        );

    }
);