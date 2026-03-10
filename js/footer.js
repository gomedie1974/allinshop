const footerContainer = document.getElementById('footer-container');

if (footerContainer) {
    footerContainer.innerHTML = `
    <footer class="main-footer">
      <div class="container">
        <div class="row gy-4">
          
        <div class="col-md-4 text-center text-md-start">
            <h4 class="footer-logo">ALL IN <span>SHOP</span></h4>
            <p class="mt-3">Calidad sin concesiones. Lo mejor del mundo en bebidas, fragancias y estilo, seleccionado exclusivamente para vos.</p>
        </div> 

          <div class="col-md-4 text-center">
            <h5>Contacto</h5>
            <ul class="list-unstyled">
              <li>
                <a href="https://wa.me/5491141685220" target="_blank" class="footer-link">
                  <i class="bi bi-whatsapp"></i> +54 9 11 4168-5220
                </a>
              </li>
              <li><i class="bi bi-geo-alt"></i> Buenos Aires, Argentina</li>
              <li><p class="mt-3 small">Atención Online: Lun a Sáb 10 a 13hs</p></li>
            </ul>
          </div>

           <div class="col-md-4 text-center text-md-end">
                <h5>Ubicación</h5>
                <div class="map-container mb-3">
                     <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52601.503525120876!2d-58.539447154629244!3d-34.51317653435092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb147d4018937%3A0xfa30a67c6ada18f7!2sB1636%20Olivos%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1772831736861!5m2!1ses!2sar" width="100%" height="150" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>  
                </div>
            </div>

        </div>

        <hr class="footer-divider">

        <div class="row">
          <div class="col-12 text-center">
            <p class="copyright">
              © 2024 All In Shop - Todos los derechos reservados.
            </p>
            <p class="designer">
              Diseñado por <a href="https://gomezdiego.com.ar/" target="_blank">DG Diseños Web</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
    `;
}