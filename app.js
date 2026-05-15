// FIREBASE

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

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


// CONFIG

const firebaseConfig = {

    apiKey: "AIzaSyCRIBV5bPUN3cpyHd4oINpHeVxbloEgcZc",

    authDomain: "huerto-4a8f8.firebaseapp.com",

    projectId: "huerto-4a8f8",

    storageBucket: "huerto-4a8f8.firebasestorage.app",

    messagingSenderId: "982721744496",

    appId: "1:982721744496:web:d3d670ed580da7ec212eb5",

    measurementId: "G-HP5Q66K138"

};


// INICIALIZAR

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


// ELEMENTOS

const loginSection =
document.getElementById("loginSection");

const dashboard =
document.getElementById("dashboard");

const email =
document.getElementById("email");

const password =
document.getElementById("password");

const loginBtn =
document.getElementById("loginBtn");

const registerBtn =
document.getElementById("registerBtn");

const logoutBtn =
document.getElementById("logoutBtn");

const plantForm =
document.getElementById("plantForm");

const historyContainer =
document.getElementById("historyContainer");

const searchPlant =
document.getElementById("searchPlant");

const imageInput =
document.getElementById("imageInput");

const previewImage =
document.getElementById("previewImage");


// VISTA PREVIA IMAGEN

imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if(file){

        previewImage.src =
        URL.createObjectURL(file);

        previewImage.style.display =
        "block";

    }

});


// REGISTRO

registerBtn.addEventListener(
"click",
async () => {

    if(
        email.value === "" ||
        password.value === ""
    ){

        alert("Completa todos los campos");

        return;

    }

    try{

        await createUserWithEmailAndPassword(

            auth,
            email.value,
            password.value

        );

        alert("Cuenta creada correctamente");

    }
    catch(error){

        if(
            error.code ===
            "auth/email-already-in-use"
        ){

            alert(
                "Ese correo ya tiene una cuenta creada"
            );

        }
        else{

            alert(error.message);

        }

    }

});


// LOGIN

loginBtn.addEventListener(
"click",
async () => {

    if(
        email.value === "" ||
        password.value === ""
    ){

        alert(
            "Ingresa correo y contraseña"
        );

        return;

    }

    try{

        await signInWithEmailAndPassword(

            auth,
            email.value,
            password.value

        );

        alert("Bienvenido");

    }
    catch(error){

        if(
            error.code ===
            "auth/user-not-found"
        ){

            alert(
                "Necesitas crear una cuenta primero"
            );

        }
        else if(
            error.code ===
            "auth/wrong-password"
        ){

            alert(
                "Contraseña incorrecta"
            );

        }
        else{

            alert(
                "Correo o contraseña inválidos"
            );

        }

    }

});


// LOGOUT

logoutBtn.addEventListener(
"click",
async () => {

    await signOut(auth);

});


// SESION

onAuthStateChanged(auth, (user) => {

    if(user){

        loginSection.classList.add(
            "hidden"
        );

        dashboard.classList.remove(
            "hidden"
        );

        loadHistory();

    }
    else{

        loginSection.classList.remove(
            "hidden"
        );

        dashboard.classList.add(
            "hidden"
        );

    }

});


// GUARDAR REGISTRO

plantForm.addEventListener(
"submit",
async (e) => {

    e.preventDefault();

    try{

        const plantName =
        document.getElementById(
            "plantName"
        ).value;

        const height =
        document.getElementById(
            "height"
        ).value;

        const fertilizer =
        document.getElementById(
            "fertilizer"
        ).value;

        const notes =
        document.getElementById(
            "notes"
        ).value;

        const imageFile =
        imageInput.files[0];

        if(!imageFile){

            alert("Debes subir una imagen");

            return;

        }

        // SUBIR IMAGEN

        const imageRef = ref(

            storage,

            `plantas/${
                Date.now()
            }_${imageFile.name}`

        );

        await uploadBytes(
            imageRef,
            imageFile
        );

        const imageUrl =
        await getDownloadURL(imageRef);

        // GUARDAR FIRESTORE

        await addDoc(

            collection(db, "bitacora"),

            {

                userId:
                auth.currentUser.uid,

                plantName:
                plantName,

                height:
                height,

                fertilizer:
                fertilizer,

                notes:
                notes,

                imageUrl:
                imageUrl,

                createdAt:
                new Date()

            }

        );

        alert(
            "Registro guardado correctamente"
        );

        plantForm.reset();

        previewImage.style.display =
        "none";

        loadHistory();

    }
    catch(error){

        console.log(error);

        alert(
            "Error al guardar registro"
        );

    }

});


// HISTORIAL

async function loadHistory(
filter = ""
){

    historyContainer.innerHTML = "";

    const q = query(

        collection(db, "bitacora"),

        where(
            "userId",
            "==",
            auth.currentUser.uid
        )

    );

    const querySnapshot =
    await getDocs(q);

    querySnapshot.forEach((doc) => {

        const data = doc.data();

        if(

            data.plantName
            .toLowerCase()
            .includes(
                filter.toLowerCase()
            )

        ){

            historyContainer.innerHTML += `

                <div class="history-item">

                    <img
                        src="${data.imageUrl}"
                        alt="Planta"
                    >

                    <div class="history-content">

                        <h4>
                            ${data.plantName}
                        </h4>

                        <p>
                            <strong>Altura:</strong>
                            ${data.height} cm
                        </p>

                        <p>
                            <strong>Abono:</strong>
                            ${data.fertilizer}
                        </p>

                        <p>
                            <strong>Notas:</strong>
                            ${data.notes}
                        </p>

                    </div>

                </div>

            `;

        }

    });

}


// FILTRO

searchPlant.addEventListener(
"input",
(e) => {

    loadHistory(e.target.value);

});