import { db } from "./firebase.js";
import { 
collection, getDocs, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const container = document.getElementById("tienda-container");
const btnNext = document.getElementById("btn-next");
const btnPrev = document.getElementById("btn-prev");

const PAGE_SIZE = 6;

let productos = [];
let paginaActual = 1;


// =============================
// CARGAR DATOS DESDE FIRESTORE
// =============================
async function cargarTienda(){

container.innerHTML="<div class='col-12 text-center'>Cargando...</div>";

const q = query(
collection(db,"promociones"),
where("activo","==",true),
orderBy("orden","asc")
);

const snapshot = await getDocs(q);

productos = snapshot.docs.map(doc=>doc.data());

renderPagina();

}


// =============================
// RENDER PAGINA
// =============================
function renderPagina(){

container.innerHTML="";

const inicio = (paginaActual-1)*PAGE_SIZE;
const fin = inicio + PAGE_SIZE;

const productosPagina = productos.slice(inicio,fin);

productosPagina.forEach(p => {
    container.innerHTML += `
    <div class="col-md-4">
        <div class="product-card">
            <img src="${p.imagen}" class="img-fluid img-zoomable" data-src="${p.imagen}">
            <div class="product-info">
                <h4>${p.nombre}</h4>
                <h6>${p.descripcion || ""}</h6>
                <p class="price">$${Number(p.precio).toLocaleString()}</p>
                ${p.stock === 0
                    ? `<button class="btn btn-secondary" disabled>Sin stock</button>`
                    : `<button class="btn btn-gold whatsapp-btn" data-nombre="${p.nombre}" data-precio="${p.precio}">Consultar <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-whatsapp" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                    </svg></button>`
                }
            </div>
        </div>
    </div>`;
});

actualizarBotones();

}


// =============================
// BOTONES
// =============================
function actualizarBotones(){

const totalPaginas = Math.ceil(productos.length / PAGE_SIZE);

btnPrev.style.display = paginaActual === 1 ? "none" : "inline-block";

btnNext.style.display = paginaActual === totalPaginas ? "none" : "inline-block";

}


// =============================
// EVENTOS
// =============================

btnNext.addEventListener("click",()=>{

paginaActual++;

renderPagina();

});

btnPrev.addEventListener("click",()=>{

paginaActual--;

renderPagina();

});


// =============================
// WHATSAPP
// =============================

const numeroWhatsApp="5491141685220";

document.addEventListener("click",function(e){

if(e.target.classList.contains("whatsapp-btn")){

const nombre=e.target.dataset.nombre;
const precio=e.target.dataset.precio;

const mensaje=`Hola Diego, quiero consultar por:

Producto: ${nombre}
Precio: $${Number(precio).toLocaleString()}

¿Está disponible?`;

const url=`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

window.open(url,"_blank");

}

});


// =============================
// INICIO
// =============================

document.addEventListener("DOMContentLoaded",()=>{

btnPrev.style.display="none";

// Lógica de Zoom
const zoomModal = new bootstrap.Modal(document.getElementById('imageZoomModal'));
const modalImg = document.getElementById('modalZoomImage');

document.addEventListener("click", function(e) {
    if (e.target.classList.contains("img-zoomable")) {
        const ruta = e.target.getAttribute("data-src");
        modalImg.src = ruta;
        zoomModal.show();
    }
});

// Cerrar al cliquear la imagen
modalImg.addEventListener('click', () => {
    zoomModal.hide();
});


cargarTienda();

});