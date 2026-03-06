import { db } from "./firebase.js";
import { writeBatch, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// === CONTROL DE ACCESO SIMPLE ===
const CLAVE_CORRECTA = "rumyyoro"; // <-- CAMBIA ESTO POR TU CLAVE
const password = prompt("Introduce la clave de administrador para acceder:");

if (password === CLAVE_CORRECTA) {
    // Si la clave es correcta, mostramos el contenido
    document.getElementById("admin-content").style.display = "block";
} else {
    // Si es incorrecta, avisamos y redirigimos al index
    alert("Acceso denegado. Clave incorrecta.");
    window.location.href = "index.html"; 
}
// ================================

// ... AQUÍ SIGUE EL RESTO DE TU CÓDIGO (btnBatch.addEventListener, etc.) ...
// Seleccionamos los elementos del HTML
const btnBatch = document.getElementById("btn-batch");
const jsonInput = document.getElementById("json-masivo");
const colSelect = document.getElementById("col-select");

// Esta función se activará SOLO cuando hagas click en el botón
btnBatch.addEventListener("click", async () => {
    const rawData = jsonInput.value.trim();
    const coleccionDestino = colSelect.value;

    if (!rawData) {
        return alert("¡El cuadro de texto está vacío! Pega un JSON válido.");
    }

    try {
        // 1. Convertimos el texto en un objeto real de JS
        const lista = JSON.parse(rawData);
        const batch = writeBatch(db);
        
        console.log(`Iniciando carga de ${lista.length} productos en [${coleccionDestino}]...`);

        // 2. Preparamos cada producto en el batch
        lista.forEach(item => {
            // Si el item no tiene ID, generamos uno basado en el nombre
            const idDoc = item.id || item.nombre.toLowerCase().replace(/\s+/g, '-');
            const docRef = doc(db, coleccionDestino, idDoc);
            
            batch.set(docRef, {
                activo: item.activo ?? true,
                nombre: item.nombre,
                descripcion: item.descripcion,
                precio: Number(item.precio),
                stock: Number(item.stock),
                imagen: item.imagen,
                categoria: item.categoria,
                orden: Number(item.orden || 1),
                destacado: String(item.destacado || "false")
            });
        });

        // 3. Enviamos a Firebase
        console.log("Enviando batch al servidor...");
        await batch.commit();

        alert(`¡Éxito! Se subieron ${lista.length} productos a la colección ${coleccionDestino}`);
        jsonInput.value = ""; // Limpiamos el cuadro después de subir

    } catch (error) {
        console.error("Error detallado:", error);
        alert("Hubo un error. Revisa que el JSON esté bien escrito (comas, llaves, etc).");
    }
});



/* 
[
  {
    "id": "vodka-absolut",
    "nombre": "Vodka Absolut 750ml",
    "descripcion": "Botella 750ml",
    "precio": 18000,
    "stock": 12,
    "categoria": "blancas",
    "imagen": "/assets/img/absolut.png",
    "orden": 1,
    "destacado": "true",
    "activo": true
  },
  {
    "id": "gin-bombay",
    "nombre": "Gin Bombay Sapphire",
    "descripcion": "Botella 750ml",
    "precio": 22000,
    "stock": 5,
    "categoria": "gin",
    "imagen": "/assets/img/bombay.png",
    "orden": 2,
    "destacado": "false",
    "activo": true
  }
]
 */