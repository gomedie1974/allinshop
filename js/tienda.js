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

productosPagina.forEach(p=>{

container.innerHTML+=`
<div class="col-md-4">

<div class="product-card">

<img src="${p.imagen}" class="img-fluid">

<div class="product-info">

<h4>${p.nombre}</h4>

<h6>${p.descripcion || ""}</h6>

<p class="price">$${Number(p.precio).toLocaleString()}</p>

${
p.stock===0
?
`<button class="btn btn-secondary" disabled>Sin stock</button>`
:
`<button class="btn btn-gold whatsapp-btn"
data-nombre="${p.nombre}"
data-precio="${p.precio}">
Consultar
</button>`
}

</div>
</div>
</div>
`;

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

cargarTienda();

});