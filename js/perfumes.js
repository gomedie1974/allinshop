import { db } from "./firebase.js";
import { 
    collection, getDocs, query, where, orderBy, limit, startAfter, endBefore, limitToLast 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const container = document.getElementById("perfumes-container");
const filtros = document.querySelectorAll(".filtro-btn");

// Variables de Paginación
let lastVisible = null;   // Último doc de la página actual
let firstVisible = null;  // Primer doc de la página actual
let paginaActual = 1;
const PAGE_SIZE = 6;
let categoriaActual = "all";

// Botones (Asegúrate de tener estos IDs en tu HTML)
const btnNext = document.getElementById("btn-next");
const btnPrev = document.getElementById("btn-prev");

async function cargarPerfumes(categoria = "all", direccion = "inicio") {
    container.innerHTML = "Cargando...";
    categoriaActual = categoria;

    let q;
    const baseConstraints = [
        collection(db, "perfumes"),
        where("activo", "==", true),
        orderBy("orden", "asc") // IMPORTANTE: Todos tus productos deben tener el campo 'orden'
    ];

    if (categoria !== "all") {
        baseConstraints.push(where("categoria", "==", categoria));
    }

    // Lógica de navegación
    if (direccion === "siguiente" && lastVisible) {
        q = query(...baseConstraints, startAfter(lastVisible), limit(PAGE_SIZE));
    } else if (direccion === "anterior" && firstVisible) {
        q = query(...baseConstraints, endBefore(firstVisible), limitToLast(PAGE_SIZE));
    } else {
        // Carga inicial o reset de filtros
        q = query(...baseConstraints, limit(PAGE_SIZE));
        paginaActual = 1;
    }

    try {
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            container.innerHTML = "<p class='text-center'>No se encontraron más productos.</p>";
            btnNext.style.display = "none";
            return;
        }

        container.innerHTML = "";
        
        // Guardamos los límites para la próxima navegación
        firstVisible = querySnapshot.docs[0];
        lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        querySnapshot.forEach((doc) => {
            const perfumes = doc.data();
            renderizarTarjeta(perfumes);
        });

        // Control de visibilidad de botones
        btnPrev.style.display = paginaActual > 1 ? "block" : "none";
        // Si trajo menos de los pedidos, no hay más adelante
        btnNext.style.display = querySnapshot.docs.length < PAGE_SIZE ? "none" : "block";

    } catch (error) {
        console.error("Error en Firestore:", error);
        container.innerHTML = "Error al cargar productos. Revisa la consola.";
        // TIP: Si ves un error de "Index", haz clic en el link que aparece en la consola.
    }
}

function renderizarTarjeta(perfumes) {
    container.innerHTML += `
      <div class="col-md-4 perfumes-item">
        <div class="product-card">
          <img src="${perfumes.imagen}" class="img-fluid img-zoomable" data-src="${perfumes.imagen}">
          <div class="product-info">
            <h4>${perfumes.nombre}</h4>
            <h6>${perfumes.descripcion || ""}</h6>
            <p class="price">$${Number(perfumes.precio).toLocaleString()}</p>
            ${perfumes.stock === 0 
                ? `<p class="sin-stock">Sin stock</p><button class="btn btn-secondary" disabled>No disponible</button>`
                : `<button class="btn btn-gold whatsapp-btn" data-nombre="${perfumes.nombre}" data-precio="${perfumes.precio}">Consultar <i class="bi bi-whatsapp"></i></button>`
            }
          </div>
        </div>
      </div>`;
}

// ===== EVENTOS DE NAVEGACIÓN =====
btnNext.addEventListener("click", () => {
    paginaActual++;
    cargarPerfumes(categoriaActual, "siguiente");
});

btnPrev.addEventListener("click", () => {
    if (paginaActual > 1) {
        paginaActual--;
        cargarPerfumes(categoriaActual, "anterior");
    }
});

// ===== FILTROS =====
filtros.forEach(btn => {
    btn.addEventListener("click", () => {
        filtros.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        lastVisible = null;
        firstVisible = null;
        cargarPerfumes(btn.dataset.filter);
    });
});

// ===== WHATSAPP (Mantenemos tu lógica) =====
const numeroWhatsApp = "5491141685220";
document.addEventListener("click", function(e) {
    if (e.target.classList.contains("whatsapp-btn")) {
        const nombre = e.target.dataset.nombre;
        const precio = e.target.dataset.precio;
        const mensaje = `Hola Diego, quiero consultar por:\n\nProducto: ${nombre}\nPrecio: $${Number(precio).toLocaleString()}\n\n¿Está disponible?`;
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
    }
});
// Lógica de Zoom para Perfumes
const zoomModal = new bootstrap.Modal(document.getElementById('imageZoomModal'));
const modalImg = document.getElementById('modalZoomImage');

document.addEventListener("click", function(e) {
    if (e.target.classList.contains("img-zoomable")) {
        const rutaImagen = e.target.getAttribute("data-src");
        modalImg.src = rutaImagen;
        zoomModal.show();
    }
});

// Cerrar al cliquear la propia imagen ampliada
modalImg.addEventListener('click', () => {
    zoomModal.hide();
});
// Inicio
cargarPerfumes();


