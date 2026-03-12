import { db } from "./firebase.js";
import { 
    collection, getDocs, query, where, orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Elementos del DOM
const container = document.getElementById("tienda-container");
const btnNext = document.getElementById("btn-next");
const btnPrev = document.getElementById("btn-prev");
const filtroBotones = document.querySelectorAll(".filter-btn");

// Configuración
const PAGE_SIZE = 6;
const numeroWhatsApp = "5491141685220";

// Estado de la aplicación
let productosBase = [];      // Todos los productos de Firestore
let productosFiltrados = [];  // Productos tras aplicar el filtro de categoría
let paginaActual = 1;

// =============================
// CARGAR DATOS DESDE FIRESTORE
// =============================
async function cargarTienda() {
    container.innerHTML = "<div class='col-12 text-center'><div class='spinner-border' role='status'></div><p>Cargando productos...</p></div>";

    try {
        const q = query(
            collection(db, "promociones"),
            where("activo", "==", true),
            orderBy("orden", "asc")
        );

        const snapshot = await getDocs(q);
        // Guardamos la respuesta original
        productosBase = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Al iniciar, mostramos todos
        productosFiltrados = [...productosBase];
        
        renderPagina();
    } catch (error) {
        console.error("Error Firestore:", error);
        container.innerHTML = "<div class='col-12 text-center text-danger'>Error al conectar con la base de datos.</div>";
    }
}

// =============================
// RENDERIZADO DE PRODUCTOS
// =============================
function renderPagina() {
    container.innerHTML = "";

    const inicio = (paginaActual - 1) * PAGE_SIZE;
    const fin = inicio + PAGE_SIZE;
    const productosPagina = productosFiltrados.slice(inicio, fin);

    if (productosPagina.length === 0) {
        container.innerHTML = "<div class='col-12 text-center'><p class='lead'>No hay productos en esta categoría.</p></div>";
        actualizarBotones();
        return;
    }

    productosPagina.forEach(p => {
        container.innerHTML += `
        <div class="col-md-4">
            <div class="product-card">
                <img src="${p.imagen}" class="img-fluid img-zoomable" data-src="${p.imagen}" alt="${p.nombre}">
                <div class="product-info p-3">
                    <h4 class="h5 fw-bold">${p.nombre}</h4>
                    <p class="text-muted small">${p.descripcion || ""}</p>
                    <p class="price">$${Number(p.precio).toLocaleString()}</p>
                    ${p.stock === 0
                        ? `<button class="btn btn-secondary w-100" disabled>Sin stock</button>`
                        : `<button class="btn btn-gold whatsapp-btn" data-nombre="${p.nombre}" data-precio="${p.precio}">
                            Consultar <i class="bi bi-whatsapp"></i>
                           </button>`
                    }
                </div>
            </div>
        </div>`;
    });

    actualizarBotones();
}

// =============================
// LÓGICA DE FILTROS
// =============================
function aplicarFiltro(categoria) {
    if (categoria === "todos") {
        productosFiltrados = [...productosBase];
    } else {
        // Filtramos comparando el campo 'categoria' de Firestore
        productosFiltrados = productosBase.filter(p => 
            p.categoria && p.categoria.toLowerCase() === categoria.toLowerCase()
        );
    }
    
    paginaActual = 1; // Volver a la página 1 al cambiar de categoría
    renderPagina();
}

// =============================
// NAVEGACIÓN (PAGINACIÓN)
// =============================
function actualizarBotones() {
    const totalPaginas = Math.ceil(productosFiltrados.length / PAGE_SIZE);

    btnPrev.style.display = (paginaActual === 1 || totalPaginas === 0) ? "none" : "inline-block";
    btnNext.style.display = (paginaActual >= totalPaginas || totalPaginas === 0) ? "none" : "inline-block";
}

btnNext.addEventListener("click", () => {
    paginaActual++;
    renderPagina();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube al inicio al cambiar de página
});

btnPrev.addEventListener("click", () => {
    paginaActual--;
    renderPagina();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

    // =============================
    // GESTIÓN DE EVENTOS (CLICK)
    // =============================
    document.addEventListener("DOMContentLoaded", () => {
        
        // 1. Escuchar botones de Filtro (Estética Unificada)
    document.querySelectorAll('.filtro-btn').forEach(boton => {
        boton.addEventListener('click', (e) => {
            // Quitar la clase 'active' de todos los botones
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
            
            // Agregar 'active' al botón clickeado
            e.target.classList.add('active');

            const catSelected = e.target.getAttribute('data-categoria');
            aplicarFiltro(catSelected);
        });
    });

    // 2. Escuchar botones de WhatsApp (Delegación de eventos)
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("whatsapp-btn")) {
            const nombre = e.target.dataset.nombre;
            const precio = e.target.dataset.precio;
            const mensaje = `Hola Diego, quiero consultar por:\n\nProducto: ${nombre}\nPrecio: $${Number(precio).toLocaleString()}\n\n¿Está disponible?`;
            const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
            window.open(url, "_blank");
        }
    });

    // 3. Lógica de Zoom (Modal Bootstrap)
    const zoomModalElement = document.getElementById('imageZoomModal');
    if (zoomModalElement) {
        const zoomModal = new bootstrap.Modal(zoomModalElement);
        const modalImg = document.getElementById('modalZoomImage');

        document.addEventListener("click", (e) => {
            if (e.target.classList.contains("img-zoomable")) {
                modalImg.src = e.target.getAttribute("data-src");
                zoomModal.show();
            }
        });

        modalImg.addEventListener('click', () => zoomModal.hide());
    }

    // Carga inicial
    cargarTienda();
});