import { db } from "./firebase.js";
import {
    collection, doc, setDoc, getDocs, deleteDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.getElementById("admin-form");
const tabla = document.getElementById("listaProductos");
const colSelect = document.getElementById("col-select");
const filtroCol = document.getElementById("filtro-coleccion"); // Nuevo selector
const btnGuardar = form.querySelector("button[type='submit']");

// --- ESTADO ---
let todosLosProductos = []; 
let paginaActual = 1;
const productosPorPagina = 8; 
let editandoID = null;

// =============================
// CARGAR PRODUCTOS (DESDE FIREBASE)
// =============================
async function cargarProductos() {
    todosLosProductos = [];
    const colecciones = ["bebidas", "perfumes", "belleza", "promociones"];

    for (const col of colecciones) {
        const querySnapshot = await getDocs(collection(db, col));
        querySnapshot.forEach((docu) => {
            todosLosProductos.push({ id: docu.id, col, ...docu.data() });
        });
    }
    renderizarTabla();
}

// =============================
// RENDERIZAR TABLA CON FILTRO Y PAGINACIÓN
// =============================
function renderizarTabla() {
    tabla.innerHTML = "";
    const valorFiltro = filtroCol.value;

    // 1. Filtrar los productos según el selector
    const productosFiltrados = valorFiltro === "todas" 
        ? todosLosProductos 
        : todosLosProductos.filter(p => p.col === valorFiltro);

    // 2. Calcular paginación sobre el resultado filtrado
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const visibles = productosFiltrados.slice(inicio, fin);

    visibles.forEach((prod) => {
        tabla.innerHTML += `
        <tr>
            <td><img src="${prod.imagen}" width="40" class="rounded" onerror="this.src='https://via.placeholder.com/40'"></td>
            <td>${prod.nombre}</td>
            <td>$${prod.precio}</td>
            <td>${prod.stock}</td>
            <td><span class="badge bg-secondary">${prod.col}</span></td>
            <td>
                <button class="btn btn-warning btn-sm editar" data-id="${prod.id}" data-col="${prod.col}">✏️</button>
                <button class="btn btn-danger btn-sm borrar" data-id="${prod.id}" data-col="${prod.col}">🗑️</button>
            </td>
        </tr>`;
    });

    renderizarPaginacion(productosFiltrados.length);
}

// Escuchar cambios en el filtro
filtroCol.addEventListener("change", () => {
    paginaActual = 1; // Resetear a la primera página al filtrar
    renderizarTabla();
});

// =============================
// BOTONES DE PAGINACIÓN
// =============================
function renderizarPaginacion(totalItems) {
    const totalPaginas = Math.ceil(totalItems / productosPorPagina);
    const nav = document.getElementById("pagination-container");
    if(!nav) return;
    nav.innerHTML = "";

    if (totalPaginas <= 1) return; // No mostrar si solo hay una página

    for (let i = 1; i <= totalPaginas; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.onclick = (e) => { 
            e.preventDefault(); 
            paginaActual = i; 
            renderizarTabla(); 
            window.scrollTo(0, document.body.scrollHeight / 2); // Scroll suave a la tabla
        };
        nav.appendChild(li);
    }
}

// =============================
// LÓGICA DE EVENTOS (GUARDAR, EDITAR, BORRAR)
// =============================

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const col = colSelect.value;
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

    if (editandoID) {
        await updateDoc(doc(db, col, editandoID), producto);
        editandoID = null;
        btnGuardar.innerText = "Guardar Producto";
        btnGuardar.classList.replace("btn-success", "btn-primary");
        document.getElementById("prod-id").disabled = false;
    } else {
        await setDoc(doc(db, col, id), producto);
    }
    form.reset();
    await cargarProductos();
});

document.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    const col = e.target.dataset.col;

    if (e.target.classList.contains("borrar")) {
        if (confirm("¿Eliminar producto?")) {
            await deleteDoc(doc(db, col, id));
            await cargarProductos();
        }
    }

    if (e.target.classList.contains("editar")) {
        const p = todosLosProductos.find(item => item.id === id && item.col === col);
        if (p) {
            document.getElementById("prod-id").value = p.id;
            document.getElementById("prod-id").disabled = true;
            document.getElementById("prod-nombre").value = p.nombre;
            document.getElementById("prod-descripcion").value = p.descripcion;
            document.getElementById("prod-img").value = p.imagen;
            document.getElementById("prod-precio").value = p.precio;
            document.getElementById("prod-stock").value = p.stock;
            document.getElementById("prod-cat").value = p.categoria;
            document.getElementById("prod-orden").value = p.orden;
            document.getElementById("prod-destacado").checked = p.destacado;
            colSelect.value = p.col;
            editandoID = p.id;
            btnGuardar.innerText = "Actualizar Cambios";
            btnGuardar.classList.replace("btn-primary", "btn-success");
            window.scrollTo(0, 0);
        }
    }
});

cargarProductos();