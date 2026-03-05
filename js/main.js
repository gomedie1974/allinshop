// CARGAR NAVBAR DINÁMICO
document.addEventListener("DOMContentLoaded", function() {

  fetch("components/navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;
    });

});

/* Boton consultar */
document.addEventListener("DOMContentLoaded", function() {

  const botones = document.querySelectorAll(".consultar-btn");

  botones.forEach(boton => {
    boton.addEventListener("click", function() {

      const producto = this.getAttribute("data-producto");
      const precio = this.getAttribute("data-precio");

      const mensaje = `Hola, te consulto por el siguiente producto ${producto} (${precio}).`;

      const numero = "5491141685220";
      const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

      window.open(url, "_blank");

    });
  });

});

/* ANIMACION AL FILTRAR */
const filtros = document.querySelectorAll(".filtro-btn");

filtros.forEach(btn => {
  btn.addEventListener("click", () => {

    filtros.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const categoria = btn.dataset.filter;

    if (categoria === "all") {
      renderBebidas(bebidas);
    } else {
      const filtradas = bebidas.filter(b => b.categoria === categoria);
      renderBebidas(filtradas);
    }

  });
});