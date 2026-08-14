// ── Toast (notificação) ─────────────────────────────────────────────────────────────────────
const Toast = {
  show(msg, type = "success") {
    const c = document.getElementById("toast-container");
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    const icons = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--income);flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>`,
      error:   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--destructive);flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      info:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary);flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    };
    t.innerHTML = `${icons[type] || icons.info}<span>${escHtml(msg)}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 3500);
  },
  success(msg) { this.show(msg, "success"); },
  error(msg) { this.show(msg, "error"); },
  info(msg) { this.show(msg, "info"); },
};

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.add("open");
    document.body.style.overflow = "hidden";
    m.setAttribute("aria-modal", "true");
    m.setAttribute("role", "dialog");
    const firstInput = m.querySelector("input:not([type=hidden]), select, textarea");
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove("open"); document.body.style.overflow = ""; }
}
function closeAllModals() {
  document.querySelectorAll(".modal-backdrop.open").forEach(m => {
    m.classList.remove("open");
  });
  document.body.style.overflow = "";
}
// Fecha ao clicar no fundo
document.addEventListener("click", e => {
  if (e.target.classList.contains("modal-backdrop")) closeAllModals();
});

// ── Gráficos SVG simples ─────────────────────────────────────────────────────────
const SVGCharts = {
  // Gráfico de pizza usando SVG
  pie(container, data, opts = {}) {
    if (!container || !data.length) return;
    const size = opts.size || 220;
    const cx = size / 2, cy = size / 2, r = size * 0.38;
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return;
    let startAngle = -Math.PI / 2;
    let paths = "";
    data.forEach((d, i) => {
      const angle = (d.value / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;
      const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const pct = ((d.value / total) * 100).toFixed(1);
      paths += `<path class="chart-pie-slice" d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z" fill="${d.color}" opacity=".9" data-name="${escHtml(d.name)}" data-value="${d.value}" data-pct="${pct}" style="cursor:pointer; transition: opacity 0.15s;"></path>`;
      startAngle = endAngle;
    });
    // Legenda
    const legend = data.map(d => `<div style="display:flex;align-items:center;gap:.35rem;font-size:.75rem;"><span style="width:10px;height:10px;border-radius:2px;background:${d.color};flex-shrink:0"></span><span>${escHtml(d.name)}</span><span style="margin-left:auto;font-weight:600">${formatBRL(d.value)}</span></div>`).join("");
    container.innerHTML = `<div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap">
      <svg width="${size}" height="${size}" style="flex-shrink:0">${paths}</svg>
      <div style="flex:1;min-width:140px;display:flex;flex-direction:column;gap:.4rem">${legend}</div>
    </div>`;

    // Tooltip logic
    const tooltip = getOrCreateTooltip();
    container.querySelectorAll(".chart-pie-slice").forEach(path => {
      path.addEventListener("mouseenter", (e) => {
        path.style.opacity = "1";
        const name = path.dataset.name;
        const val = parseFloat(path.dataset.value);
        const pct = path.dataset.pct;
        tooltip.innerHTML = `<div style="font-weight:600; margin-bottom: 0.15rem;">${name}</div><div>${formatBRL(val)} (${pct}%)</div>`;
        tooltip.style.display = "block";
      });
      path.addEventListener("mousemove", (e) => {
        tooltip.style.left = (e.pageX + 10) + "px";
        tooltip.style.top = (e.pageY + 10) + "px";
      });
      path.addEventListener("mouseleave", () => {
        path.style.opacity = ".9";
        tooltip.style.display = "none";
      });
    });
  },

  // Gráfico de barras usando divs
  bar(container, data, opts = {}) {
    if (!container || !data.length) return;
    const max = Math.max(...data.map(d => d.value), 1);
    const bars = data.map(d => {
      const pct = (d.value / max * 100).toFixed(1);
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:.3rem;flex:1;min-width:50px">
        <span style="font-size:.7rem;font-weight:600;color:var(--foreground)">${formatBRL(d.value)}</span>
        <div style="width:100%;background:var(--muted);border-radius:.4rem .4rem 0 0;height:160px;display:flex;align-items:flex-end;overflow:hidden">
          <div style="width:100%;height:${pct}%;background:${d.color || "var(--gradient-primary)"};border-radius:.4rem .4rem 0 0;transition:height .4s;min-height:4px"></div>
        </div>
        <span style="font-size:.72rem;color:var(--muted-foreground);text-align:center;word-break:break-word;max-width:70px">${escHtml(d.name)}</span>
      </div>`;
    }).join("");
    container.innerHTML = `<div style="display:flex;align-items:flex-end;gap:.5rem;padding:.5rem 0;overflow-x:auto">${bars}</div>`;
  },

  // Gráfico de linha usando SVG
  line(container, datasets, labels, opts = {}) {
    if (!container || !labels.length) return;
    const W = container.clientWidth || 500, H = 200, pad = { t: 20, r: 20, b: 40, l: 55 };
    const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
    const allVals = datasets.flatMap(ds => ds.values);
    const maxV = Math.max(...allVals, 1);
    const minV = Math.min(...allVals.filter(v => v > 0), 0);
    const xStep = labels.length > 1 ? iW / (labels.length - 1) : iW;
    let svg = `<svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    // Grade
    [0, .25, .5, .75, 1].forEach(f => {
      const y = pad.t + iH * (1 - f);
      const val = (maxV * f).toFixed(0);
      svg += `<line x1="${pad.l}" y1="${y}" x2="${W - pad.r}" y2="${y}" stroke="var(--border)" stroke-width="1"/>`;
      svg += `<text x="${pad.l - 6}" y="${y + 4}" font-size="10" text-anchor="end" fill="var(--muted-foreground)">R$${Number(val) >= 1000 ? (Number(val)/1000).toFixed(0)+"k" : val}</text>`;
    });
    // Rótulos do eixo X
    labels.forEach((l, i) => {
      const x = pad.l + i * xStep;
      svg += `<text x="${x}" y="${H - 8}" font-size="10" text-anchor="middle" fill="var(--muted-foreground)">${escHtml(l)}</text>`;
    });
    // Linhas
    datasets.forEach(ds => {
      const pts = ds.values.map((v, i) => {
        const x = pad.l + i * xStep;
        const y = pad.t + iH * (1 - (v - minV) / (maxV - minV || 1));
        return `${x},${y}`;
      }).join(" ");
      const ptsArr = ds.values.map((v, i) => ({ x: pad.l + i * xStep, y: pad.t + iH * (1 - (v - minV) / (maxV - minV || 1)) }));
      if (ptsArr.length > 1) svg += `<polyline points="${pts}" fill="none" stroke="${ds.color}" stroke-width="2.5" stroke-linejoin="round"/>`;
      ptsArr.forEach(p => { svg += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${ds.color}"/>`; });
    });
    svg += `</svg>`;
    // Legenda
    const leg = datasets.map(ds => `<span style="display:inline-flex;align-items:center;gap:.3rem;font-size:.75rem"><span style="width:12px;height:3px;border-radius:2px;background:${ds.color};display:inline-block"></span>${escHtml(ds.label)}</span>`).join("");
    container.innerHTML = svg + (datasets.length > 1 ? `<div style="display:flex;gap:1rem;justify-content:center;margin-top:.5rem;flex-wrap:wrap">${leg}</div>` : "");
  },
};

// ── Auxiliar de abas ───────────────────────────────────────────────────────────────
function initTabs(containerSel) {
  const container = document.querySelector(containerSel);
  if (!container) return;
  container.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      container.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b === btn));
      container.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === target));
    });
  });
}

// ── Diálogo de confirmação ────────────────────────────────────────────────────────────
function confirmDelete(msg, title = "Confirmar Exclusão", isDestructive = true) {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop open confirm-modal-backdrop";
    backdrop.style.zIndex = "9999";
    const buttonClass = isDestructive ? "btn-danger" : "btn-primary";
    const buttonStyle = isDestructive ? "background:var(--destructive);" : "background:var(--primary);";
    backdrop.innerHTML = `
      <div class="modal open" style="max-width:400px; animation: modalEnter .3s ease;">
        <div class="modal-header">
          <span class="modal-title" style="font-weight:700;">${escHtml(title)}</span>
          <button class="modal-close" id="confirm-modal-close">×</button>
        </div>
        <div class="modal-body" style="padding: 1.5rem 0; color: var(--foreground); font-size: 0.95rem;">
          ${escHtml(msg || "Tem certeza?")}
        </div>
        <div class="form-actions" style="margin-top: 0; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button class="btn ${buttonClass}" id="confirm-modal-yes" style="${buttonStyle}">Confirmar</button>
          <button class="btn btn-outline" id="confirm-modal-no">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    const yesBtn = backdrop.querySelector("#confirm-modal-yes");
    const noBtn = backdrop.querySelector("#confirm-modal-no");
    const closeBtn = backdrop.querySelector("#confirm-modal-close");

    if (noBtn) noBtn.focus();

    const cleanup = (value) => {
      backdrop.remove();
      resolve(value);
    };

    yesBtn.onclick = () => cleanup(true);
    noBtn.onclick = () => cleanup(false);
    closeBtn.onclick = () => cleanup(false);
    backdrop.onclick = (e) => {
      if (e.target === backdrop) cleanup(false);
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        document.removeEventListener("keydown", handleEsc);
        cleanup(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
  });
}

function showAlert(msg, title = "Aviso") {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop open confirm-modal-backdrop";
    backdrop.style.zIndex = "9999";
    backdrop.innerHTML = `
      <div class="modal open" style="max-width:400px; animation: modalEnter .3s ease;">
        <div class="modal-header">
          <span class="modal-title" style="font-weight:700;">${escHtml(title)}</span>
          <button class="modal-close" id="alert-modal-close">×</button>
        </div>
        <div class="modal-body" style="padding: 1.5rem 0; color: var(--foreground); font-size: 0.95rem;">
          ${escHtml(msg)}
        </div>
        <div class="form-actions" style="margin-top: 0; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button class="btn btn-primary" id="alert-modal-ok" style="background:var(--primary);">Ok</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    const okBtn = backdrop.querySelector("#alert-modal-ok");
    const closeBtn = backdrop.querySelector("#alert-modal-close");

    if (okBtn) okBtn.focus();

    const cleanup = () => {
      backdrop.remove();
      resolve();
    };

    okBtn.onclick = cleanup;
    closeBtn.onclick = cleanup;
    backdrop.onclick = (e) => {
      if (e.target === backdrop) cleanup();
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        document.removeEventListener("keydown", handleEsc);
        cleanup();
      }
    };
    document.addEventListener("keydown", handleEsc);
  });
}

// ── Destaque do nav ─────────────────────────────────────────────────────────────
function setActiveNav(page) {
  document.querySelectorAll(".nav-item").forEach(n => {
    const isActive = n.dataset.page === page;
    n.classList.toggle("active", isActive);
    if (isActive) {
      n.setAttribute("aria-current", "page");
    } else {
      n.removeAttribute("aria-current");
    }
  });
}

// ── Global Key Esc handler for standard Modals ─────────────────────────────────
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const openModals = document.querySelectorAll(".modal-backdrop.open");
    // Exclude confirm-modal-backdrop since it handles its own Esc key
    const targetModals = Array.from(openModals).filter(m => !m.classList.contains("confirm-modal-backdrop"));
    if (targetModals.length > 0) {
      const lastModal = targetModals[targetModals.length - 1];
      const closeBtn = lastModal.querySelector(".modal-close");
      if (closeBtn) {
        closeBtn.click();
      } else {
        closeModal(lastModal.id);
      }
    }
  }
});

// ── Tooltip Customizado Helper ────────────────────────────────────────────────
function getOrCreateTooltip() {
  let el = document.getElementById("chart-tooltip");
  if (!el) {
    el = document.createElement("div");
    el.id = "chart-tooltip";
    el.style.position = "absolute";
    el.style.display = "none";
    el.style.background = "var(--card)";
    el.style.color = "var(--foreground)";
    el.style.border = "1px solid var(--border)";
    el.style.borderRadius = "0.5rem";
    el.style.padding = "0.5rem 0.75rem";
    el.style.fontSize = "0.75rem";
    el.style.fontWeight = "500";
    el.style.pointerEvents = "none";
    el.style.boxShadow = "var(--shadow-md)";
    el.style.zIndex = "10000";
    document.body.appendChild(el);
  }
  return el;
}

// ── Animação Count-up Helper ──────────────────────────────────────────────────
function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentVal = progress * (end - start) + start;
    element.textContent = formatBRL(currentVal);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// ── Busca Global de Transações (Ctrl+K) ─────────────────────────────────────────
function openSearchModal() {
  let backdrop = document.getElementById("modal-search");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.id = "modal-search";
    backdrop.innerHTML = `
      <div class="modal" style="max-width: 500px;">
        <div class="modal-header">
          <span class="modal-title">Busca Global de Transações</span>
          <button class="modal-close" onclick="closeModal('modal-search')">×</button>
        </div>
        <div class="form-group">
          <input type="text" id="search-input" class="form-input" placeholder="Digite para buscar receitas ou despesas..." autocomplete="off">
        </div>
        <div id="search-results" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;"></div>
      </div>
    `;
    document.body.appendChild(backdrop);
    
    const input = backdrop.querySelector("#search-input");
    input.addEventListener("input", (e) => {
      performGlobalSearch(e.target.value);
    });
  }
  
  openModal("modal-search");
  const input = document.getElementById("search-input");
  if (input) {
    input.value = "";
    input.focus();
  }
  const results = document.getElementById("search-results");
  if (results) results.innerHTML = "";
}

function performGlobalSearch(query) {
  const resultsContainer = document.getElementById("search-results");
  if (!resultsContainer) return;
  
  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    resultsContainer.innerHTML = `<p style="text-align:center; font-size:0.85rem; color:var(--muted-foreground)">Digite pelo menos 2 caracteres...</p>`;
    return;
  }
  
  const incomes = Incomes.all().map(i => ({ ...i, type: "income", title: i.source, dateVal: i.expectedDate }));
  const expenses = Expenses.all().map(e => ({ ...e, type: "expense", title: e.description, dateVal: e.date }));
  
  const allTransactions = [...incomes, ...expenses];
  const filtered = allTransactions.filter(t => t.title.toLowerCase().includes(q));
  
  filtered.sort((a, b) => b.dateVal.localeCompare(a.dateVal));
  
  const limit = 8;
  const subset = filtered.slice(0, limit);
  
  if (subset.length === 0) {
    resultsContainer.innerHTML = `<p style="text-align:center; font-size:0.85rem; color:var(--muted-foreground)">Nenhuma transação encontrada</p>`;
    return;
  }
  
  resultsContainer.innerHTML = subset.map(t => {
    const isInc = t.type === "income";
    const colorClass = isInc ? "c-income" : "c-expense";
    const badgeText = isInc ? "Receita" : "Despesa";
    const badgeClass = isInc ? "badge-success" : "badge-danger";
    return `
      <div class="list-item" style="padding: 0.5rem 0.75rem; border-color: var(--border); background: var(--card);">
        <div class="list-item-main">
          <div class="list-item-title" style="font-size: 0.85rem;">${escHtml(t.title)}</div>
          <div class="list-item-sub" style="font-size: 0.72rem; display: flex; align-items: center; gap: 0.4rem;">
            <span class="badge ${badgeClass}" style="font-size: 0.65rem; padding: 0.05rem 0.35rem;">${badgeText}</span>
            <span>${formatDateBR(t.dateVal)}</span>
            <span>•</span>
            <span>${escHtml(monthNameShort(t.month))}</span>
          </div>
        </div>
        <div class="list-item-amount ${colorClass}" style="font-size: 0.9rem;">${formatBRL(t.amount)}</div>
        <div class="list-actions">
          <button class="btn btn-sm btn-outline" style="padding: 0.2rem 0.4rem; font-size: 0.72rem;" onclick="navigateToTransaction('${t.type}', '${t.month}', '${t.id}')">Ir para</button>
        </div>
      </div>
    `;
  }).join("");
}

function navigateToTransaction(type, month, id) {
  MonthState.set(month);
  updateMonthDisplay();
  const page = type === "income" ? "incomes" : "expenses";
  Router.go(page);
  closeModal("modal-search");
  
  setTimeout(() => {
    const elementId = `${type}-item-${id}`;
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight");
      setTimeout(() => el.classList.remove("highlight"), 2100);
    }
  }, 150);
}

// ── Central de Notificações ───────────────────────────────────────────────────
function getNotificationsList() {
  const alerts = [];
  const month = MonthState.get();
  
  const cards = Cards.all();
  const allExp = Expenses.all();
  const fixedActive = FixedExpenses.active();
  
  cards.forEach(card => {
    const monthExp = allExp.filter(e => e.cardId === card.id && e.month === month && !e.paid);
    const fixedOnCard = fixedActive.filter(f => f.paymentMethod === "credit" && f.cardId === card.id);
    const monthUsed = monthExp.reduce((s, e) => s + e.amount, 0) + fixedOnCard.reduce((s, f) => s + f.amount, 0);
    const allUnpaid = allExp.filter(e => e.cardId === card.id && !e.paid).reduce((s, e) => s + e.amount, 0) + fixedOnCard.reduce((s, f) => s + f.amount, 0);
    const pct = card.limit > 0 ? (allUnpaid / card.limit * 100) : 0;
    
    if (pct >= 90) {
      alerts.push({
        type: "card",
        icon: "💳",
        text: `Limite do cartão ${card.name} está ${pct.toFixed(0)}% utilizado.`,
        page: "cards"
      });
    }
  });
  
  const today = new Date();
  if (today.getDate() >= 25) {
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    fixedActive.forEach(fe => {
      if (!PaidFixedExpenses.isPaid(fe.id, currentMonth)) {
        alerts.push({
          type: "fixed",
          icon: "📌",
          text: `Despesa fixa "${fe.name}" pendente de pagamento.`,
          page: "expenses"
        });
      }
    });
  }
  
  const curIncomes = Incomes.byMonth(month).filter(i => i.received);
  const curExpenses = Expenses.byMonth(month);
  const totalIncome = curIncomes.reduce((s, i) => s + i.amount, 0);
  const totalExp = curExpenses.reduce((s, e) => s + e.amount, 0);
  const savings = totalIncome - totalExp;
  
  const goals = Goals.byMonth(month);
  goals.forEach(g => {
    let current = 0, label = "";
    if (g.category === "savings") { current = savings; label = "Poupança"; }
    else if (g.category === "leisure") { current = curExpenses.filter(e => e.category === "leisure").reduce((s, e) => s + e.amount, 0); label = "Lazer"; }
    else if (g.category === "credit") { current = curExpenses.filter(e => e.paymentMethod === "credit").reduce((s, e) => s + e.amount, 0); label = "Crédito"; }
    else if (g.category === "investment") { current = curExpenses.filter(e => e.category === "investment").reduce((s, e) => s + e.amount, 0); label = "Investimentos"; }
    
    const pct = g.target > 0 ? (current / g.target * 100) : 0;
    if (pct >= 90) {
      alerts.push({
        type: "goal",
        icon: "🎯",
        text: `Meta de ${label} atingiu ${pct.toFixed(0)}% do limite.`,
        page: "goals"
      });
    }
  });
  
  return alerts;
}

function renderNotifications() {
  const badge = document.getElementById("notification-badge");
  const list = document.getElementById("notification-list");
  if (!badge || !list) return;
  
  const alerts = getNotificationsList();
  if (alerts.length > 0) {
    badge.textContent = alerts.length;
    badge.style.display = "flex";
    list.innerHTML = alerts.map(a => `
      <div style="padding:0.75rem 1rem; border-bottom:1px solid var(--border); display:flex; gap:0.5rem; align-items:flex-start; cursor:pointer;" onclick="clickNotification('${a.page}')">
        <span style="font-size:1.1rem; flex-shrink:0;">${a.icon}</span>
        <div style="font-size:0.8rem; line-height:1.3; color:var(--foreground);">${escHtml(a.text)}</div>
      </div>
    `).join("");
  } else {
    badge.style.display = "none";
    list.innerHTML = `<p style="text-align:center; color:var(--muted-foreground); font-size:0.8rem; padding:1.5rem 1rem;">Nenhum alerta pendente</p>`;
  }
}

function clickNotification(page) {
  const dropdown = document.getElementById("notification-dropdown");
  if (dropdown) dropdown.style.display = "none";
  Router.go(page);
}

// ── FAB Ações ──────────────────────────────────────────────────────────────────
function fabAction(type) {
  const fabMenu = document.getElementById("fab-menu");
  const fabIcon = document.getElementById("main-fab-icon");
  if (fabMenu) fabMenu.style.display = "none";
  if (fabIcon) fabIcon.style.transform = "rotate(0deg)";
  
  if (type === "income") {
    if (Router.current !== "incomes") {
      Router.go("incomes");
    }
    setTimeout(() => {
      openModal("modal-income");
    }, 120);
  } else if (type === "expense") {
    if (Router.current !== "expenses") {
      Router.go("expenses");
    }
    setTimeout(() => {
      openVarModal();
    }, 120);
  }
}

// ── Toast Sugestão Gasto Fixo ──────────────────────────────────────────────────
Toast.suggestFixed = function(desc, amount, category, paymentMethod, cardId) {
  const c = document.getElementById("toast-container");
  if (!c) return;
  const t = document.createElement("div");
  t.className = `toast info`;
  t.style.maxWidth = "350px";
  t.style.flexDirection = "column";
  t.style.alignItems = "stretch";
  t.style.gap = "0.5rem";
  
  t.innerHTML = `
    <div style="display:flex; gap:0.5rem; align-items:center;">
      <span style="font-size:1rem">💡</span>
      <span style="font-weight:600; font-size:0.8rem;">Despesa Recorrente!</span>
    </div>
    <div style="font-size:0.75rem; color:var(--foreground);">Este gasto se repete há 3 meses. Quer transformá-lo em uma Despesa Fixa?</div>
    <div style="display:flex; gap:0.4rem; margin-top:0.25rem;">
      <button class="btn btn-sm btn-primary" id="btn-toast-convert" style="font-size:0.7rem; padding:0.2rem 0.5rem;">Sim</button>
      <button class="btn btn-sm btn-outline" id="btn-toast-dismiss" style="font-size:0.7rem; padding:0.2rem 0.5rem;">Agora não</button>
    </div>
  `;
  c.appendChild(t);
  
  const btnDismiss = t.querySelector("#btn-toast-dismiss");
  const btnConvert = t.querySelector("#btn-toast-convert");
  
  const dismiss = () => {
    t.classList.add("out");
    setTimeout(() => t.remove(), 300);
  };
  
  btnDismiss.onclick = dismiss;
  btnConvert.onclick = () => {
    dismiss();
    if (Router.current !== "expenses") {
      Router.go("expenses");
    }
    const fixedTabBtn = document.querySelector('[data-tab="tab-fixed"]');
    if (fixedTabBtn) {
      fixedTabBtn.click();
    }
    
    setTimeout(() => {
      openFixedModal();
      document.getElementById("fix-name").value = desc;
      document.getElementById("fix-amount").value = amount;
      if (document.getElementById("fix-cat")) document.getElementById("fix-cat").value = category === "leisure" ? "other" : category;
      if (document.getElementById("fix-pay")) document.getElementById("fix-pay").value = paymentMethod;
      toggleFixedCardSelect();
      if (cardId && document.getElementById("fix-card")) document.getElementById("fix-card").value = cardId;
    }, 150);
  };
  
  setTimeout(() => {
    if (t.parentNode) dismiss();
  }, 8000);
};

// ── Inicialização do FAB ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const mainFab = document.getElementById("main-fab");
  const fabMenu = document.getElementById("fab-menu");
  const fabIcon = document.getElementById("main-fab-icon");
  if (mainFab && fabMenu) {
    mainFab.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = fabMenu.style.display === "flex";
      fabMenu.style.display = isOpen ? "none" : "flex";
      if (isOpen) {
        fabIcon.style.transform = "rotate(0deg)";
      } else {
        fabIcon.style.transform = "rotate(45deg)";
      }
    });
    document.addEventListener("click", (e) => {
      if (!fabMenu.contains(e.target) && e.target !== mainFab) {
        fabMenu.style.display = "none";
        fabIcon.style.transform = "rotate(0deg)";
      }
    });
  }
});
