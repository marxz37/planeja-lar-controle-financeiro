// ── Página de Cartões ────────────────────────────────────────────────────────────────
Router.register("cards", (container) => { renderCards(container); });

function renderCards(container) {
  const month = MonthState.get();
  const cards = Cards.all();
  const allExp = Expenses.all();
  const fixedActive = FixedExpenses.active();

  const getCardData = (card) => {
    const monthExp = allExp.filter(e => e.cardId === card.id && e.month === month && !e.paid);
    const fixedOnCard = fixedActive.filter(f => f.paymentMethod === "credit" && f.cardId === card.id);
    const monthUsed = monthExp.reduce((s, e) => s + e.amount, 0) + fixedOnCard.reduce((s, f) => s + f.amount, 0);
    const allUnpaid = allExp.filter(e => e.cardId === card.id && !e.paid).reduce((s, e) => s + e.amount, 0) + fixedOnCard.reduce((s, f) => s + f.amount, 0);
    const pct = Math.min(allUnpaid / card.limit * 100, 100);
    const installCount = allExp.filter(e => e.cardId === card.id && e.month === month && e.isInstallment && !e.paid).length;
    const isPaid = PaidInvoices.isPaid(card.id, month);
    return { monthUsed, allUnpaid, pct, installCount, isPaid, fixedTotal: fixedOnCard.reduce((s, f) => s + f.amount, 0) };
  };

  const cardHtml = cards.length === 0
    ? `<div class="empty-state-wrapper">
        <div class="empty-state-icon-container">
          ${cardIcon()}
        </div>
        <div class="empty-state-title">Nenhum cartão cadastrado</div>
        <div class="empty-state-desc">Cadastre os cartões de crédito da família para acompanhar limites, vencimentos e o fechamento das faturas.</div>
        <button class="btn btn-primary empty-state-action-btn" onclick="openModal('modal-card')">
          ${plusIcon()} Cadastrar um cartão
        </button>
      </div>`
    : `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem">${cards.map(card => {
        const { monthUsed, allUnpaid, pct, installCount, isPaid, fixedTotal } = getCardData(card);
        const isHigh = pct >= 80;
        const available = card.limit - allUnpaid;
        const future = allUnpaid - monthUsed;
        return `<div class="credit-card-visual">
          <div class="cc-row">
            <div>${cardIcon()}</div>
            <div style="display:flex;gap:.3rem">
              <button class="btn btn-ghost" style="color:#fff;opacity:.8" onclick="editCard('${card.id}')">${editIcon()}</button>
              <button class="btn btn-ghost" style="color:#fff;opacity:.8" onclick="deleteCard('${card.id}')">${trashIcon()}</button>
            </div>
          </div>
          <div class="cc-name">${escHtml(card.name)}</div>
          <div class="cc-sub">Fatura ${monthName(month)}${isPaid ? ' • <span style="color:#4ade80;font-weight:600">✓ Paga</span>' : ''}</div>
          <div style="margin-top:.75rem;font-size:.8rem;opacity:.85;display:flex;flex-direction:column;gap:.2rem">
            <div style="display:flex;justify-content:space-between"><span>Fatura este mês</span><span style="font-weight:700">${formatBRL(monthUsed)}</span></div>
            ${fixedTotal > 0 ? `<div style="display:flex;justify-content:space-between;opacity:.8"><span>↺ Fixos</span><span>${formatBRL(fixedTotal)}</span></div>` : ""}
            <div style="display:flex;justify-content:space-between"><span>Disponível</span><span style="font-weight:700">${formatBRL(available)}</span></div>
            <div style="display:flex;justify-content:space-between"><span>Limite total</span><span>${formatBRL(card.limit)}</span></div>
            ${future > 0 ? `<div style="display:flex;justify-content:space-between;color:#fde68a"><span>Parcelas futuras</span><span>${formatBRL(future)}</span></div>` : ""}
          </div>
          <div class="cc-bar"><div class="cc-bar-fill ${isHigh ? "danger" : ""}" style="width:${pct}%"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:.75rem;opacity:.8;margin-bottom:.5rem">
            <span>${pct.toFixed(1)}% utilizado</span>
            ${isHigh ? `<span style="color:#fca5a5">⚠ Alto uso</span>` : ""}
          </div>
          <div style="font-size:.78rem;opacity:.8;margin-bottom:.75rem">Fecha dia ${card.closingDay} • Vence dia ${card.dueDay}${installCount > 0 ? ` • ${installCount} parcelamento(s)` : ""}</div>
          <div class="cc-actions">
            <button class="btn cc-btn-white" onclick="viewCardExpenses('${card.id}')">${eyeIcon()} Ver Gastos</button>
            ${!isPaid && monthUsed > 0 ? `<button class="btn cc-btn-green" onclick="payInvoice('${card.id}')">${checkIcon()} Pagar</button>` : ""}
          </div>
        </div>`;
      }).join("")}</div>`;

  container.innerHTML = `
  <div class="page-header">
    <div><h1>Cartões de Crédito</h1><p>Gerencie seus cartões e limites</p></div>
    <button class="btn btn-primary" onclick="openModal('modal-card')">${plusIcon()} Adicionar Cartão</button>
  </div>
  <div id="cards-container">${cardHtml}</div>

  <div class="modal-backdrop" id="modal-card">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title" id="card-modal-title">Adicionar Cartão</span>
        <button class="modal-close" onclick="closeModal('modal-card');clearCardForm()">×</button>
      </div>
      <input type="hidden" id="card-edit-id">
      <div class="form-group"><label class="form-label">Nome *</label><input id="card-name" class="form-input" placeholder="Ex: Nubank, Itaú"></div>
      <div class="form-group"><label class="form-label">Limite *</label><input id="card-limit" class="form-input" type="number" step="0.01" placeholder="0.00"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Dia Fechamento *</label><input id="card-close" class="form-input" type="number" min="1" max="31"></div>
        <div class="form-group"><label class="form-label">Dia Vencimento *</label><input id="card-due" class="form-input" type="number" min="1" max="31"></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveCard()">Salvar</button>
        <button class="btn btn-outline" onclick="closeModal('modal-card');clearCardForm()">Cancelar</button>
      </div>
    </div>
  </div>

  <div class="modal-backdrop" id="modal-card-expenses">
    <div class="modal" style="max-width:520px">
      <div class="modal-header"><span class="modal-title" id="card-exp-title">Gastos do Cartão</span><button class="modal-close" onclick="closeModal('modal-card-expenses')">×</button></div>
      <div id="card-exp-list"></div>
    </div>
  </div>`;
}

function saveCard() {
  const name = document.getElementById("card-name").value.trim();
  const limit = parseFloat(document.getElementById("card-limit").value);
  const closingDay = parseInt(document.getElementById("card-close").value);
  const dueDay = parseInt(document.getElementById("card-due").value);
  const editId = document.getElementById("card-edit-id").value;
  if (!name || !limit || !closingDay || !dueDay) { Toast.error("Preencha todos os campos"); return; }
  const data = { name, limit, closingDay, dueDay };
  if (editId) { Cards.update(editId, data); Toast.success("Cartão atualizado!"); }
  else { Cards.add(data); Toast.success("Cartão adicionado!"); }
  closeModal("modal-card"); clearCardForm(); renderCards(document.getElementById("page-content"));
}
function editCard(id) {
  const c = Cards.all().find(x => x.id === id);
  if (!c) return;
  document.getElementById("card-modal-title").textContent = "Editar Cartão";
  document.getElementById("card-edit-id").value = id;
  document.getElementById("card-name").value = c.name;
  document.getElementById("card-limit").value = c.limit;
  document.getElementById("card-close").value = c.closingDay;
  document.getElementById("card-due").value = c.dueDay;
  openModal("modal-card");
}
async function deleteCard(id) {
  if (Expenses.all().some(e => e.cardId === id)) { Toast.error("Não é possível excluir cartão com gastos registrados"); return; }
  if (!await confirmDelete("Remover este cartão?")) return;
  Cards.remove(id); Toast.success("Cartão removido!"); renderCards(document.getElementById("page-content"));
}
function clearCardForm() {
  document.getElementById("card-modal-title").textContent = "Adicionar Cartão";
  document.getElementById("card-edit-id").value = "";
  ["card-name","card-limit","card-close","card-due"].forEach(id => { const el = document.getElementById(id); if(el) el.value = ""; });
}
function payInvoice(cardId) {
  const month = MonthState.get();
  const exp = Expenses.all().filter(e => e.cardId === cardId && e.month === month && !e.paid);
  const fixed = FixedExpenses.active().filter(f => f.paymentMethod === "credit" && f.cardId === cardId);
  const total = exp.reduce((s, e) => s + e.amount, 0) + fixed.reduce((s, f) => s + f.amount, 0);
  exp.forEach(e => Expenses.update(e.id, { paid: true }));
  PaidInvoices.markPaid(cardId, month);
  Toast.success(`Fatura paga: ${formatBRL(total)}`);
  renderCards(document.getElementById("page-content"));
}
function viewCardExpenses(cardId) {
  const month = MonthState.get();
  const card = Cards.all().find(c => c.id === cardId);
  const exp = Expenses.all().filter(e => e.cardId === cardId && e.month === month);
  const fixed = FixedExpenses.active().filter(f => f.paymentMethod === "credit" && f.cardId === cardId);
  document.getElementById("card-exp-title").textContent = `Gastos — ${card?.name || "Cartão"}`;
  const total = exp.reduce((s, e) => s + e.amount, 0) + fixed.reduce((s, f) => s + f.amount, 0);
  document.getElementById("card-exp-list").innerHTML = exp.length === 0 && fixed.length === 0
    ? `<p style="text-align:center;color:var(--muted-foreground);padding:2rem">Nenhum gasto este mês</p>`
    : `<div class="list">${[...exp.map(e => `<div class="list-item"><div class="list-item-main"><div class="list-item-title">${escHtml(e.description)}${e.isInstallment?` <span class="badge badge-parcela">${e.installmentNumber}/${e.installments}x</span>`:""}</div><div class="list-item-sub">${formatDateBR(e.date)}</div></div><div class="list-item-amount ${e.paid?"c-income":"c-expense"}">${formatBRL(e.amount)}</div></div>`),
      ...fixed.map(f => `<div class="list-item"><div class="list-item-main"><div class="list-item-title">↺ ${escHtml(f.name)}</div><div class="list-item-sub">Fixo • Dia ${f.billingDay}</div></div><div class="list-item-amount c-expense">${formatBRL(f.amount)}</div></div>`)
    ].join("")}</div><div style="display:flex;justify-content:space-between;font-weight:700;padding:1rem 0 0;border-top:1px solid var(--border);margin-top:.5rem"><span>Total</span><span>${formatBRL(total)}</span></div>`;
  openModal("modal-card-expenses");
}

// ── Página de Investimentos ──────────────────────────────────────────────────────────
Router.register("investments", (container) => { renderInvestments(container); });
function renderInvestments(container, isTab = false) {
  const month = MonthState.get();
  const members = Members.all();
  const all = Investments.all();
  const monthly = Investments.byMonth(month);
  const total = all.reduce((s, i) => s + i.amount, 0);
  const monthTotal = monthly.reduce((s, i) => s + i.amount, 0);

  const addBtn = document.getElementById("btn-add-expense");
  if (isTab && addBtn) {
    if (monthly.length === 0) {
      addBtn.style.display = "none";
    } else {
      addBtn.style.display = "";
    }
  }
  const types = [...new Set(all.map(i => i.type))];

  // ── Gastos classificados como "Investimento" ─────────────────────────────
  const expInvestAll = Expenses.all().filter(e => e.category === "investment");
  const expInvestMonth = Expenses.byMonth(month).filter(e => e.category === "investment");
  const expInvestTotal = expInvestAll.reduce((s, e) => s + e.amount, 0);
  const expInvestMonthTotal = expInvestMonth.reduce((s, e) => s + e.amount, 0);

  const memberBadge = (id) => Members.getBadge(id);

  // Lista de aportes via gastos (mês atual)
  const expInvestList = expInvestMonth.length === 0
    ? `<div class="empty-state-wrapper" style="padding:2.5rem 1.5rem">
        <div class="empty-state-icon-container" style="width:48px;height:48px;margin-bottom:0.75rem">
          ${trendDownIcon()}
        </div>
        <div class="empty-state-title" style="font-size:0.95rem">Nenhum aporte via despesas</div>
        <div class="empty-state-desc" style="font-size:0.8rem;max-width:280px;margin-bottom:1rem">Aportes diários podem ser registrados como gastos cotidianos selecionando a categoria de Investimento.</div>
        <button class="btn btn-outline btn-sm" onclick="const t = document.querySelector('[data-tab=\\'tab-var\\']'); if(t) t.click();">
          Registrar aporte em Gastos
        </button>
      </div>`
    : `<div class="list">${expInvestMonth.map(e => `
        <div class="list-item" id="invest-exp-item-${e.id}">
          <div class="list-item-main">
            <div class="list-item-title" style="display:flex;align-items:center;gap:.4rem">
              ${escHtml(e.description)}
              <span class="badge" style="background:hsl(38,92%,50%,0.15);color:hsl(38,92%,60%);font-size:.68rem">Gasto</span>
            </div>
            <div class="list-item-sub" style="display:flex;gap:.35rem;flex-wrap:wrap;align-items:center">
              <span>${formatDateBR(e.date)}</span>
              <span style="font-size:.72rem;color:var(--muted-foreground)">•</span>
              <span style="font-size:.72rem;color:var(--muted-foreground)">${e.paymentMethod === "credit" ? "Crédito" : e.paymentMethod === "debit" ? "Débito" : e.paymentMethod}</span>
              ${memberBadge(e.memberId)}
            </div>
          </div>
          <div class="list-item-amount c-invest">${formatBRL(e.amount)}</div>
          <div class="list-actions">
            <button class="btn-ghost btn" title="Ver em Gastos" onclick="Router.go('expenses')" style="font-size:.75rem;opacity:.7">${editIcon()}</button>
          </div>
        </div>`).join("")}</div>`;

  // Lista de investimentos registrados (mês atual)
  const investList = monthly.length === 0
    ? `<div class="empty-state-wrapper">
        <div class="empty-state-icon-container">
          ${walletIcon()}
        </div>
        <div class="empty-state-title">Nenhum investimento registrado</div>
        <div class="empty-state-desc">Comece a poupar e planejar seu futuro! Cadastre seus investimentos (CDB, Tesouro Direto, Ações) e acompanhe seu rendimento.</div>
        <button class="btn btn-primary empty-state-action-btn" onclick="openModal('modal-invest')">
          ${plusIcon()} Adicionar primeiro investimento
        </button>
      </div>`
    : `<div class="list">${monthly.map(inv => `
        <div class="list-item">
          <div class="list-item-main">
            <div class="list-item-title">${escHtml(inv.type)}</div>
            <div class="list-item-sub">${formatDateBR(inv.date)} • Rentab.: ${inv.profitability}% a.a.</div>
          </div>
          <div class="list-item-amount c-invest">${formatBRL(inv.amount)}</div>
          <div class="list-actions">
            <button class="btn-ghost btn" onclick="editInvest('${inv.id}')">${editIcon()}</button>
            <button class="btn-ghost btn" onclick="deleteInvest('${inv.id}')" style="color:var(--destructive)">${trashIcon()}</button>
          </div>
        </div>`).join("")}</div>`;

  const headerHtml = isTab 
    ? `<div style="display:flex; justify-content:flex-end; margin-bottom:1rem;">
        <input type="text" id="invest-search" class="form-input" placeholder="Pesquisar investimentos..." style="max-width: 200px; padding: 0.35rem 0.65rem; font-size: 0.8rem; margin: 0;">
      </div>`
    : `<div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div><h1>Investimentos</h1><p>Acompanhe seus investimentos</p></div>
        <div style="display:flex; gap:.5rem; align-items:center; flex-wrap:wrap;">
          <input type="text" id="invest-search" class="form-input" placeholder="Pesquisar investimentos..." style="max-width: 200px; padding: 0.35rem 0.65rem; font-size: 0.8rem; margin: 0;">
          <button class="btn btn-primary" onclick="openModal('modal-invest')">${plusIcon()} Adicionar</button>
        </div>
      </div>`;

  container.innerHTML = headerHtml + `

  <div class="stat-grid">
    <div class="stat-card" data-tip="Soma de todos os investimentos cadastrados">
      <div class="stat-card-row"><span class="card-title-sm">Total Investido</span>${walletIcon()}</div>
      <div class="stat-value c-invest">${formatBRL(total + expInvestTotal)}</div>
      <div class="stat-sub">${all.length} registro(s) + ${expInvestAll.length} aporte(s)</div>
    </div>
    <div class="stat-card" data-tip="Investimentos e aportes em ${monthName(month)}">
      <div class="stat-card-row"><span class="card-title-sm">Este Mês</span>${trendUpIcon()}</div>
      <div class="stat-value c-invest">${formatBRL(monthTotal + expInvestMonthTotal)}</div>
      <div class="stat-sub">${monthly.length + expInvestMonth.length} transação(ões)</div>
    </div>
    <div class="stat-card" data-tip="Só aportes via categoria Gastos > Investimento">
      <div class="stat-card-row"><span class="card-title-sm">Aportes (Gastos)</span>${trendUpIcon()}</div>
      <div class="stat-value" style="color:hsl(38,92%,55%)">${formatBRL(expInvestMonthTotal)}</div>
      <div class="stat-sub">${expInvestMonth.length} aporte(s) este mês</div>
    </div>
    <div class="stat-card" data-tip="Tipos de investimentos cadastrados">
      <div class="stat-card-row"><span class="card-title-sm">Tipos</span>${barChartIcon()}</div>
      <div class="stat-value">${types.length}</div>
    </div>
  </div>

  ${types.length > 0 ? `<div class="card" style="margin-bottom:1rem"><div class="card-header" style="padding:1rem 1.25rem .75rem"><span class="card-title">Por Tipo</span></div><div class="card-body"><div id="invest-bars"></div></div></div>` : ""}

  <div class="card" style="margin-bottom:1rem">
    <div class="card-header" style="padding:1rem 1.25rem .75rem;display:flex;align-items:center;gap:.5rem">
      <span class="card-title">Investimentos de ${monthName(month)}</span>
      <span style="font-size:.75rem;color:var(--muted-foreground);margin-left:auto">${monthly.length} registro(s)</span>
    </div>
    <div class="card-body">${investList}</div>
  </div>

  <div class="card">
    <div class="card-header" style="padding:1rem 1.25rem .75rem;display:flex;align-items:center;gap:.5rem">
      <span class="card-title">📥 Aportes via Gastos — ${monthName(month)}</span>
      <span style="font-size:.75rem;color:var(--muted-foreground);margin-left:auto">${expInvestMonth.length} aporte(s)</span>
      <span style="font-size:.75rem;font-weight:700;color:hsl(38,92%,55%)">${formatBRL(expInvestMonthTotal)}</span>
    </div>
    <div class="card-body">
      <div class="alert alert-info" style="margin-bottom:.75rem">
        ${infoIcon()} Estes são gastos registrados com a categoria <strong>Investimento</strong>. Para editar, acesse a página <strong>Gastos</strong>.
      </div>
      ${expInvestList}
    </div>
  </div>

  <div class="modal-backdrop" id="modal-invest"><div class="modal">
    <div class="modal-header"><span class="modal-title" id="invest-title">Adicionar Investimento</span><button class="modal-close" onclick="closeModal('modal-invest')">×</button></div>
    <input type="hidden" id="invest-edit-id">
    <div class="form-group"><label class="form-label">Tipo *</label><input id="inv-type" class="form-input" placeholder="Ex: CDB, Tesouro, Ações..."></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Valor *</label><input id="inv-amount" class="form-input" type="number" step="0.01"></div>
      <div class="form-group"><label class="form-label">Data *</label><input id="inv-date" class="form-input" type="date" value="${new Date().toISOString().split("T")[0]}"></div>
    </div>
    <div class="form-group"><label class="form-label">Rentabilidade (% a.a.)</label><input id="inv-profit" class="form-input" type="number" step="0.01" placeholder="0.00"></div>
    <div class="form-actions">
      <button class="btn btn-primary" onclick="saveInvest()">Salvar</button>
      <button class="btn btn-outline" onclick="closeModal('modal-invest')">Cancelar</button>
    </div>
  </div></div>`;

  if (types.length > 0) {
    const COLORS_INV = ["hsl(38,92%,50%)","hsl(162,64%,45%)","hsl(192,70%,42%)","hsl(280,65%,60%)","hsl(0,78%,58%)"];
    const barData = types.map((t, i) => ({ name: t, value: all.filter(x => x.type === t).reduce((s, x) => s + x.amount, 0), color: COLORS_INV[i % COLORS_INV.length] }));
    SVGCharts.bar(document.getElementById("invest-bars"), barData);
  }

  // Evento de Pesquisa/Filtro
  const searchInput = container.querySelector("#invest-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const cards = container.querySelectorAll(".card");
      
      cards.forEach(card => {
        const items = card.querySelectorAll(".list-item");
        if (items.length === 0) return;

        let visibleCount = 0;
        items.forEach(item => {
          const titleEl = item.querySelector(".list-item-title");
          const amountEl = item.querySelector(".list-item-amount");
          const titleText = titleEl ? titleEl.textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
          const amountText = amountEl ? amountEl.textContent.toLowerCase() : "";

          if (titleText.includes(query) || amountText.includes(query)) {
            item.style.display = "flex";
            visibleCount++;
          } else {
            item.style.display = "none";
          }
        });

        const listContainer = card.querySelector(".list");
        const alertEl = card.querySelector(".alert");
        let emptySearch = card.querySelector(".invest-search-empty");

        if (visibleCount === 0 && items.length > 0) {
          if (!emptySearch) {
            emptySearch = document.createElement("div");
            emptySearch.className = "empty invest-search-empty";
            emptySearch.style.padding = "1.5rem 0";
            emptySearch.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto .5rem; display: block; opacity: 0.3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <p>Nenhum registro encontrado</p>`;
            listContainer.parentNode.appendChild(emptySearch);
          }
          if (listContainer) listContainer.style.display = "none";
          if (alertEl) alertEl.style.display = "none";
        } else {
          if (emptySearch) emptySearch.remove();
          if (listContainer) listContainer.style.display = "flex";
          if (alertEl) alertEl.style.display = "flex";
        }
      });
    });
  }
}
function saveInvest() {
  const type = document.getElementById("inv-type").value.trim();
  const amount = parseFloat(document.getElementById("inv-amount").value);
  const date = document.getElementById("inv-date").value;
  const profitability = parseFloat(document.getElementById("inv-profit").value) || 0;
  const editId = document.getElementById("invest-edit-id").value;
  if (!type || !amount || !date) {
    if (!type) { const el = document.getElementById("inv-type"); el.classList.add("invalid"); setTimeout(() => el.classList.remove("invalid"), 1000); }
    if (!amount) { const el = document.getElementById("inv-amount"); el.classList.add("invalid"); setTimeout(() => el.classList.remove("invalid"), 1000); }
    if (!date) { const el = document.getElementById("inv-date"); el.classList.add("invalid"); setTimeout(() => el.classList.remove("invalid"), 1000); }
    Toast.error("Preencha todos os campos"); return;
  }
  const data = { type, amount, date, profitability, month: date.slice(0,7) };
  if (editId) { Investments.update(editId, data); Toast.success("Atualizado!"); }
  else { Investments.add(data); Toast.success("Investimento adicionado!"); }
  closeModal("modal-invest");
  
  const tabContent = document.getElementById("tab-investments-content");
  if (tabContent && tabContent.parentNode.classList.contains("active")) {
    renderInvestments(tabContent, true);
  } else {
    renderInvestments(document.getElementById("page-content"));
  }
}
function editInvest(id) {
  const inv = Investments.all().find(x => x.id === id);
  if (!inv) return;
  document.getElementById("invest-title").textContent = "Editar Investimento";
  document.getElementById("invest-edit-id").value = id;
  document.getElementById("inv-type").value = inv.type;
  document.getElementById("inv-amount").value = inv.amount;
  document.getElementById("inv-date").value = inv.date;
  document.getElementById("inv-profit").value = inv.profitability;
  openModal("modal-invest");
}
async function deleteInvest(id) {
  if (!await confirmDelete("Remover este investimento?")) return;
  Investments.remove(id); Toast.success("Removido!");
  
  const tabContent = document.getElementById("tab-investments-content");
  if (tabContent && tabContent.parentNode.classList.contains("active")) {
    renderInvestments(tabContent, true);
  } else {
    renderInvestments(document.getElementById("page-content"));
  }
}


// ── Página de Metas ────────────────────────────────────────────────────────────────
Router.register("goals", (container) => { renderGoals(container); });
function renderGoals(container) {
  const month = MonthState.get();
  const incomes = Incomes.byMonth(month).filter(i => i.received);
  const expenses = Expenses.byMonth(month);
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const leisure = expenses.filter(e => e.category === "leisure").reduce((s, e) => s + e.amount, 0);
  const credit = expenses.filter(e => e.paymentMethod === "credit").reduce((s, e) => s + e.amount, 0);
  const invest = expenses.filter(e => e.category === "investment").reduce((s, e) => s + e.amount, 0);
  const savings = totalIncome - totalExp;
  const goals = Goals.byMonth(month);

  const getGoal = (cat) => goals.find(g => g.category === cat);
  const prog = (cur, tgt) => tgt > 0 ? Math.min(cur / tgt * 100, 100) : 0;

  const goalCards = [
    { cat: "savings", label: "Poupança", icon: "💰", current: savings, hint: totalIncome > 0 ? `Sugerido: ${formatBRL(totalIncome * 0.2)} (20% da renda)` : "" },
    { cat: "leisure", label: "Lazer", icon: "✨", current: leisure, hint: totalIncome > 0 ? `Sugerido: ${formatBRL(totalIncome * 0.1)} (10% da renda)` : "" },
    { cat: "credit", label: "Crédito", icon: "💳", current: credit, hint: totalIncome > 0 ? `Sugerido: ${formatBRL(totalIncome * 0.3)} (30% da renda)` : "" },
    { cat: "investment", label: "Investimentos", icon: "📈", current: invest, hint: totalIncome > 0 ? `Sugerido: ${formatBRL(totalIncome * 0.15)} (15% da renda)` : "" },
  ].map(({ cat, label, icon, current, hint }) => {
    const g = getGoal(cat);
    const tgt = g ? g.target : 0;
    const pct = prog(current, tgt);
    const color = pct >= 100 ? "danger" : pct >= 80 ? "warn" : "";
    const statusIcon = pct >= 100 ? "⚠️" : pct >= 80 ? "⚡" : "✓";
    const statusColor = pct >= 100 ? "var(--expense)" : pct >= 80 ? "var(--warning)" : "var(--income)";
    return `<div class="card" style="padding:1.25rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
        <div style="display:flex;align-items:center;gap:.5rem;font-weight:600">${icon} ${label}</div>
        ${tgt > 0 ? `<span style="font-size:.85rem;color:${statusColor}">${statusIcon} ${pct.toFixed(0)}%</span>` : ""}
      </div>
      ${tgt > 0 ? `<div class="progress-bar"><div class="progress-fill ${color}" style="width:${pct}%"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:.8rem;color:var(--muted-foreground);margin-top:.25rem">
        <span>${formatBRL(current)}</span><span>Meta: ${formatBRL(tgt)}</span>
      </div>` : `<p style="font-size:.8rem;color:var(--muted-foreground)">Nenhuma meta definida</p>`}
      ${hint ? `<p style="font-size:.75rem;color:var(--muted-foreground);margin-top:.35rem">${escHtml(hint)}</p>` : ""}
      <div style="display:flex;gap:.5rem;margin-top:.75rem">
        <input type="number" step="0.01" placeholder="Definir meta..." class="form-input" id="goal-${cat}" value="${tgt > 0 ? tgt : ""}" style="flex:1">
        <button class="btn btn-sm btn-primary" onclick="saveGoal('${cat}')">Salvar</button>
      </div>
    </div>`;
  }).join("");

  container.innerHTML = `
  <div class="page-header">
    <div><h1>Metas</h1><p>Defina e acompanhe suas metas financeiras</p></div>
    ${totalIncome > 0 ? `<button class="btn btn-outline" onclick="autoGoals()">⚡ Metas Automáticas</button>` : ""}
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem">${goalCards}</div>`;
}
function saveGoal(cat) {
  const val = parseFloat(document.getElementById(`goal-${cat}`).value);
  if (isNaN(val) || val <= 0) { Toast.error("Informe um valor válido"); return; }
  const month = MonthState.get();
  const existing = Goals.byMonth(month).find(g => g.category === cat);
  if (existing) Goals.update(existing.id, { target: val });
  else Goals.add({ category: cat, target: val, month, autoMode: false });
  Toast.success("Meta salva!"); renderGoals(document.getElementById("page-content"));
}
function autoGoals() {
  const month = MonthState.get();
  const income = Incomes.byMonth(month).filter(i => i.received).reduce((s, i) => s + i.amount, 0);
  if (income === 0) { Toast.error("Nenhuma renda registrada"); return; }
  [{ cat: "savings", pct: 0.2 }, { cat: "leisure", pct: 0.1 }, { cat: "credit", pct: 0.3 }, { cat: "investment", pct: 0.15 }].forEach(({ cat, pct }) => {
    const val = income * pct;
    const ex = Goals.byMonth(month).find(g => g.category === cat);
    if (ex) Goals.update(ex.id, { target: val, autoMode: true });
    else Goals.add({ category: cat, target: val, month, autoMode: true });
  });
  Toast.success("Metas automáticas calculadas!"); renderGoals(document.getElementById("page-content"));
}

// ── Página de Categorias (Lazer) ─────────────────────────────────────────────────
const DEFAULT_LEISURE = [
  { name: "Rolê / Bar", emoji: "🍺", color: "hsl(280,87%,65%)" },
  { name: "Viagem", emoji: "✈️", color: "hsl(200,87%,65%)" },
  { name: "Uber / Transporte", emoji: "🚗", color: "hsl(45,87%,65%)" },
  { name: "Jogos", emoji: "🎮", color: "hsl(330,87%,65%)" },
  { name: "Tatuagem", emoji: "💉", color: "hsl(0,87%,65%)" },
  { name: "Restaurante", emoji: "🍽️", color: "hsl(120,87%,65%)" },
  { name: "Cinema", emoji: "🎬", color: "hsl(260,87%,65%)" },
  { name: "Outros", emoji: "✨", color: "hsl(280,65%,60%)" },
];
const EMOJI_LIST = ["✨","🎮","🍺","🍕","🎬","🎵","🎨","🏖️","⚽","🎯","🛍️","🎁","📚","🧘","☕","🍦"];
const COLOR_LIST = ["hsl(280,65%,60%)","hsl(200,87%,50%)","hsl(38,92%,50%)","hsl(162,64%,45%)","hsl(0,78%,58%)","hsl(192,70%,42%)","hsl(45,87%,55%)","hsl(330,80%,60%)"];

Router.register("categories", (container) => { renderCategories(container); });
function renderCategories(container) {
  const target = container || document.getElementById("tab-categories-content") || document.getElementById("page-content");
  if (!target) return;
  const month = MonthState.get();
  const expenses = Expenses.byMonth(month).filter(e => e.category === "leisure");
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const custom = LeisureSubs.all();
  const all = [...DEFAULT_LEISURE, ...custom.map(s => ({ name: s.name, emoji: s.emoji, color: s.color, id: s.id, custom: true }))];

  const catData = all.map(cat => {
    const catExp = expenses.filter(e => (e.subcategory || "Outros") === cat.name);
    return { ...cat, total: catExp.reduce((s, e) => s + e.amount, 0), count: catExp.length };
  });

  const leisureExpenses = expenses.filter(e => e.category === "leisure");
  const subCatMap = {};
  leisureExpenses.forEach(e => {
    const subName = e.subcategory || "Outros";
    subCatMap[subName] = (subCatMap[subName] || 0) + e.amount;
  });

  const subCatData = Object.entries(subCatMap).map(([name, value]) => {
    const catObj = all.find(c => c.name === name);
    const color = catObj ? catObj.color : "var(--leisure)";
    return { name, value, color };
  });

  target.innerHTML = `
  <div class="page-header"><div><h1>Categorias</h1><p>Gerencie categorias de lazer</p></div><button class="btn btn-primary" onclick="openModal('modal-cat')">${plusIcon()} Nova Categoria</button></div>
  <div class="stat-grid">
    <div class="stat-card"><div class="stat-card-row"><span class="card-title-sm">Total em Lazer</span>${sparkIcon()}</div><div class="stat-value c-leisure">${formatBRL(total)}</div></div>
    <div class="stat-card"><div class="stat-card-row"><span class="card-title-sm">Categorias Ativas</span>${sparkIcon()}</div><div class="stat-value">${catData.filter(c=>c.total>0).length}</div></div>
  </div>
  ${subCatData.length > 0 ? `<div class="card" style="margin-bottom:1rem"><div class="card-header" style="padding:1rem 1.25rem .75rem"><span class="card-title">Distribuição por Subcategoria</span></div><div class="card-body"><div id="cat-pie"></div></div></div>` : ""}
  ${subCatData.length > 0 ? `<div class="card" style="margin-bottom:1rem"><div class="card-header" style="padding:1rem 1.25rem .75rem"><span class="card-title">Gastos por Categoria de Lazer (mês atual)</span></div><div class="card-body"><div id="leisure-sub-bar"></div></div></div>` : ""}
  <div class="card"><div class="card-header" style="padding:1rem 1.25rem .75rem"><span class="card-title">Categorias</span></div><div class="card-body">
    <div class="list">${catData.map(cat => `<div class="list-item">
      <div style="width:36px;height:36px;border-radius:50%;background:${escHtml(cat.color)};display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0">${escHtml(cat.emoji)}</div>
      <div class="list-item-main"><div class="list-item-title">${escHtml(cat.name)}</div><div class="list-item-sub">${cat.count} gasto(s) • ${cat.total > 0 ? `${((cat.total/total)*100).toFixed(0)}% do total` : "sem gastos"}</div></div>
      <div class="list-item-amount c-leisure">${formatBRL(cat.total)}</div>
      ${cat.custom ? `<div class="list-actions"><button class="btn-ghost btn" onclick="editCat('${cat.id}')">${editIcon()}</button><button class="btn-ghost btn" onclick="deleteCat('${cat.id}')" style="color:var(--destructive)">${trashIcon()}</button></div>` : ""}
    </div>`).join("")}
    </div>
  </div></div>
  
  <div class="modal-backdrop" id="modal-cat"><div class="modal">
    <div class="modal-header"><span class="modal-title" id="cat-modal-title">Nova Categoria</span><button class="modal-close" onclick="closeModal('modal-cat')">×</button></div>
    <input type="hidden" id="cat-edit-id">
    <div class="form-group"><label class="form-label">Nome *</label><input id="cat-name" class="form-input" placeholder="Ex: Academia, Streaming..."></div>
    <div class="form-group"><label class="form-label">Emoji</label>
      <div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:.4rem">${EMOJI_LIST.map(e=>`<button class="btn btn-sm btn-outline" onclick="pickCatEmoji('${e}')" style="font-size:1.1rem;padding:.25rem .4rem">${e}</button>`).join("")}</div>
      <input id="cat-emoji" class="form-input" value="✨" style="width:80px">
    </div>
    <div class="form-group"><label class="form-label">Cor</label>
      <div style="display:flex;gap:.35rem;flex-wrap:wrap" id="cat-color-picks">
        ${COLOR_LIST.map(c=>`<button onclick="pickCatColor('${c}')" style="width:26px;height:26px;border-radius:50%;background:${c};border:2px solid transparent;cursor:pointer" class="cat-color-pick" data-color="${c}"></button>`).join("")}
      </div>
      <input id="cat-color" type="hidden" value="${COLOR_LIST[0]}">
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" onclick="saveCat()">Salvar</button>
      <button class="btn btn-outline" onclick="closeModal('modal-cat')">Cancelar</button>
    </div>
  </div></div>`;

  setTimeout(() => {
    if (subCatData.length > 0) {
      const catPieEl = document.getElementById("cat-pie");
      if (catPieEl) SVGCharts.pie(catPieEl, subCatData);
    }
    if (subCatData.length > 0) {
      const subBarEl = document.getElementById("leisure-sub-bar");
      if (subBarEl) SVGCharts.bar(subBarEl, subCatData);
    }
  }, 60);
}
function pickCatEmoji(e) { const el = document.getElementById("cat-emoji"); if(el) el.value = e; }
function pickCatColor(c) {
  document.getElementById("cat-color").value = c;
  document.querySelectorAll(".cat-color-pick").forEach(b => b.style.borderColor = b.dataset.color === c ? "#fff" : "transparent");
}
function saveCat() {
  const name = document.getElementById("cat-name").value.trim();
  const emoji = document.getElementById("cat-emoji").value.trim() || "✨";
  const color = document.getElementById("cat-color").value;
  const editId = document.getElementById("cat-edit-id").value;
  if (!name) { Toast.error("Informe o nome"); return; }
  if (editId) { LeisureSubs.update(editId, { name, emoji, color }); Toast.success("Categoria atualizada!"); }
  else { LeisureSubs.add({ name, emoji, color }); Toast.success("Categoria criada!"); }
  closeModal("modal-cat"); renderCategories(document.getElementById("page-content"));
}
function editCat(id) {
  const s = LeisureSubs.all().find(x => x.id === id);
  if (!s) return;
  document.getElementById("cat-modal-title").textContent = "Editar Categoria";
  document.getElementById("cat-edit-id").value = id;
  document.getElementById("cat-name").value = s.name;
  document.getElementById("cat-emoji").value = s.emoji;
  document.getElementById("cat-color").value = s.color;
  openModal("modal-cat");
}
async function deleteCat(id) {
  if (!await confirmDelete("Remover esta categoria?")) return;
  LeisureSubs.remove(id); Toast.success("Removida!"); renderCategories(document.getElementById("page-content"));
}

// ── Página de Relatórios ──────────────────────────────────────────────────────────────
Router.register("reports", (container) => {
  renderReports(container, 6);
});

function renderReports(container, period = 6) {
  const month = MonthState.get();
  const lastMonths = [];
  let m = month;
  for (let i = 0; i < period; i++) { lastMonths.unshift(m); m = prevMonth(m); }
  const labels  = lastMonths.map(mo => monthNameShort(mo));
  const incData = lastMonths.map(mo => Incomes.byMonth(mo).filter(i=>i.received).reduce((s,i)=>s+i.amount,0));
  const expData = lastMonths.map(mo => Expenses.byMonth(mo).reduce((s,e)=>s+e.amount,0));
  const balData = lastMonths.map((_,i) => incData[i] - expData[i]);

  const prevM = prevMonth(month);

  container.innerHTML = `
  <div class="page-header">
    <div><h1>Relatórios</h1><p>Análise dos últimos ${period} meses</p></div>
    <button class="btn btn-primary" onclick="downloadReportPDF()" id="btn-pdf">
      ${downloadIcon()} Baixar PDF
    </button>
  </div>
  
  <div class="card" style="margin-bottom:1rem; padding:1rem 1.25rem;">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
      <span style="font-weight:600; font-size:0.9rem;">Período do Gráfico</span>
      <div style="display:flex; gap:0.25rem;">
        <button class="btn btn-sm btn-outline ${period === 6 ? 'active' : ''}" onclick="changeReportPeriod(6)">6 meses</button>
        <button class="btn btn-sm btn-outline ${period === 12 ? 'active' : ''}" onclick="changeReportPeriod(12)">12 meses</button>
      </div>
    </div>
  </div>

  <div class="card" style="margin-bottom:1rem; padding:1.25rem;">
    <div style="font-weight:600; font-size:0.95rem; margin-bottom:0.75rem; color:var(--foreground);">Comparar Dois Meses</div>
    <div style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <label class="form-label" style="margin-bottom:0;">Mês A:</label>
        <input type="month" id="compare-month-a" class="form-input" style="width:160px; padding:0.35rem 0.5rem;" value="${prevM}">
      </div>
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <label class="form-label" style="margin-bottom:0;">Mês B:</label>
        <input type="month" id="compare-month-b" class="form-input" style="width:160px; padding:0.35rem 0.5rem;" value="${month}">
      </div>
      <button class="btn btn-primary btn-sm" onclick="runComparison()" style="padding:0.4rem 1rem;">Comparar</button>
    </div>
    <div id="compare-results" style="margin-top:1rem; display:none;"></div>
  </div>

  <div class="card" style="margin-bottom:1rem">
    <div class="card-header" style="padding:1rem 1.25rem .75rem"><span class="card-title">Receitas vs Gastos</span></div>
    <div class="card-body"><div id="report-line"></div></div>
  </div>
  <div class="stat-grid" id="report-month-cards" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));">
    ${lastMonths.map((mo, i) => `<div class="stat-card">
      <div class="stat-card-row"><span class="card-title-sm">${monthNameShort(mo)}</span></div>
      <div style="font-size:.85rem;display:flex;flex-direction:column;gap:.2rem;margin-top:.3rem">
        <div style="display:flex;justify-content:space-between"><span style="color:var(--muted-foreground)">Receita</span><span class="c-income" style="font-weight:600">${formatBRL(incData[i])}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--muted-foreground)">Gastos</span><span class="c-expense" style="font-weight:600">${formatBRL(expData[i])}</span></div>
        <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:.2rem;margin-top:.2rem"><span style="color:var(--muted-foreground)">Saldo</span><span style="font-weight:700;color:${balData[i]>=0?"var(--income)":"var(--expense)"}">${formatBRL(balData[i])}</span></div>
      </div>
    </div>`).join("")}
  </div>`;

  setTimeout(() => {
    const el = document.getElementById("report-line");
    if (el) SVGCharts.line(el, [
      { label: "Receitas", values: incData, color: "hsl(162,64%,45%)" },
      { label: "Gastos",   values: expData, color: "hsl(0,78%,58%)" },
    ], labels);
  }, 60);
}

function changeReportPeriod(p) {
  const content = document.getElementById("page-content");
  if (content) renderReports(content, p);
}

function runComparison() {
  const monthA = document.getElementById("compare-month-a").value;
  const monthB = document.getElementById("compare-month-b").value;
  const resultsDiv = document.getElementById("compare-results");
  
  if (!monthA || !monthB) {
    Toast.error("Escolha ambos os meses para comparar");
    return;
  }
  
  const incA = Incomes.byMonth(monthA).filter(i => i.received).reduce((s, i) => s + i.amount, 0);
  const expA = Expenses.byMonth(monthA).reduce((s, e) => s + e.amount, 0);
  const balA = incA - expA;
  
  const incB = Incomes.byMonth(monthB).filter(i => i.received).reduce((s, i) => s + i.amount, 0);
  const expB = Expenses.byMonth(monthB).reduce((s, e) => s + e.amount, 0);
  const balB = incB - expB;
  
  const calcDiff = (valA, valB) => {
    if (valA === 0) return valB > 0 ? "▲ 100.0%" : "0.0%";
    const diff = ((valB - valA) / valA * 100);
    const sign = diff > 0 ? "▲" : "▼";
    return `${sign} ${Math.abs(diff).toFixed(1)}%`;
  };
  
  const diffIncColor = incB >= incA ? "var(--income)" : "var(--expense)";
  const diffExpColor = expB >= expA ? "var(--expense)" : "var(--income)";
  const diffBalColor = balB >= balA ? "var(--income)" : "var(--expense)";
  
  resultsDiv.style.display = "block";
  resultsDiv.innerHTML = `
    <div class="stat-grid" style="grid-template-columns: 1fr 1fr; margin-bottom: 0;">
      <div class="stat-card" style="border-color:var(--border);">
        <div class="stat-card-row"><span class="card-title-sm" style="font-weight:600;">Mês A: ${monthName(monthA)}</span></div>
        <div style="font-size:0.85rem; display:flex; flex-direction:column; gap:0.3rem; margin-top:0.5rem;">
          <div style="display:flex; justify-content:space-between;"><span>Receitas</span><span class="c-income" style="font-weight:600;">${formatBRL(incA)}</span></div>
          <div style="display:flex; justify-content:space-between;"><span>Despesas</span><span class="c-expense" style="font-weight:600;">${formatBRL(expA)}</span></div>
          <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border); padding-top:0.25rem; margin-top:0.25rem;"><span>Saldo</span><span style="font-weight:700; color:${balA >= 0 ? "var(--income)" : "var(--expense)"}">${formatBRL(balA)}</span></div>
        </div>
      </div>
      <div class="stat-card" style="border-color:var(--border);">
        <div class="stat-card-row"><span class="card-title-sm" style="font-weight:600;">Mês B: ${monthName(monthB)}</span></div>
        <div style="font-size:0.85rem; display:flex; flex-direction:column; gap:0.3rem; margin-top:0.5rem;">
          <div style="display:flex; justify-content:space-between;"><span>Receitas</span><span class="c-income" style="font-weight:600;">${formatBRL(incB)} <span style="font-size:0.75rem; color:${diffIncColor}; font-weight:700; margin-left:0.25rem;">${calcDiff(incA, incB)}</span></span></div>
          <div style="display:flex; justify-content:space-between;"><span>Despesas</span><span class="c-expense" style="font-weight:600;">${formatBRL(expB)} <span style="font-size:0.75rem; color:${diffExpColor}; font-weight:700; margin-left:0.25rem;">${calcDiff(expA, expB)}</span></span></div>
          <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border); padding-top:0.25rem; margin-top:0.25rem;"><span>Saldo</span><span style="font-weight:700; color:${balB >= 0 ? "var(--income)" : "var(--expense)"}">${formatBRL(balB)} <span style="font-size:0.75rem; color:${diffBalColor}; font-weight:700; margin-left:0.25rem;">${calcDiff(balA, balB)}</span></span></div>
        </div>
      </div>
    </div>
  `;
}

// ── Gerador de Relatório em PDF ──────────────────────────────────────────────────────
function downloadReportPDF() {
  const btn = document.getElementById("btn-pdf");
  if (btn) { btn.disabled = true; btn.textContent = "Gerando..."; }

  try {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) { Toast.error("jsPDF não carregado"); return; }

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210, margin = 18;
    let y = 0;

    // ── Utilitários de cor
    const setFill   = (r,g,b) => doc.setFillColor(r,g,b);
    const setStroke = (r,g,b) => doc.setDrawColor(r,g,b);
    const setColor  = (r,g,b) => doc.setTextColor(r,g,b);

    // ── Página de capa
    setFill(15, 148, 136);
    doc.rect(0, 0, W, 80, "F");

    // Área do logo
    setFill(255,255,255); doc.setGState(doc.GState({opacity: 0.15}));
    doc.circle(180, 15, 40, "F");
    doc.setGState(doc.GState({opacity: 1}));

    setColor(255,255,255);
    doc.setFont("helvetica","bold"); doc.setFontSize(28);
    doc.text("Planeja Lar", margin, 35);
    doc.setFont("helvetica","normal"); doc.setFontSize(13);
    doc.text("Relatório Financeiro Completo", margin, 46);

    const member = Members.getActive();
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" });

    doc.setFontSize(10);
    doc.text(`Perfil: ${member?.name || "Usuário"}`, margin, 58);
    doc.text(`Gerado em: ${dateStr}`, margin, 65);

    y = 90;

    // ── Seção de resumo
    const month = MonthState.get();
    const last6 = [];
    let mo = month;
    for (let i = 0; i < 6; i++) { last6.unshift(mo); mo = prevMonth(mo); }

    const incData = last6.map(m => Incomes.byMonth(m).filter(i=>i.received).reduce((s,i)=>s+i.amount,0));
    const expData = last6.map(m => Expenses.byMonth(m).reduce((s,e)=>s+e.amount,0));
    const balData = last6.map((_,i) => incData[i] - expData[i]);

    const totalInc = incData.reduce((s,v)=>s+v,0);
    const totalExp = expData.reduce((s,v)=>s+v,0);
    const totalBal = totalInc - totalExp;

    // Utilitário de título de seção
    function sectionTitle(title, yy) {
      setFill(245,247,250); doc.rect(margin-2, yy-5, W - margin*2+4, 10, "F");
      setColor(15,148,136); doc.setFont("helvetica","bold"); doc.setFontSize(11);
      doc.text(title, margin, yy+1);
      setColor(60,60,60); doc.setFont("helvetica","normal");
      return yy + 10;
    }

    // Utilitário de linha (rótulo + valor)
    function row(label, value, yy, bold=false, colorSign=null) {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(9.5);
      setColor(90,90,90); doc.text(label, margin, yy);
      if (colorSign === "+") setColor(16,185,129);
      else if (colorSign === "-") setColor(239,68,68);
      else setColor(30,30,30);
      doc.text(value, W - margin, yy, { align: "right" });
      setColor(60,60,60);
      return yy + 6;
    }

    function divider(yy) {
      setStroke(220,220,220); doc.setLineWidth(0.3);
      doc.line(margin, yy, W-margin, yy);
      return yy + 4;
    }

    function checkPage(yy) {
      if (yy > 270) { doc.addPage(); return 20; }
      return yy;
    }

    // ── 1. Resumo Geral (6 meses)
    y = sectionTitle("1. Resumo dos Últimos 6 Meses", y);
    y = row("Total de Receitas", formatBRL(totalInc), y, false, "+");
    y = row("Total de Gastos",   formatBRL(totalExp), y, false, "-");
    y = divider(y);
    y = row("Saldo Acumulado", formatBRL(totalBal), y, true, totalBal >= 0 ? "+" : "-");
    y += 6;

    // ── 2. Mês a mês
    y = checkPage(y);
    y = sectionTitle("2. Detalhamento Mensal", y);
    last6.forEach((m, i) => {
      y = checkPage(y);
      const mName = monthName(m).charAt(0).toUpperCase() + monthName(m).slice(1);
      doc.setFont("helvetica","bold"); doc.setFontSize(9.5); setColor(60,60,60);
      doc.text(mName, margin, y); y += 5;
      y = row("  Receita",  formatBRL(incData[i]), y, false, "+");
      y = row("  Gastos",   formatBRL(expData[i]), y, false, "-");
      y = row("  Saldo",    formatBRL(balData[i]), y, true, balData[i] >= 0 ? "+" : "-");
      y = divider(y);
    });
    y += 4;

    // ── 3. Cartões
    y = checkPage(y);
    const cards = Cards.all();
    if (cards.length > 0) {
      y = sectionTitle("3. Cartões de Crédito", y);
      cards.forEach(card => {
        y = checkPage(y);
        const allExp = Expenses.all().filter(e => e.cardId === card.id);
        const totalUsed = allExp.filter(e => !e.paid).reduce((s,e)=>s+e.amount,0);
        const pct = Math.min(totalUsed / card.limit * 100, 100);
        y = row(`${card.name}`, `Limite: ${formatBRL(card.limit)}`, y, true);
        y = row(`  Utilizado`, formatBRL(totalUsed), y, false, pct >= 80 ? "-" : null);
        y = row(`  Disponível`, formatBRL(card.limit - totalUsed), y, false, "+");
        y = divider(y);
      });
      y += 4;
    }

    // ── 4. Investimentos
    y = checkPage(y);
    const allInv = Investments.all();
    if (allInv.length > 0) {
      y = sectionTitle("4. Investimentos", y);
      const invTotal = allInv.reduce((s,i)=>s+i.amount,0);
      const types = [...new Set(allInv.map(i=>i.type))];
      types.forEach(t => {
        const tTotal = allInv.filter(i=>i.type===t).reduce((s,i)=>s+i.amount,0);
        y = row(t, formatBRL(tTotal), y, false, "+");
      });
      y = divider(y);
      y = row("Total Investido", formatBRL(invTotal), y, true, "+");
      y += 4;
    }

    // ── 5. Metas
    y = checkPage(y);
    const goals = Goals.byMonth(month);
    if (goals.length > 0) {
      y = sectionTitle("5. Metas — " + (monthName(month).charAt(0).toUpperCase() + monthName(month).slice(1)), y);
      const catLabels = { savings:"Poupança", leisure:"Lazer", credit:"Crédito", investment:"Investimentos" };
      
      const curIncomes = Incomes.byMonth(month).filter(i => i.received);
      const curExpenses = Expenses.byMonth(month);
      const curTotalIncome = curIncomes.reduce((s, i) => s + i.amount, 0);
      const curTotalExp = curExpenses.reduce((s, e) => s + e.amount, 0);
      const curSavings = curTotalIncome - curTotalExp;

      goals.forEach(g => {
        y = checkPage(y);
        const label = catLabels[g.category] || g.category;
        
        let current = 0;
        if (g.category === "savings") current = curSavings;
        else if (g.category === "leisure") current = curExpenses.filter(e => e.category === "leisure").reduce((s, e) => s + e.amount, 0);
        else if (g.category === "credit") current = curExpenses.filter(e => e.paymentMethod === "credit").reduce((s, e) => s + e.amount, 0);
        else if (g.category === "investment") current = curExpenses.filter(e => e.category === "investment").reduce((s, e) => s + e.amount, 0);

        const pct = g.target > 0 ? (current / g.target * 100) : 0;
        y = row(label, `Atual: ${formatBRL(current)} / Meta: ${formatBRL(g.target)} (${pct.toFixed(0)}%)`, y);
      });
      y += 4;
    }

    // ── 6. Maiores Gastos do mês atual
    y = checkPage(y);
    const curMonthExp = Expenses.byMonth(month).sort((a,b)=>b.amount-a.amount).slice(0,8);
    if (curMonthExp.length > 0) {
      y = sectionTitle("6. Maiores Gastos — " + (monthName(month).charAt(0).toUpperCase() + monthName(month).slice(1)), y);
      curMonthExp.forEach(e => {
        y = checkPage(y);
        const desc = e.description.length > 32 ? e.description.slice(0,29)+"..." : e.description;
        y = row(desc, formatBRL(e.amount), y, false, "-");
      });
      y += 4;
    }

    // ── Rodapé em cada página
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      setFill(15,148,136);
      doc.rect(0, 287, W, 10, "F");
      setColor(255,255,255);
      doc.setFont("helvetica","normal"); doc.setFontSize(7.5);
      doc.text("Planeja Lar — Relatório Financeiro", margin, 293);
      doc.text(`Página ${p} de ${totalPages}`, W - margin, 293, { align: "right" });
    }

    // Sanitização rigorosa do nome do arquivo (remove acentos, emojis e caracteres especiais)
    const rawName = member?.name || "Relatorio";
    const safeName = rawName
      .normalize("NFD")                  // Decompõe caracteres acentuados (ex: á -> a + ´)
      .replace(/[\u0300-\u036f]/g, "")   // Remove acentos e diacríticos
      .replace(/[^\w\s-]/g, "")          // Remove emojis e outros caracteres especiais
      .trim()
      .replace(/\s+/g, "_");             // Substitui espaços por underscores

    const filename = `PlanejaLar_${safeName || "Relatorio"}_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}.pdf`;

    // Download manual resiliente com atraso de revogação para garantir o nome no Chrome/Edge
    const blob = doc.output("blob");
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 150);
    }
    Toast.success("PDF gerado com sucesso!");

  } catch(err) {
    console.error("PDF error:", err);
    Toast.error("Erro ao gerar PDF: " + err.message);
  } finally {
    const btn = document.getElementById("btn-pdf");
    if (btn) { btn.disabled = false; btn.innerHTML = `${downloadIcon()} Baixar PDF`; }
  }
}
