/*
  ╔══════════════════════════════════════════════════════════════╗
  ║  SCRIPT.JS — Lógica JavaScript del portafolio                ║
  ║                                                              ║
  ║  Este archivo controla:                                      ║
  ║    1. Navbar scroll      → borde al hacer scroll             ║
  ║    2. Menú hamburguesa   → abrir/cerrar en móvil             ║
  ║    3. Link activo        → resalta la sección visible        ║
  ║    4. Animación .reveal  → elementos entran al hacer scroll  ║
  ║    5. Contadores         → números animados en #acerca       ║
  ║    6. Formulario         → feedback visual al enviar         ║
  ╚══════════════════════════════════════════════════════════════╝
*/


/* ════════════════════════════════════════════════════════════════
   1. REFERENCIAS A ELEMENTOS DEL DOM
   Se obtienen una sola vez y se reutilizan en las funciones
   siguientes para evitar consultar el DOM repetidamente.
════════════════════════════════════════════════════════════════ */
const navbar    = document.getElementById('navbar');     // barra de navegación fija
const hamburger = document.getElementById('hamburger');  // botón hamburguesa (móvil)
const navLinks  = document.getElementById('navLinks');   // lista <ul> de links del navbar


/* ════════════════════════════════════════════════════════════════
   2. NAVBAR — Agregar borde al hacer scroll
   Cuando el usuario baja más de 20px desde el tope, se añade la
   clase "scrolled" al nav, que activa el borde inferior visible
   definido en CSS (nav.scrolled { border-color: var(--border) }).
════════════════════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  // toggle agrega la clase si la condición es true, la quita si es false
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});


/* ════════════════════════════════════════════════════════════════
   3. MENÚ HAMBURGUESA — Abrir y cerrar en móvil
   Al hacer clic en el botón hamburguesa, se alterna la clase
   "open" en la lista de links. CSS muestra/oculta el menú según
   si esa clase está presente (.nav-links.open { display: flex }).

   Además, al hacer clic en cualquier link del menú, este se cierra
   automáticamente para no cubrir el contenido de la sección destino.
════════════════════════════════════════════════════════════════ */
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');  // abre si estaba cerrado, cierra si estaba abierto
});

// Cierra el menú al seleccionar cualquier enlace
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);


/* ════════════════════════════════════════════════════════════════
   4. LINK ACTIVO — Resaltar la sección actualmente visible
   Mientras el usuario hace scroll, se detecta qué sección está
   visible comparando la posición de scroll con el offsetTop de
   cada <section id="...">.

   El link cuyo href coincida con "#seccionActual" recibe la clase
   "active", que en CSS lo colorea con var(--accent) y muestra
   el subrayado animado (ver .nav-links a.active en style.css).
════════════════════════════════════════════════════════════════ */
// Selecciona todas las secciones que tienen un id (las del navbar)
const sects = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  let cur = ''; // guardará el id de la sección actualmente visible

  sects.forEach(s => {
    // Si el scroll actual superó el tope de la sección (con 90px de margen
    // para compensar la altura del navbar fijo), esa sección es la activa
    if (window.scrollY >= s.offsetTop - 90) cur = s.id;
  });

  // Actualiza la clase "active" en cada link según si apunta a la sección actual
  navLinks.querySelectorAll('a').forEach(a =>
    a.classList.toggle('active', a.getAttribute('href') === `#${cur}`)
  );
});


/* ════════════════════════════════════════════════════════════════
   5. ANIMACIÓN DE ENTRADA — IntersectionObserver para .reveal
   IntersectionObserver detecta cuando un elemento entra en la
   zona visible del viewport.

   Al entrar:
     · Se añade la clase "visible" → CSS anima opacity 0→1 y
       translateY(28px)→0 en 0.6s (definido en .reveal.visible)
     · Se desconecta el observer del elemento para no repetir
       la animación si el usuario sube y baja (unobserve)

   threshold: 0.1 → se activa cuando el 10% del elemento es visible.
════════════════════════════════════════════════════════════════ */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');   // activa la animación CSS
      revObs.unobserve(e.target);          // no repetir para este elemento
    }
  });
}, { threshold: 0.1 });

// Registra todos los elementos con clase .reveal para ser observados
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));


/* ════════════════════════════════════════════════════════════════
   6. CONTADORES ANIMADOS — Números que suben progresivamente
   animCount() incrementa el número mostrado en el elemento `el`
   desde 0 hasta `target` en ~60 pasos de 18ms cada uno (~1.08s).

   Cada paso aumenta el valor en (target / 60) y actualiza el
   texto del elemento. setInterval se detiene cuando se alcanza
   el valor objetivo.

   cntObs observa los contenedores .stat-row: cuando entran en
   pantalla, busca todos los elementos con [data-target] dentro
   y lanza un contador por cada uno.

   threshold: 0.4 → se activa cuando el 40% del contenedor es visible.
════════════════════════════════════════════════════════════════ */
function animCount(el, target, suffix) {
  let v = 0;
  const step = target / 60;  // incremento por cada tick

  const iv = setInterval(() => {
    v = Math.min(v + step, target);          // no superar el valor objetivo
    el.textContent = Math.floor(v) + suffix; // actualiza el texto (ej: "17+")
    if (v >= target) clearInterval(iv);      // detiene el intervalo al terminar
  }, 18); // cada 18ms ≈ 55fps
}

const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      // Para cada elemento con data-target en el contenedor visible
      e.target.querySelectorAll('[data-target]').forEach(n =>
        // Lanza la animación con el target y sufijo del HTML (ej: data-suffix="+")
        animCount(n, +n.dataset.target, n.dataset.suffix || '')
      );
      cntObs.unobserve(e.target); // no repetir la animación
    }
  });
}, { threshold: 0.4 });

// Observa todos los contenedores de estadísticas
document.querySelectorAll('.stat-row').forEach(r => cntObs.observe(r));


/* ════════════════════════════════════════════════════════════════
   7. FORMULARIO — Feedback visual al enviar
   handleSubmit() es llamado desde el atributo onsubmit del <form>.

   · e.preventDefault() evita que el formulario recargue la página
     (comportamiento predeterminado del navegador con action vacío)
   · Cambia el texto y color del botón a verde "enviado"
   · Desactiva el botón para evitar múltiples envíos
   · Después de 3.2 segundos restaura el estado original y
     limpia los campos del formulario con e.target.reset()

   NOTA: Este formulario es solo visual (front-end). Para que
   realmente envíe emails se necesita integrar un backend o
   un servicio como EmailJS / Formspree.
════════════════════════════════════════════════════════════════ */
function handleSubmit(e) {
  e.preventDefault(); // evita recarga de página

  const btn = document.getElementById('submitBtn');

  // Estado "enviado": verde con checkmark
  btn.textContent = '✓ ¡Mensaje enviado!';
  btn.style.background = '#22c55e'; // verde de Tailwind (color de éxito)
  btn.disabled = true;              // evita clics repetidos

  // Restaurar después de 3.2 segundos
  setTimeout(() => {
    btn.textContent = 'Enviar mensaje →'; // texto original
    btn.style.background = '';            // restaura el color definido en CSS
    btn.disabled = false;                 // reactiva el botón
    e.target.reset();                     // limpia todos los campos del formulario
  }, 3200);
}
