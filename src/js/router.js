// ── Roteador ────────────────────────────────────────────────────────────────────
const Router = {
  current: null,
  routes: {},

  register(name, fn) { this.routes[name] = fn; },

  go(page, params = {}) {
    if (page === "investments") {
      this.go("expenses", { tab: "investments" });
      return;
    }
    
    // Páginas que não exigem autenticação
    const publicPages = ["home", "auth"];
    const authOnlyPages = ["select-profile"]; // exige autenticação, mas não membro ativo

    // Proteção de rota
    if (!publicPages.includes(page) && !authOnlyPages.includes(page) && !Auth.get()) {
      this.go("home"); return;
    }
    if (!publicPages.includes(page) && !authOnlyPages.includes(page) && !Members.getActive()) {
      this.go("select-profile"); return;
    }

    // Check and update streak when navigating to members area
    if (!publicPages.includes(page) && !authOnlyPages.includes(page)) {
      const activeM = Members.getActive();
      if (activeM) {
        const streakInfo = Members.checkStreak(activeM.id);
        if (streakInfo && streakInfo.updated) {
          const sessionKey = `streak_toasted_${activeM.id}_${streakInfo.lastActiveDate}`;
          if (!sessionStorage.getItem(sessionKey)) {
            sessionStorage.setItem(sessionKey, "true");
            setTimeout(() => {
              Toast.success(`🔥 Ofensiva mantida! Você está ativo há ${streakInfo.streak} dia(s) seguido(s).`);
            }, 1000);
          }
        }
      }
    }

    this.current = page;
    setActiveNav(page);

    const layout    = document.getElementById("layout");
    const authWrap  = document.getElementById("auth-root");
    const homeWrap  = document.getElementById("home-root");

    // Oculta todos os roots primeiro
    layout.style.display   = "none";
    authWrap.style.display = "none";
    homeWrap.style.display = "none";

    if (page === "home") {
      homeWrap.style.cssText = "display:block;min-height:100vh;width:100%;position:relative";
      if (this.routes[page]) this.routes[page](homeWrap, params);
    } else if (page === "auth" || page === "select-profile") {
      authWrap.style.cssText = "display:block;min-height:100vh;width:100%;position:relative";
      if (this.routes[page]) this.routes[page](authWrap, params);
    } else {
      layout.style.display = "flex";
      const content = document.getElementById("page-content");
      // Loading indicator
      content.innerHTML = `<div class="page-loading"><div class="page-loading-spinner"></div></div>`;
      updateSidebarMember();
      updateSidebarBalance();
      updateMonthDisplay();
      // Fechar sidebar mobile ao navegar
      const sidebar = document.getElementById("sidebar");
      if (sidebar && window.innerWidth <= 768) sidebar.classList.remove("open");
      // Scroll to top
      content.scrollTop = 0;
      if (this.routes[page]) this.routes[page](content, params);
      else content.innerHTML = `<div class="empty"><p>Página não encontrada</p></div>`;
      // Animate page in
      content.classList.remove("page-enter");
      requestAnimationFrame(() => content.classList.add("page-enter"));
      // Update notification badge count on page navigation
      if (typeof renderNotifications === "function") renderNotifications();
    }
  },
};

// ── Renderização do Sidebar e Topbar ─────────────────────────────────────────────────
function buildLayout() {
  document.getElementById("sidebar-nav").innerHTML = [
    { page: "dashboard",   icon: gridIcon(),     label: "Dashboard",    key: "D" },
    { page: "incomes",     icon: trendUpIcon(),   label: "Ganhos",       key: "G" },
    { page: "expenses",    icon: trendDownIcon(), label: "Gastos",       key: "E" },
    { page: "cards",       icon: cardIcon(),      label: "Cartões",      key: "C" },
    { page: "categories",  icon: listIcon(),      label: "Categorias",   key: "K" },
    { page: "goals",       icon: targetIcon(),    label: "Metas",        key: "M" },
    { page: "reports",     icon: barChartIcon(),  label: "Relatórios",   key: "R" },
  ].map(({ page, icon, label, key }) =>
    `<button class="nav-item" data-page="${page}" data-key="${key}" onclick="Router.go('${page}')">${icon}<span>${label}</span></button>`
  ).join("");

  // Dica do Dia interativa com auto-ciclo e transição de opacidade
  let tipIdx = new Date().getDate() % DAILY_TIPS.length;
  const sidebarTip = document.getElementById("sidebar-tip");
  if (sidebarTip) {
    sidebarTip.style.cursor = "pointer";
    sidebarTip.title = "Clique para ver outra dica";

    const updateTipContent = () => {
      const tipText = DAILY_TIPS[tipIdx];
      sidebarTip.innerHTML = `<strong>💡 Dica do Dia</strong><span class="sidebar-tip-content" style="display:block; transition:opacity 0.25s ease; opacity:1;">${escHtml(tipText)}</span>`;
    };
    updateTipContent();

    sidebarTip.onclick = () => {
      const content = sidebarTip.querySelector(".sidebar-tip-content");
      if (content) {
        content.style.opacity = "0";
        setTimeout(() => {
          tipIdx = (tipIdx + 1) % DAILY_TIPS.length;
          content.textContent = DAILY_TIPS[tipIdx];
          content.style.opacity = "1";
        }, 250);
      }
    };

    // Auto ciclo a cada 15 segundos
    if (window.tipCycleInterval) clearInterval(window.tipCycleInterval);
    window.tipCycleInterval = setInterval(() => {
      if (!sidebarTip.isConnected) {
        clearInterval(window.tipCycleInterval);
        return;
      }
      sidebarTip.onclick();
    }, 15000);
  }
}

function updateSidebarMember() {
  const m = Members.getActive();
  const el = document.getElementById("sidebar-member");
  if (!el) return;
  if (m) {
    const avatarHtml = m.photo
      ? `<img src="${m.photo}" style="width:100%;height:100%;object-fit:cover;">`
      : escHtml(m.emoji || m.name[0]);
    el.innerHTML = `
      <div class="member-avatar" style="background:${escHtml(m.color || "#0d9488")}; overflow:hidden; display:flex; align-items:center; justify-content:center; padding:0;">${avatarHtml}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex; align-items:center; gap:0.15rem; flex-wrap:wrap;">
          <span class="member-name">${escHtml(m.name)}</span>
          ${m.streak > 0 ? `<span class="streak-badge" title="${m.streak} dia(s) de ofensiva">🔥 ${m.streak}</span>` : ""}
        </div>
        <div id="sidebar-balance" style="display:flex;flex-direction:column;gap:.05rem;margin-top:.1rem"></div>
      </div>
      <button class="btn-icon btn-sm" onclick="Router.go('select-profile')" title="Trocar perfil">${switchIcon()}</button>`;
  } else {
    el.innerHTML = `<button class="btn btn-sm btn-outline" onclick="Router.go('select-profile')">Selecionar perfil</button>`;
  }
}

function updateMonthDisplay() {
  const month = MonthState.get();
  const el  = document.getElementById("month-label");
  const sub = document.getElementById("month-sub");
  const name = monthName(month).charAt(0).toUpperCase() + monthName(month).slice(1);
  if (el) el.textContent = name;
  // Mostra dias restantes no mês atual, ou nada se for mês diferente
  if (sub) {
    const now = new Date();
    const [my, mm] = month.split("-").map(Number);
    if (my === now.getFullYear() && mm === now.getMonth() + 1) {
      const lastDay = new Date(my, mm, 0).getDate();
      const remaining = lastDay - now.getDate();
      sub.textContent = remaining === 0 ? "Último dia do mês" : `Faltam ${remaining} dia${remaining === 1 ? "" : "s"}`;
    } else {
      sub.textContent = "";
    }
  }
}

function updateSidebarBalance() {
  const balEl = document.getElementById("sidebar-balance");
  if (!balEl) return;
  const month = MonthState.get();
  const totalIncome = Incomes.byMonth(month).filter(i => i.received).reduce((s, i) => s + i.amount, 0);
  const totalExp = Expenses.byMonth(month).reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExp;
  const color = balance >= 0 ? "var(--income)" : "var(--expense)";
  balEl.innerHTML = `<span style="font-size:.7rem;color:var(--muted-foreground)">Saldo do mês</span><span style="font-weight:700;color:${color};font-size:.85rem">${formatBRL(balance)}</span>`;
}

// ── Navegação de mês ──────────────────────────────────────────────────────────
function initTopbar() {
  document.getElementById("btn-prev-month").addEventListener("click", () => {
    MonthState.set(prevMonth(MonthState.get()));
    updateMonthDisplay();
    if (Router.current) Router.go(Router.current);
  });
  document.getElementById("btn-next-month").addEventListener("click", () => {
    MonthState.set(nextMonth(MonthState.get()));
    updateMonthDisplay();
    if (Router.current) Router.go(Router.current);
  });
  document.getElementById("btn-theme").addEventListener("click", () => {
    Theme.toggle();
    updateThemeIcon();
  });
  document.getElementById("btn-logout").addEventListener("click", async () => {
    if (await confirmDelete("Deseja realmente sair da sua conta?", "Confirmar Saída", false)) { Auth.logout(); Router.go("home"); }
  });
  document.getElementById("btn-hamburger").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });
  
  // Search action
  const btnSearch = document.getElementById("btn-search");
  if (btnSearch) {
    btnSearch.addEventListener("click", () => {
      if (typeof openSearchModal === "function") openSearchModal();
    });
  }
  
  // Notifications action
  const btnNotif = document.getElementById("btn-notifications");
  const dropdownNotif = document.getElementById("notification-dropdown");
  if (btnNotif && dropdownNotif) {
    btnNotif.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdownNotif.style.display === "block";
      dropdownNotif.style.display = isOpen ? "none" : "block";
      if (!isOpen && typeof renderNotifications === "function") {
        renderNotifications();
      }
    });
    document.addEventListener("click", (e) => {
      if (!dropdownNotif.contains(e.target) && e.target !== btnNotif && !btnNotif.contains(e.target)) {
        dropdownNotif.style.display = "none";
      }
    });
  }

  // Keyboard Shortcuts
  document.addEventListener("keydown", (e) => {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.tagName === "SELECT" || activeEl.isContentEditable)) {
      return;
    }
    // Navegação de mês
    if (e.key === "ArrowLeft" && !e.ctrlKey && !e.metaKey) {
      const prevBtn = document.getElementById("btn-prev-month");
      if (prevBtn) prevBtn.click();
    } else if (e.key === "ArrowRight" && !e.ctrlKey && !e.metaKey) {
      const nextBtn = document.getElementById("btn-next-month");
      if (nextBtn) nextBtn.click();
    }
    // Atalhos de página (só quando o layout está visível e sem modificadores)
    if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && document.getElementById("layout").style.display !== "none") {
      const pageMap = { d: "dashboard", g: "incomes", e: "expenses", c: "cards", i: "investments", k: "categories", m: "goals", r: "reports" };
      const target = pageMap[e.key.toLowerCase()];
      if (target) { e.preventDefault(); Router.go(target); }
    }
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (typeof openSearchModal === "function") openSearchModal();
    }
  });
}

function updateThemeIcon() {
  const btn = document.getElementById("btn-theme");
  if (btn) btn.innerHTML = Theme.get() === "dark" ? sunIcon() : moonIcon();
}

// ── Ícones SVG ─────────────────────────────────────────────────────────────────
const si = (d, vb = "0 0 24 24") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;min-width:16px;min-height:16px">${d}</svg>`;
const gridIcon      = () => si(`<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>`);
const trendUpIcon   = () => si(`<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>`);
const trendDownIcon = () => si(`<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>`);
const cardIcon      = () => si(`<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>`);
const sparkIcon     = () => si(`<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>`);
const walletIcon    = () => si(`<path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>`);
const targetIcon    = () => si(`<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`);
const barChartIcon  = () => si(`<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>`);
const lightbulbIcon = () => si(`<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>`);
const plusIcon      = () => si(`<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`);
const editIcon      = () => si(`<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>`);
const trashIcon     = () => si(`<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>`);
const checkIcon     = () => si(`<polyline points="20 6 9 17 4 12"/>`);
const eyeIcon       = () => si(`<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`);
const switchIcon    = () => si(`<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>`);
const moonIcon      = () => si(`<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`);
const sunIcon       = () => si(`<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>`);
const infoIcon      = () => si(`<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>`);
const rotateIcon    = () => si(`<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>`);
const downloadIcon  = () => si(`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`);
const listIcon      = () => si('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>');
