// js/bebidas.js

import { db } from "./firebase.js";
import { collection, getDocs, query, where } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const container = document.getElementById("bebidas-container");
const filtros = document.querySelectorAll(".filtro-btn");

// ===== TRAER PRODUCTOS =====
async function cargarBebidas(categoria = "all") {

  container.innerHTML = "Cargando...";

  let q;

  if (categoria === "all") {
    q = query(collection(db, "bebidas"), where("activo", "==", true));
  } else {
    q = query(
      collection(db, "bebidas"),
      where("categoria", "==", categoria),
      where("activo", "==", true)
    );
  }

  const querySnapshot = await getDocs(q);

  container.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const bebida = doc.data();

    container.innerHTML += `
      <div class="col-md-4 bebida-item">
        <div class="product-card">
          <img src="${bebida.imagen}" class="img-fluid">
          <div class="product-info">
            <h4>${bebida.nombre}</h4>
            <h6>${bebida.descripcion}</h6>
            <p class="price">$${bebida.precio.toLocaleString()}</p>

            ${bebida.stock === 0 
            ? `<p class="sin-stock">Sin stock</p>
                <button class="btn btn-secondary" disabled>
                No disponible
                </button>`
            : `<button 
                class="btn btn-gold whatsapp-btn"
                data-nombre="${bebida.nombre}"
                data-precio="${bebida.precio}">
                Consultar
                </button>`
            }
          </div>
        </div>
      </div>
    `;
  });
}

// ===== FILTROS =====
filtros.forEach(btn => {
  btn.addEventListener("click", () => {

    filtros.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const categoria = btn.dataset.filter;
    cargarBebidas(categoria);

  });
});

// Cargar todo al iniciar
cargarBebidas();

// ===== WHATSAPP =====

const numeroWhatsApp = "5491141685220"; // tu número en formato internacional

document.addEventListener("click", function(e) {

  if (e.target.classList.contains("whatsapp-btn")) {

    const nombre = e.target.dataset.nombre;
    const precio = e.target.dataset.precio;

    const mensaje = `Hola Diego, quiero consultar por:

Producto: ${nombre}
Precio: $${Number(precio).toLocaleString()}

¿Está disponible?`;

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");
  }

});