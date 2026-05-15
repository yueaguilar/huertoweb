// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


// CONFIG FIREBASE

const firebaseConfig = {
    apiKey: "AIzaSyCRIBV5bPUN3cpyHd4oINpHeVxbloEgcZc",
    authDomain: "huerto-4a8f8.firebaseapp.com",
    projectId: "huerto-4a8f8",
    storageBucket: "huerto-4a8f8.firebasestorage.app",
    messagingSenderId: "982721744496",
    appId: "1:982721744496:web:d3d670ed580da7ec212eb5",
    measurementId: "G-HP5Q66K138"
};


// INICIALIZAR FIREBASE

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


// ELEMENTOS

const loginSection = document.getElementById("loginSection");
const dashboard = document.getElementById("dashboard");

const email = document.getElementById("email");
const password = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");

const plantForm = document.getElementById("plantForm");

const historyContainer = document.getElementById("historyContainer");

const searchPlant = document.getElementById("searchPlant");


// REGISTRO

registerBtn.addEventListener("click", async () => {

    try {

        await createUserWithEmailAndPassword(
            auth,
            email.value,
            password.value
        );

        alert("Cuenta creada correctamente");

    } catch (error) {

        alert(error.message);

    }

});


// LOGIN

loginBtn.addEventListener("click", async () => {

    try {

        await signInWithEmailAndPassword(
            auth,
            email.value,
            password.value
        );

    } catch (error) {

        alert(error.message);

    }

});


// LOGOUT

logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

});


// SESION

onAuthStateChanged(auth, (user) => {

    if (user) {

        loginSection.classList.add("hidden");
        dashboard.classList.remove("hidden");

        loadHistory();

    } else {

        loginSection.classList.remove("hidden");
        dashboard.classList.add("hidden");

    }

});


// GUARDAR REGISTRO

plantForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        const plantName = document.getElementById("plantName").value;
        const height = document.getElementById("height").value;
        const fertilizer = document.getElementById("fertilizer").value;
        const notes = document.getElementById("notes").value;

        const imageFile = document.getElementById("imageInput").files[0];

        let imageUrl = "";

        // SUBIR IMAGEN

        if (imageFile) {

            const imageRef = ref(
                storage,
                `plantas/${Date.now()}_${imageFile.name}`
            );

            await uploadBytes(imageRef, imageFile);

            imageUrl = await getDownloadURL(imageRef);

        }

        // GUARDAR EN FIRESTORE

        await addDoc(collection(db, "bitacora"), {

            userId: auth.currentUser.uid,
            plantName,
            height,
            fertilizer,
            notes,
            imageUrl,
            createdAt: new Date()

        });

        alert("Registro guardado");

        plantForm.reset();

        loadHistory();

    } catch (error) {

        alert(error.message);

    }

});


// CARGAR HISTORIAL

async function loadHistory(filter = "") {

    historyContainer.innerHTML = "";

    const q = query(
        collection(db, "bitacora"),
        where("userId", "==", auth.currentUser.uid)
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {

        const data = doc.data();

        // FILTRO

        if (
            data.plantName
            .toLowerCase()
            .includes(filter.toLowerCase())
        ) {

            historyContainer.innerHTML += `

                <div class="history-item">

                    <img src="${data.imageUrl}" alt="Planta">

                    <div class="history-content">

                        <h4>${data.plantName}</h4>

                        <p><strong>Altura:</strong> ${data.height} cm</p>

                        <p><strong>Abono:</strong> ${data.fertilizer}</p>

                        <p>${data.notes}</p>

                    </div>

                </div>

            `;
        }

    });

}


// FILTRO BUSQUEDA

searchPlant.addEventListener("input", (e) => {

    loadHistory(e.target.value);

});