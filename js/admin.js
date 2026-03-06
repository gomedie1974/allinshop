import { db } from "./firebase.js";
// Agregamos setDoc a los imports para el producto individual
import { writeBatch, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// === CONTROL DE ACCESO SIMPLE ===
const CLAVE_CORRECTA = "rumyyoro"; 
const password = prompt("Introduce la clave de administrador para acceder:");

if (password === CLAVE_CORRECTA) {
    document.getElementById("admin-content").style.display = "block";
} else {
    alert("Acceso denegado. Clave incorrecta.");
    window.location.href = "index.html"; 
}

// === ELEMENTOS DEL DOM ===
const btnBatch = document.getElementById("btn-batch");
const jsonInput = document.getElementById("json-masivo");
const colSelect = document.getElementById("col-select");
const adminForm = document.getElementById("admin-form"); // El formulario individual

// --- LÓGICA 1: PRODUCTO INDIVIDUAL ---
adminForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    
    const col = document.getElementById("col-select").value;
    const id = document.getElementById("prod-id").value.trim().toLowerCase();

    // Armamos el objeto tal cual lo tienes en Firebase
    const nuevoProducto = {
        activo: true,
        nombre: document.getElementById("prod-nombre").value,
        descripcion: document.getElementById("prod-descripcion").value,
        imagen: document.getElementById("prod-img").value,
        precio: Number(document.getElementById("prod-precio").value),
        stock: Number(document.getElementById("prod-stock").value),
        categoria: document.getElementById("prod-cat").value.toLowerCase(),
        orden: Number(document.getElementById("prod-orden").value || 1),
        destacado: document.getElementById("prod-destacado").checked ? "true" : "false"
    };

    try {
        console.log("Guardando producto individual...");
        // setDoc guarda un documento con un ID específico
        await setDoc(doc(db, col, id), nuevoProducto);
        alert("¡Producto individual guardado con éxito!");
        adminForm.reset(); // Limpia el formulario
    } catch (error) {
        console.error("Error al guardar individual:", error);
        alert("Error al guardar: " + error.message);
    }
});

// --- LÓGICA 2: BATCH WRITE (CARGA MASIVA) ---
btnBatch.addEventListener("click", async () => {
    const rawData = jsonInput.value.trim();
    const coleccionDestino = colSelect.value;

    if (!rawData) return alert("¡El cuadro de texto está vacío!");

    try {
        const lista = JSON.parse(rawData);
        const batch = writeBatch(db);
        
        console.log(`Iniciando batch para ${lista.length} productos...`);

        lista.forEach(item => {
            const idDoc = item.id || item.nombre.toLowerCase().replace(/\s+/g, '-');
            const docRef = doc(db, coleccionDestino, idDoc);
            
            batch.set(docRef, {
                activo: item.activo ?? true,
                nombre: item.nombre,
                descripcion: item.descripcion || "",
                precio: Number(item.precio),
                stock: Number(item.stock),
                imagen: item.imagen,
                categoria: item.categoria,
                orden: Number(item.orden || 1),
                destacado: String(item.destacado || "false")
            });
        });

        await batch.commit();
        alert(`¡Éxito masivo! ${lista.length} productos subidos.`);
        jsonInput.value = ""; 

    } catch (error) {
        console.error("Error detallado batch:", error);
        alert("Error en el proceso masivo.");
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