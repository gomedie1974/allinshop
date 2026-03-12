    import { db } from "./firebase.js";
    import { 
    collection, getDocs, query, where, orderBy 
    } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    // =============================
    // CONFIGURACIÓN Y ESTADO
    // =============================
    const container = document.getElementById("tienda-container");
    const btnNext = document.getElementById("btn-next");
    const btnPrev = document.getElementById("btn-prev");
    const PAGE_SIZE = 6;
    const numeroWhatsApp = "5491141685220";

    let productosBase = [];      // Todos los productos de Firestore
    let productosFiltrados = [];  // Productos tras aplicar el filtro
    let paginaActual = 1;

    // =============================
    // CARGAR DATOS DESDE FIRESTORE
    // =============================
    async function cargarTienda() {
    container.innerHTML = `
        <div class='col-12 text-center py-5'>
            <div class='spinner-border text-dark' role='status'></div>
            <p class="mt-2">Cargando productos...</p>
        </div>`;

    try {
        const q = query(
            collection(db, "promociones"),
            where("activo", "==", true),
            orderBy("orden", "asc")
        );

        const snapshot = await getDocs(q);
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
        container.innerHTML = "<div class='col-12 text-center py-5'><p class='lead'>No hay productos en esta categoría.</p></div>";
        actualizarBotones();
        return;
    }

    productosPagina.forEach(p => {
        // Usamos 'col-6 col-md-4' para que en móvil se vean 2 por fila (mejor responsive)
        container.innerHTML += `
        <div class="col-6 col-md-4">
            <div class="product-card">
                <img src="${p.imagen}" class="img-fluid img-zoomable" data-src="${p.imagen}" alt="${p.nombre}">
                <div class="product-info p-2 p-md-3">
                    <h4 class="h6 h5-md fw-bold text-truncate">${p.nombre}</h4>
                    <p class="text-muted small d-none d-md-block">${p.descripcion || ""}</p>
                    <p class="price mb-2">$${Number(p.precio).toLocaleString()}</p>
                    ${p.stock === 0
                        ? `<button class="btn btn-secondary " disabled>Sin stock</button>`
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
        productosFiltrados = productosBase.filter(p => 
            p.categoria && p.categoria.toLowerCase() === categoria.toLowerCase()
        );
    }

    paginaActual = 1; 
    renderPagina();
    }

    // =============================
    // NAVEGACIÓN (PAGINACIÓN)
    // =============================
    function actualizarBotones() {
    const totalPaginas = Math.ceil(productosFiltrados.length / PAGE_SIZE);
    btnPrev.classList.toggle("d-none", paginaActual === 1 || totalPaginas === 0);
    btnNext.classList.toggle("d-none", paginaActual >= totalPaginas || totalPaginas === 0);
    }

    // =============================
    // EVENT LISTENERS
    // =============================
    document.addEventListener("DOMContentLoaded", () => {

    // 1. Manejo de Filtros
    const botonesFiltro = document.querySelectorAll(".filtro-btn");
    botonesFiltro.forEach(boton => {
        boton.addEventListener("click", (e) => {
            botonesFiltro.forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");
            
            const cat = e.currentTarget.getAttribute("data-categoria");
            aplicarFiltro(cat);
        });
    });

    // 2. Paginación
    btnNext.addEventListener("click", () => {
        paginaActual++;
        renderPagina();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    btnPrev.addEventListener("click", () => {
        paginaActual--;
        renderPagina();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 3. Botón WhatsApp (Delegación de eventos)
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".whatsapp-btn");
        if (btn) {
            const { nombre, precio } = btn.dataset;
            const mensaje = `Hola Diego, quiero consultar por:\n\nProducto: ${nombre}\nPrecio: $${Number(precio).toLocaleString()}\n\n¿Está disponible?`;
            window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
        }
    });

    // 4. Zoom de Imagen (Modal)
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