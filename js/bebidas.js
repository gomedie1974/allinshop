import { db } from "./firebase.js";
import { 
    collection, getDocs, query, where, orderBy, limit, startAfter, endBefore, limitToLast 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- ELEMENTOS DEL DOM ---
const container = document.getElementById("bebidas-container");
const filtros = document.querySelectorAll(".filtro-btn");
const btnNext = document.getElementById("btn-next");
const btnPrev = document.getElementById("btn-prev");

// --- ELEMENTOS DEL FILTRO BODEGA ---
const contenedorBodega = document.getElementById("contenedor-filtro-bodega");
const selectBodega = document.getElementById("select-bodega");

// --- ESTADO DE LA APLICACIÓN ---
let lastVisible = null;   
let firstVisible = null;  
let paginaActual = 1;
const PAGE_SIZE = 6;
let categoriaActual = "all";
let bodegaActual = "all";

// ==========================================
// FUNCIÓN PRINCIPAL: CARGAR DATOS
// ==========================================
async function cargarBebidas(categoria = "all", direccion = "inicio") {
    container.innerHTML = "<div class='col-12 text-center'>Cargando...</div>";
    categoriaActual = categoria;

    // Control de visibilidad del filtro de bodegas (Solo para vinos y champagne)
    const categoriasConBodega = ["tinto", "blanco", "champagne"];
    if (categoriasConBodega.includes(categoria)) {
        contenedorBodega.style.display = "block";
        await actualizarSelectBodegas(categoria);
    } else {
        contenedorBodega.style.display = "none";
        bodegaActual = "all"; // Reset si cambia a Aperitivos, por ejemplo
    }

    let q;
    // Base de la consulta
    let constraints = [
        collection(db, "bebidas"),
        where("activo", "==", true)
    ];

    // Filtro por Categoría
    if (categoria !== "all") {
        constraints.push(where("categoria", "==", categoria));
    }

    // Filtro por Bodega
    if (bodegaActual !== "all") {
        constraints.push(where("bodega", "==", bodegaActual));
    }

    // Orden (Obligatorio para paginación)
    constraints.push(orderBy("orden", "asc"));

    // Lógica de Paginación
    if (direccion === "siguiente" && lastVisible) {
        q = query(...constraints, startAfter(lastVisible), limit(PAGE_SIZE));
    } else if (direccion === "anterior" && firstVisible) {
        q = query(...constraints, endBefore(firstVisible), limitToLast(PAGE_SIZE));
    } else {
        q = query(...constraints, limit(PAGE_SIZE));
        paginaActual = 1;
    }

    try {
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            container.innerHTML = "<p class='text-center'>No se encontraron productos con estos filtros.</p>";
            btnNext.style.display = "none";
            btnPrev.style.display = "none";
            return;
        }

        container.innerHTML = "";
        firstVisible = querySnapshot.docs[0];
        lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        querySnapshot.forEach((doc) => {
            renderizarTarjeta(doc.data());
        });

        // Control de botones
        btnPrev.style.display = paginaActual > 1 ? "inline-block" : "none";
        btnNext.style.display = querySnapshot.docs.length < PAGE_SIZE ? "none" : "inline-block";

    } catch (error) {
        console.error("Error Firestore:", error);
        container.innerHTML = "Error al cargar. Verifique la consola.";
    }
}

// ==========================================
// RENDERIZAR TARJETA
// ==========================================
function renderizarTarjeta(bebida) {
    container.innerHTML += `
      <div class="col-md-4">
        <div class="product-card">
          <img src="${bebida.imagen}" class="img-fluid img-zoomable" data-src="${bebida.imagen}" alt="${bebida.nombre}">
          <div class="product-info text-center">
            <h4>${bebida.nombre}</h4>
            ${bebida.bodega ? `<p class="bodega-text" style="color:#888; font-size:0.8rem; text-transform:uppercase; margin-bottom:5px;">${bebida.bodega}</p>` : ''}
            <h6>${bebida.descripcion || ""}</h6>
            <p class="price">$${Number(bebida.precio).toLocaleString()}</p>
            ${bebida.stock === 0 
                ? `<button class="btn btn-secondary w-100" disabled>Sin Stock</button>`
                : `<button class="btn btn-gold whatsapp-btn w-50" 
                    data-nombre="${bebida.nombre}" 
                    data-bodega="${bebida.bodega || ''}" 
                    data-precio="${bebida.precio}">
                    Consultar <i class="bi bi-whatsapp"></i>
                   </button>`
            }
          </div>
        </div>
      </div>`;
}

// ==========================================
// FILTRO DINÁMICO DE BODEGAS
// ==========================================
async function actualizarSelectBodegas(cat) {
    // Buscamos todas las bodegas que existen para esa categoría en Firestore
    const q = query(collection(db, "bebidas"), where("categoria", "==", cat), where("activo", "==", true));
    const snap = await getDocs(q);
    
    // Extraer nombres únicos y filtrar nulos
    const bodegasUnicas = [...new Set(snap.docs.map(d => d.data().bodega).filter(b => b && b.trim() !== ""))];
    
    // Guardar el valor seleccionado antes de limpiar
    const tempSeleccion = bodegaActual;

    selectBodega.innerHTML = '<option value="all">Todas las bodegas</option>';
    bodegasUnicas.sort().forEach(b => {
        const option = document.createElement("option");
        option.value = b;
        option.textContent = b;
        if(b === tempSeleccion) option.selected = true;
        selectBodega.appendChild(option);
    });
}

// Cambio de Bodega
selectBodega.addEventListener("change", (e) => {
    bodegaActual = e.target.value;
    lastVisible = null;
    firstVisible = null;
    paginaActual = 1;
    cargarBebidas(categoriaActual);
});

// ==========================================
// EVENTOS DE NAVEGACIÓN Y FILTROS
// ==========================================
btnNext.addEventListener("click", () => {
    paginaActual++;
    cargarBebidas(categoriaActual, "siguiente");
});

btnPrev.addEventListener("click", () => {
    if (paginaActual > 1) {
        paginaActual--;
        cargarBebidas(categoriaActual, "anterior");
    }
});

filtros.forEach(btn => {
    btn.addEventListener("click", () => {
        filtros.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        lastVisible = null;
        firstVisible = null;
        paginaActual = 1;
        bodegaActual = "all"; // Reset al cambiar categoría principal
        
        cargarBebidas(btn.dataset.filter);
    });
});

// ==========================================
// WHATSAPP
// ==========================================
const numeroWhatsApp = "5491141685220";
document.addEventListener("click", function(e) {
    if (e.target.classList.contains("whatsapp-btn")) {
        const { nombre, bodega, precio } = e.target.dataset;
        const msjBodega = bodega ? `Bodega: ${bodega}\n` : "";
        const mensaje = `Hola Diego, quiero consultar por:\n\nProducto: ${nombre}\n${msjBodega}Precio: $${Number(precio).toLocaleString()}\n\n¿Está disponible?`;
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
    }
});

// ==========================================
// LÓGICA DE ZOOM
// ==========================================
const zoomModalElement = document.getElementById('imageZoomModal');
const modalImg = document.getElementById('modalZoomImage');

if (zoomModalElement) {
    const zoomModal = new bootstrap.Modal(zoomModalElement);
    
    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("img-zoomable")) {
            modalImg.src = e.target.getAttribute("data-src");
            zoomModal.show();
        }
    });

    modalImg.addEventListener('click', () => zoomModal.hide());
}

// --- INICIO ---
cargarBebidas();