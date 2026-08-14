// ── Inicialização do App ─────────────────────────────────────────────────────────────
(function () {
  // Inicializa o tema imediatamente para evitar piscar
  Theme.init();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
      }
    }).catch(() => {});
  }

  // Monta as partes estáticas do layout (nav do sidebar, dica)
  buildLayout();

  // Inicializa a interatividade da topbar (nav de mês, tema, logout, hambúrguer)
  initTopbar();
  updateThemeIcon();

  // Exibe hambúrguer no mobile
  if (window.innerWidth <= 768) {
    document.getElementById("btn-hamburger").style.display = "flex";
  }
  window.addEventListener("resize", () => {
    const hb = document.getElementById("btn-hamburger");
    if (hb) hb.style.display = window.innerWidth <= 768 ? "flex" : "none";
    if (window.innerWidth > 768) document.getElementById("sidebar").classList.remove("open");
  });

  // Fecha o sidebar ao clicar fora no mobile
  document.addEventListener("click", (e) => {
    const sidebar = document.getElementById("sidebar");
    const hb = document.getElementById("btn-hamburger");
    if (
      window.innerWidth <= 768 &&
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      e.target !== hb
    ) {
      sidebar.classList.remove("open");
    }
  });

  // ── Navegação inicial ──────────────────────────────────────────────────────
  const user = Auth.get();
  if (!user) {
    Router.go("home");
  } else if (!Members.getActive()) {
    Router.go("select-profile");
  } else {
    Router.go("dashboard");
  }
})();
