/* OmiHomeStay marketing site — vanilla interactions (no dependencies) */
(function () {
  "use strict";

  /* signal that JS is alive — reveal-animation CSS is scoped to html.js */
  document.documentElement.classList.add("js");

  /* nav: solid after hero, burger on mobile */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("navBurger");
  var links = document.getElementById("navLinks");
  var waFloat = document.getElementById("waFloat");

  function onScroll() {
    var past = window.scrollY > window.innerHeight * 0.72;
    nav.classList.toggle("solid", window.scrollY > 40);
    waFloat.classList.toggle("show", past);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* reveal on scroll */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ambient video: play only while visible, never under prefers-reduced-motion */
  var vid = document.getElementById("ambient");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (vid) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !reduceMotion.matches) { vid.play().catch(function () {}); }
        else { vid.pause(); }
      });
    }, { threshold: 0.35 });
    vio.observe(vid);
    reduceMotion.addEventListener("change", function () {
      if (reduceMotion.matches) vid.pause();
    });
  }

  /* lightbox for room galleries */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCount = document.getElementById("lbCount");
  var gallery = [];
  var idx = 0;
  var lastFocus = null;
  var galleryAlt = "Room photo";

  function show(i) {
    idx = (i + gallery.length) % gallery.length;
    lbImg.src = "assets/img/" + gallery[idx] + "-1100.webp";
    lbImg.alt = galleryAlt + " — photo " + (idx + 1) + " of " + gallery.length;
    lbCount.textContent = (idx + 1) + " / " + gallery.length;
  }
  function openLb(names, trigger) {
    gallery = names;
    var thumb = trigger && trigger.querySelector && trigger.querySelector("img");
    galleryAlt = (thumb && thumb.alt) || "Room photo";
    lastFocus = trigger || document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    show(0);
    document.getElementById("lbClose").focus();
  }
  function closeLb() {
    lb.hidden = true;
    document.body.style.overflow = "";
    lbImg.removeAttribute("src");
    if (lastFocus) { lastFocus.focus(); lastFocus = null; }
  }

  document.querySelectorAll("[data-gallery] .spread-media").forEach(function (fig) {
    function open() {
      openLb(fig.closest("[data-gallery]").dataset.gallery.split(","), fig);
    }
    fig.addEventListener("click", open);
    fig.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });
  document.getElementById("lbClose").addEventListener("click", closeLb);
  document.getElementById("lbPrev").addEventListener("click", function () { show(idx - 1); });
  document.getElementById("lbNext").addEventListener("click", function () { show(idx + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
    if (e.key === "Tab") {
      /* focus trap: Tab cycles within the dialog's three buttons */
      var focusables = lb.querySelectorAll("button");
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!lb.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  });

  /* swipe in lightbox */
  var touchX = null;
  lb.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });
})();
