import { db } from "./firebase.js";
import {
collection,
doc,
setDoc,
getDocs,
deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.getElementById("admin-form");
const tabla = document.getElementById("listaProductos");

const colSelect = document.getElementById("col-select");


// =============================
// GUARDAR PRODUCTO
// =============================

form.addEventListener("submit", async (e) => {

e.preventDefault();

const coleccion = colSelect.value;

const id = document.getElementById("prod-id").value;

const producto = {

nombre: document.getElementById("prod-nombre").value,
descripcion: document.getElementById("prod-descripcion").value,
imagen: document.getElementById("prod-img").value,

precio: Number(document.getElementById("prod-precio").value),
stock: Number(document.getElementById("prod-stock").value),

categoria: document.getElementById("prod-cat").value,

orden: Number(document.getElementById("prod-orden").value),

destacado: document.getElementById("prod-destacado").checked,

activo: true

};

await setDoc(doc(db, coleccion, id), producto);

alert("Producto guardado");

form.reset();

cargarProductos();

});


// =============================
// CARGAR PRODUCTOS
// =============================

async function cargarProductos() {

tabla.innerHTML = "";

const colecciones = ["bebidas","perfumes","belleza","promociones"];

for (const col of colecciones) {

const querySnapshot = await getDocs(collection(db, col));

querySnapshot.forEach((docu) => {

const data = docu.data();

tabla.innerHTML += `

<tr>

<td>
<img src="${data.imagen}" width="50">
</td>

<td>${data.nombre}</td>

<td>$${data.precio}</td>

<td>${data.stock}</td>

<td>${data.categoria}</td>

<td>

<button class="btn btn-danger btn-sm borrar"
data-id="${docu.id}"
data-col="${col}">

Eliminar

</button>

</td>

</tr>

`;

});

}

}


// =============================
// ELIMINAR PRODUCTO
// =============================

document.addEventListener("click", async (e) => {

if (e.target.classList.contains("borrar")) {

const id = e.target.dataset.id;

const col = e.target.dataset.col;

if(confirm("Eliminar producto?")){

await deleteDoc(doc(db, col, id));

cargarProductos();

}

}

});


// =============================
// INICIO
// =============================

cargarProductos();