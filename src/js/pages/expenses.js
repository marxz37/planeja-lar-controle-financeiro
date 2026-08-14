// ── Página de Despesas ─────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { value: "pix", label: "Pix" }, { value: "debit", label: "Débito" },
  { value: "credit", label: "Crédito" }, { value: "boleto", label: "Boleto" },
  { value: "cash", label: "Dinheiro" }, { value: "transfer", label: "Transferência" },
];
const EXPENSE_CATS = [
  { value: "debit", label: "Débito" }, { value: "leisure", label: "Lazer" },
  { value: "investment", label: "Investimento" }, { value: "other", label: "Outros" },
];
const FIXED_CATS = [
  { value: "subscription", label: "Assinatura" }, { value: "housing", label: "Moradia" },
  { value: "transport", label: "Transporte" }, { value: "utilities", label: "Contas Fixas" },
  { value: "health", label: "Saúde" }, { value: "education", label: "Educação" },
  { value: "other", label: "Outros" },
];
const LEISURE_SUBS = ["Jogos","Rolê / Bar","Uber / Transporte","Restaurante","Tatuagem","Cinema","Viagem","Outros"];

Router.register("expenses", (container, params) => { renderExpenses(container, params); });

function renderExpenses(container, params) {
  const month = MonthState.get();
  const members = Members.all();
  const activeMember = Members.getActive();
  const allExp = Expenses.byMonth(month);
  const cards = Cards.all();
  const fixedAll = FixedExpenses.all().sort((a, b) => a.billingDay - b.billingDay);
  const fixedActive = fixedAll.filter(f => f.isActive);

  const totalExp = allExp.reduce((s, e) => s + e.amount, 0);
  const totalCredit = allExp.filter(e => e.paymentMethod === "credit").reduce((s, e) => s + e.amount, 0);
  const totalFixed = fixedActive.reduce((s, f) => s + f.amount, 0);
  const totalFixedCredit = fixedActive.filter(f => f.paymentMethod === "credit").reduce((s, f) => s + f.amount, 0);

  const catBadge = (e) => {
    const map = { credit: "badge-credit", debit: "badge-debit", leisure: "badge-leisure", investment: "badge-investment", other: "badge-other" };
    const labels = { credit: "Crédito", debit: "Débito", leisure: "Lazer", investment: "Investimento", other: "Outros" };
    return `<span class="badge ${map[e.category]||"badge-other"}">${labels[e.category]||e.category}</span>`;
  };

  const memberBadge = (id) => Members.getBadge(id);

  // Próximo gasto fixo a vencer
  const today = new Date();
  const [sy, sm] = month.split("-").map(Number);
  const isCurrent = sy === today.getFullYear() && sm === today.getMonth() + 1;
  const sortedFixed = [...fixedActive].sort((a, b) => a.billingDay - b.billingDay);
  let nextDue = null;
  if (sortedFixed.length > 0) {
    const upcoming = isCurrent ? sortedFixed.filter(f => f.billingDay >= today.getDate()) : sortedFixed;
    nextDue = upcoming.length > 0 ? { fe: upcoming[0], nextMonth: false } : { fe: sortedFixed[0], nextMonth: true };
  }

  const varList = allExp.length === 0
    ? `<div class="empty-state-wrapper">
        <div class="empty-state-icon-container">
          ${trendDownIcon()}
        </div>
        <div class="empty-state-title">Nenhum gasto registrado</div>
        <div class="empty-state-desc">Monitore as despesas da família adicionando as compras e gastos mensais para ${monthName(month)}.</div>
        <button class="btn btn-primary empty-state-action-btn" onclick="openVarModal()">
          ${plusIcon()} Adicionar primeiro gasto
        </button>
      </div>`
    : `<div class="list">${allExp.map(e => `
      <div class="list-item" id="expense-item-${e.id}">
        <div class="list-item-main">
          <div class="list-item-title" style="display:flex;align-items:center;gap:.4rem">
            ${escHtml(e.description)}
            ${e.isInstallment ? `<span class="badge badge-parcela">${e.installmentNumber}/${e.installments}x</span>` : ""}
          </div>
          <div class="list-item-sub" style="display:flex;align-items:center;gap:.35rem;flex-wrap:wrap">
            <span>${formatDateBR(e.date)}</span>
            ${catBadge(e)}
            ${e.subcategory ? `<span class="badge badge-other">${escHtml(e.subcategory)}</span>` : ""}
            <span style="font-size:.72rem;color:var(--muted-foreground)">${PAYMENT_METHODS.find(p=>p.value===e.paymentMethod)?.label||e.paymentMethod}</span>
            ${e.cardId ? `<span style="font-size:.72rem">💳 ${escHtml(cards.find(c=>c.id===e.cardId)?.name||"")}</span>` : ""}
            ${memberBadge(e.memberId)}
          </div>
        </div>
        <div class="list-item-amount c-expense">${formatBRL(e.amount)}</div>
        <div class="list-actions">
          <button class="btn-ghost btn" onclick="editExpense('${e.id}')">${editIcon()}</button>
          <button class="btn-ghost btn" onclick="deleteExpenseItem('${e.id}')" style="color:var(--destructive)">${trashIcon()}</button>
        </div>
      </div>`).join("")}</div>`;

  const fixedList = fixedAll.length === 0
    ? `<div class="empty-state-wrapper">
        <div class="empty-state-icon-container">
          ${trendDownIcon()}
        </div>
        <div class="empty-state-title">Nenhum gasto fixo cadastrado</div>
        <div class="empty-state-desc">Aluguel, assinaturas, contas de luz e outros gastos recorrentes podem ser cadastrados para acompanhamento automático.</div>
        <button class="btn btn-primary empty-state-action-btn" onclick="openFixedModal()">
          ${plusIcon()} Adicionar primeiro gasto fixo
        </button>
      </div>`
    : `<div class="list">${fixedAll.map(fe => {
        const isPaid = PaidFixedExpenses.isPaid(fe.id, month);
        return `<div class="list-item" style="${!fe.isActive ? "opacity:.55" : ""}">
          <label class="switch" title="${isPaid ? "Marcar pendente" : "Marcar pago"}">
            <input type="checkbox" ${isPaid ? "checked" : ""} onchange="toggleFixed('${fe.id}',this.checked)">
            <span class="switch-slider"></span>
          </label>
          <div class="list-item-main">
            <div class="list-item-title" style="${isPaid ? "text-decoration: line-through; opacity: 0.75;" : ""}">${escHtml(fe.name)}</div>
            <div class="list-item-sub" style="display:flex;gap:.35rem;flex-wrap:wrap">
              <span>${FIXED_CATS.find(c=>c.value===fe.category)?.label||fe.category}</span>
              <span>•</span>
              <span>${PAYMENT_METHODS.find(p=>p.value===fe.paymentMethod)?.label||fe.paymentMethod}</span>
              <span>• Todo dia ${fe.billingDay}</span>
              ${fe.cardId ? `<span>• 💳 ${escHtml(cards.find(c=>c.id===fe.cardId)?.name||"")}</span>` : ""}
              ${!fe.isActive ? `<span style="color:var(--destructive); font-weight:600;">(Inativo)</span>` : ""}
            </div>
          </div>
          <div class="list-item-amount c-expense">${formatBRL(fe.amount)}</div>
          <div class="list-actions">
            <button class="btn-ghost btn" onclick="editFixed('${fe.id}')">${editIcon()}</button>
            <button class="btn-ghost btn" onclick="deleteFixed('${fe.id}')" style="color:var(--destructive)">${trashIcon()}</button>
          </div>
        </div>`;
      }).join("")}</div>`;

  container.innerHTML = `
  <div class="page-header">
    <div><h1>Gastos</h1><p>Controle todas as suas despesas</p></div>
    <button class="btn btn-primary" id="btn-add-expense" onclick="openVarModal()">${plusIcon()} Adicionar Gasto</button>
  </div>

  <div id="expense-tabs">
    <div class="tabs">
      <button class="tab-btn active" data-tab="tab-var" onclick="switchExpTab(this,'tab-var','btn-add-expense',false)">Gastos Variáveis</button>
      <button class="tab-btn" data-tab="tab-fixed" onclick="switchExpTab(this,'tab-fixed','btn-add-expense',true)">Despesas Fixas</button>
      <button class="tab-btn" data-tab="tab-investments" onclick="switchExpTab(this,'tab-investments','btn-add-expense',false)">Investimentos</button>
    </div>

    <!-- Variable -->
    <div class="tab-panel active" id="tab-var">
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-card-row"><span class="card-title-sm">Total Gastos</span>${trendDownIcon()}</div>
          <div class="stat-value c-expense">${formatBRL(totalExp)}</div>
          <div class="stat-sub">${allExp.length} transação(ões)</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-row"><span class="card-title-sm">Cartão Crédito</span>${cardIcon()}</div>
          <div class="stat-value c-credit">${formatBRL(totalCredit)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-row"><span class="card-title-sm">Parcelamentos</span>${cardIcon()}</div>
          <div class="stat-value c-invest">${allExp.filter(e=>e.isInstallment&&!e.paid).length}</div>
          <div class="stat-sub">ativos este mês</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header" style="padding:1rem 1.25rem .75rem">
          <span class="card-title">Gastos de ${monthName(month)}</span>
          <span style="font-size:.8rem;color:var(--muted-foreground);margin-left:auto">${allExp.length} item(s)</span>
        </div>
        <div class="card-body">
          <div class="expense-filter-bar" id="expense-filter-bar">
            <input type="text" id="exp-filter-text" placeholder="🔍 Buscar gasto..." oninput="applyExpenseFilter()" style="min-width:130px;flex:1">
            <select id="exp-filter-cat" onchange="applyExpenseFilter()">
              <option value="">Todas categorias</option>
              <option value="credit">Crédito</option>
              <option value="debit">Débito</option>
              <option value="leisure">Lazer</option>
              <option value="investment">Investimento</option>
              <option value="other">Outros</option>
            </select>
            <button class="filter-sort-btn" id="sort-date-btn" onclick="toggleExpenseSort('date')" title="Ordenar por data">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Data
            </button>
            <button class="filter-sort-btn" id="sort-amount-btn" onclick="toggleExpenseSort('amount')" title="Ordenar por valor">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
              Valor
            </button>
            <button class="filter-sort-btn" onclick="clearExpenseFilter()" title="Limpar filtros" style="opacity:.7">✕</button>
          </div>
          <div id="var-expense-list">${varList}</div>
        </div>
      </div>
    </div>

    <!-- Fixed -->
    <div class="tab-panel" id="tab-fixed">
      <div class="alert alert-info">${infoIcon()} Gastos fixos são contabilizados nas metas e, se pagos em cartão de crédito, aparecem na aba Cartões.</div>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-card-row"><span class="card-title-sm">Total Mensal Fixo</span>${trendDownIcon()}</div>
          <div class="stat-value c-expense">${formatBRL(totalFixed)}</div>
          <div class="stat-sub">${fixedActive.length} ativo(s)</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-row"><span class="card-title-sm">Próximo Vencimento</span>${cardIcon()}</div>
          ${nextDue ? `<div style="font-weight:700">${escHtml(nextDue.fe.name)}</div><div class="stat-sub">Dia ${nextDue.fe.billingDay}${nextDue.nextMonth?" (próx. mês)":""}</div>` : `<div class="stat-sub">-</div>`}
        </div>
        <div class="stat-card">
          <div class="stat-card-row"><span class="card-title-sm">Em Cartão Crédito</span>${cardIcon()}</div>
          <div class="stat-value c-credit">${formatBRL(totalFixedCredit)}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header" style="padding:1rem 1.25rem .75rem"><span class="card-title">Minhas Despesas Fixas</span></div>
        <div class="card-body">${fixedList}</div>
      </div>
    </div>

    <!-- Investments -->
    <div class="tab-panel" id="tab-investments">
      <div id="tab-investments-content"></div>
    </div>
  </div>

  <!-- Modal: Var Expense -->
  <div class="modal-backdrop" id="modal-expense">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title" id="expense-modal-title">Adicionar Gasto</span>
        <button class="modal-close" onclick="closeModal('modal-expense');clearExpForm()">×</button>
      </div>
      <input type="hidden" id="expense-edit-id">
      <div class="form-group">
        <label class="form-label">Descrição *</label>
        <input id="exp-desc" class="form-input" placeholder="Ex: Supermercado, Gasolina">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" id="exp-amount-label">Valor *</label>
          <input id="exp-amount" class="form-input" type="number" step="0.01" placeholder="0.00" oninput="calcInstallmentTotal()">
        </div>
        <div class="form-group">
          <label class="form-label">Data *</label>
          <input id="exp-date" class="form-input" type="date" onchange="updateInvoiceHint()">
        </div>
      </div>
      <div id="exp-invoice-hint" style="display:none" class="alert alert-info" style="margin-bottom:.5rem"></div>
      <div class="form-group">
        <label class="form-label">Categoria</label>
        <select id="exp-cat" class="form-input form-select" onchange="toggleLeisureSub()">
          ${EXPENSE_CATS.map(c=>`<option value="${c.value}">${c.label}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Forma de Pagamento</label>
        <select id="exp-pay" class="form-input form-select" onchange="toggleCardSelect()">
          ${PAYMENT_METHODS.map(p=>`<option value="${p.value}">${p.label}</option>`).join("")}
        </select>
      </div>
      <div class="form-group" id="exp-card-group" style="display:none">
        <label class="form-label">Cartão de Crédito *</label>
        <select id="exp-card" class="form-input form-select" onchange="updateInvoiceHint()">
          <option value="">Selecione um cartão</option>
          ${cards.map(c=>`<option value="${c.id}" data-closing="${c.closingDay}">${escHtml(c.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group" id="exp-leisure-group" style="display:none">
        <label class="form-label">Subcategoria de Lazer</label>
        <select id="exp-sub" class="form-input form-select">
          <option value="">Selecione...</option>
          ${[...LEISURE_SUBS, ...LeisureSubs.all().map(s=>s.name)].map(s=>`<option value="${s}">${escHtml(s)}</option>`).join("")}
        </select>
        <p class="form-hint">Crie novas categorias na aba <strong>Categorias</strong></p>
      </div>
      <div class="form-group">
        <label class="form-label">Integrante *</label>
        <select id="exp-member" class="form-input form-select">
          <option value="">Selecione...</option>
          ${members.map(m=>`<option value="${m.id}" ${m.id===activeMember?.id?"selected":""}>${escHtml(m.emoji||"")} ${escHtml(m.name)}</option>`).join("")}
        </select>
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="exp-installment" onchange="toggleInstallment()">
        <label for="exp-installment">Compra parcelada?</label>
      </div>
      <div id="exp-installment-group" style="display:none">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Qtd. Parcelas *</label>
            <input id="exp-qty" class="form-input" type="number" min="2" value="2" oninput="calcInstallmentTotal()">
          </div>
          <div class="form-group">
            <label class="form-label">Valor Total</label>
            <input id="exp-total" class="form-input" type="number" step="0.01" placeholder="Calculado auto.">
          </div>
        </div>
        <div id="exp-install-summary" style="font-size:.8rem;color:var(--muted-foreground);background:var(--muted);padding:.5rem .75rem;border-radius:.5rem;margin-bottom:.5rem"></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveExpense()">Adicionar</button>
        <button class="btn btn-outline" onclick="closeModal('modal-expense');clearExpForm()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- Modal: Fixed Expense -->
  <div class="modal-backdrop" id="modal-fixed">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title" id="fixed-modal-title">Adicionar Gasto Fixo</span>
        <button class="modal-close" onclick="closeModal('modal-fixed');clearFixedForm()">×</button>
      </div>
      <input type="hidden" id="fixed-edit-id">
      <div class="form-group">
        <label class="form-label">Nome do Gasto *</label>
        <input id="fix-name" class="form-input" placeholder="Ex: Netflix, Internet, Aluguel">
      </div>
      <div class="form-group">
        <label class="form-label">Valor *</label>
        <input id="fix-amount" class="form-input" type="number" step="0.01" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">Categoria *</label>
        <select id="fix-cat" class="form-input form-select">
          ${FIXED_CATS.map(c=>`<option value="${c.value}">${c.label}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Forma de Pagamento *</label>
        <select id="fix-pay" class="form-input form-select" onchange="toggleFixedCardSelect()">
          ${PAYMENT_METHODS.map(p=>`<option value="${p.value}">${p.label}</option>`).join("")}
        </select>
      </div>
      <div class="form-group" id="fix-card-group" style="display:none">
        <label class="form-label">Cartão de Crédito</label>
        <select id="fix-card" class="form-input form-select">
          <option value="">Selecione...</option>
          ${cards.map(c=>`<option value="${c.id}">${escHtml(c.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Dia da Cobrança *</label>
        <input id="fix-day" class="form-input" type="number" min="1" max="31" value="1">
      </div>
      <div class="checkbox-row">
        <label class="switch"><input type="checkbox" id="fix-active" checked><span class="switch-slider"></span></label>
        <label for="fix-active">Ativo</label>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveFixed()">Adicionar</button>
        <button class="btn btn-outline" onclick="closeModal('modal-fixed');clearFixedForm()">Cancelar</button>
      </div>
    </div>
  </div>`;

  // Define a data padrão
  document.getElementById("exp-date").value = new Date().toISOString().split("T")[0];

  const activeTab = (params && params.tab) || window.activeExpenseTab || "tab-var";
  const tabBtn = document.querySelector(`[data-tab="${activeTab}"]`);
  if (tabBtn) {
    setTimeout(() => {
      switchExpTab(tabBtn, activeTab, 'btn-add-expense', activeTab === "tab-fixed");
    }, 50);
  }
}

function switchExpTab(btn, tab, btnId, isFixed) {
  window.activeExpenseTab = tab;
  document.querySelectorAll("#expense-tabs .tab-btn").forEach(b => b.classList.toggle("active", b === btn));
  document.querySelectorAll("#expense-tabs .tab-panel").forEach(p => p.classList.toggle("active", p.id === tab));
  const addBtn = document.getElementById(btnId);
  if (addBtn) {
    addBtn.style.display = "";
    addBtn.textContent = "";
    if (tab === "tab-investments") {
      addBtn.innerHTML = plusIcon() + " Adicionar Investimento";
      addBtn.onclick = () => {
        document.getElementById("invest-title").textContent = "Adicionar Investimento";
        document.getElementById("invest-edit-id").value = "";
        document.getElementById("inv-type").value = "";
        document.getElementById("inv-amount").value = "";
        document.getElementById("inv-profit").value = "";
        openModal("modal-invest");
      };
      if (typeof renderInvestments === "function") {
        renderInvestments(document.getElementById("tab-investments-content"), true);
      }
    } else if (isFixed) {
      addBtn.innerHTML = plusIcon() + " Adicionar Gasto Fixo";
      addBtn.onclick = openFixedModal;
      if (FixedExpenses.all().length === 0) {
        addBtn.style.display = "none";
      }
    } else {
      addBtn.innerHTML = plusIcon() + " Adicionar Gasto";
      addBtn.onclick = openVarModal;
      if (Expenses.byMonth(MonthState.get()).length === 0) {
        addBtn.style.display = "none";
      }
    }
  }
}

function openVarModal() { clearExpForm(); openModal("modal-expense"); }
function openFixedModal() { clearFixedForm(); openModal("modal-fixed"); }

function toggleCardSelect() {
  const pay = document.getElementById("exp-pay").value;
  document.getElementById("exp-card-group").style.display = pay === "credit" ? "" : "none";
  updateInvoiceHint();
}
function toggleFixedCardSelect() {
  const pay = document.getElementById("fix-pay").value;
  document.getElementById("fix-card-group").style.display = pay === "credit" ? "" : "none";
}
function toggleLeisureSub() {
  const cat = document.getElementById("exp-cat").value;
  document.getElementById("exp-leisure-group").style.display = cat === "leisure" ? "" : "none";
}
function toggleInstallment() {
  const checked = document.getElementById("exp-installment").checked;
  document.getElementById("exp-installment-group").style.display = checked ? "" : "none";
  document.getElementById("exp-amount-label").textContent = checked ? "Valor da Parcela *" : "Valor *";
}
function calcInstallmentTotal() {
  const amt = parseFloat(document.getElementById("exp-amount").value);
  const qty = parseInt(document.getElementById("exp-qty")?.value);
  if (isNaN(amt) || isNaN(qty) || qty < 1) return;
  const total = (amt * qty).toFixed(2);
  const el = document.getElementById("exp-total");
  if (el) el.value = total;
  const sum = document.getElementById("exp-install-summary");
  if (sum) sum.textContent = `${qty}x de R$ ${amt.toFixed(2).replace(".",",")} = R$ ${total.replace(".",",")}`;
}
function updateInvoiceHint() {
  const pay = document.getElementById("exp-pay").value;
  const cardSel = document.getElementById("exp-card");
  const date = document.getElementById("exp-date").value;
  const hint = document.getElementById("exp-invoice-hint");
  if (pay !== "credit" || !cardSel || !date) { hint.style.display = "none"; return; }
  const opt = cardSel.options[cardSel.selectedIndex];
  if (!opt || !opt.dataset.closing) { hint.style.display = "none"; return; }
  const closing = parseInt(opt.dataset.closing);
  const invoiceMonth = calcInvoiceMonth(date, closing);
  const names = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  const [iy, im] = invoiceMonth.split("-");
  hint.style.display = "flex";
  hint.innerHTML = `${infoIcon()} Gasto entrará na fatura de <strong>${names[parseInt(im)-1]} de ${iy}</strong>`;
}

function saveExpense() {
  const desc = document.getElementById("exp-desc").value.trim();
  const amount = parseFloat(document.getElementById("exp-amount").value);
  const date = document.getElementById("exp-date").value;
  const cat = document.getElementById("exp-cat").value;
  const pay = document.getElementById("exp-pay").value;
  const cardId = document.getElementById("exp-card").value;
  const sub = document.getElementById("exp-sub")?.value || "";
  const memberId = document.getElementById("exp-member").value;
  const isInstall = document.getElementById("exp-installment").checked;
  const qty = isInstall ? parseInt(document.getElementById("exp-qty").value) : 1;
  const total = isInstall ? parseFloat(document.getElementById("exp-total").value) : amount;
  const editId = document.getElementById("expense-edit-id").value;

  if (!desc || !amount || !date) {
    // Validação visual
    if (!desc) { const el = document.getElementById("exp-desc"); el.classList.add("invalid"); setTimeout(() => el.classList.remove("invalid"), 1000); }
    if (!amount) { const el = document.getElementById("exp-amount"); el.classList.add("invalid"); setTimeout(() => el.classList.remove("invalid"), 1000); }
    if (!date) { const el = document.getElementById("exp-date"); el.classList.add("invalid"); setTimeout(() => el.classList.remove("invalid"), 1000); }
    Toast.error("Preencha todos os campos obrigatórios"); return;
  }
  if (pay === "credit" && !cardId) {
    const el = document.getElementById("exp-card"); el.classList.add("invalid"); setTimeout(() => el.classList.remove("invalid"), 1000);
    Toast.error("Selecione um cartão de crédito"); return;
  }
  if (!memberId) {
    const el = document.getElementById("exp-member"); el.classList.add("invalid"); setTimeout(() => el.classList.remove("invalid"), 1000);
    Toast.error("Selecione o integrante"); return;
  }

  const original = editId ? Expenses.all().find(x => x.id === editId) : null;
  const data = {
    description: desc, amount, category: cat, subcategory: sub || null,
    paymentMethod: pay, date, cardId: cardId || null,
    isInstallment: isInstall, installments: isInstall ? qty : null,
    totalAmount: isInstall ? total : null, month: date.slice(0,7),
    paid: false, memberId,
    installmentNumber: isInstall ? (original?.installmentNumber || 1) : null,
  };

  if (editId) {
    Expenses.update(editId, data);
    Toast.success("Gasto atualizado!");
  } else {
    Expenses.add(data);
    Toast.success(isInstall ? `Parcelamento criado (${qty}x)!` : "Gasto adicionado!");

    // Recurrent expense check
    const month = date.slice(0, 7);
    const prev1 = prevMonth(month);
    const prev2 = prevMonth(prev1);
    
    const hasPrev1 = Expenses.all().some(e => 
      e.month === prev1 &&
      e.description.trim().toLowerCase() === desc.trim().toLowerCase() &&
      Math.abs(e.amount - amount) / amount <= 0.05
    );
    const hasPrev2 = Expenses.all().some(e => 
      e.month === prev2 &&
      e.description.trim().toLowerCase() === desc.trim().toLowerCase() &&
      Math.abs(e.amount - amount) / amount <= 0.05
    );
    
    if (hasPrev1 && hasPrev2) {
      setTimeout(() => {
        if (typeof Toast.suggestFixed === "function") {
          Toast.suggestFixed(desc, amount, cat, pay, cardId);
        }
      }, 800);
    }
  }
  closeModal("modal-expense");
  clearExpForm();
  renderExpenses(document.getElementById("page-content"));
}

function editExpense(id) {
  const e = Expenses.all().find(x => x.id === id);
  if (!e) return;
  document.getElementById("expense-modal-title").textContent = "Editar Gasto";
  document.getElementById("expense-edit-id").value = id;
  document.getElementById("exp-desc").value = e.description;
  document.getElementById("exp-amount").value = e.amount;
  document.getElementById("exp-date").value = e.date;
  document.getElementById("exp-cat").value = e.category;
  document.getElementById("exp-pay").value = e.paymentMethod;
  document.getElementById("exp-member").value = e.memberId || "";
  toggleCardSelect(); toggleLeisureSub();
  if (e.cardId) document.getElementById("exp-card").value = e.cardId;
  if (e.subcategory) { const s = document.getElementById("exp-sub"); if(s) s.value = e.subcategory; }
  
  const expInstall = document.getElementById("exp-installment");
  if (expInstall) {
    expInstall.checked = !!e.isInstallment;
    toggleInstallment();
    if (e.isInstallment) {
      document.getElementById("exp-qty").value = e.installments || 2;
      document.getElementById("exp-total").value = e.totalAmount || (e.amount * (e.installments || 2));
      calcInstallmentTotal();
    }
  }
  openModal("modal-expense");
}

async function deleteExpenseItem(id) {
  if (!await confirmDelete("Remover este gasto?")) return;
  Expenses.remove(id);
  Toast.success("Gasto removido!");
  renderExpenses(document.getElementById("page-content"));
}

function clearExpForm() {
  ["expense-edit-id","exp-desc","exp-amount","exp-card"].forEach(id => { const el = document.getElementById(id); if(el) el.value = ""; });
  const expDate = document.getElementById("exp-date"); if(expDate) expDate.value = new Date().toISOString().split("T")[0];
  const expCat = document.getElementById("exp-cat"); if(expCat) expCat.value = "other";
  const expPay = document.getElementById("exp-pay"); if(expPay) expPay.value = "debit";
  const expInstall = document.getElementById("exp-installment"); if(expInstall) expInstall.checked = false;
  document.getElementById("exp-card-group").style.display = "none";
  document.getElementById("exp-leisure-group").style.display = "none";
  document.getElementById("exp-installment-group").style.display = "none";
  document.getElementById("exp-invoice-hint").style.display = "none";
  document.getElementById("expense-modal-title").textContent = "Adicionar Gasto";
  document.getElementById("exp-amount-label").textContent = "Valor *";
}

// Fixed helpers
function saveFixed() {
  const name = document.getElementById("fix-name").value.trim();
  const amount = parseFloat(document.getElementById("fix-amount").value);
  const cat = document.getElementById("fix-cat").value;
  const pay = document.getElementById("fix-pay").value;
  const cardId = document.getElementById("fix-card")?.value || "";
  const day = parseInt(document.getElementById("fix-day").value);
  const active = document.getElementById("fix-active").checked;
  const editId = document.getElementById("fixed-edit-id").value;
  if (!name || !amount || !day) { Toast.error("Preencha todos os campos"); return; }
  const data = { name, amount, category: cat, paymentMethod: pay, cardId: cardId || null, billingDay: day, isActive: active };
  if (editId) { FixedExpenses.update(editId, data); Toast.success("Gasto fixo atualizado!"); }
  else { FixedExpenses.add(data); Toast.success("Gasto fixo adicionado!"); }
  closeModal("modal-fixed");
  clearFixedForm();
  renderExpenses(document.getElementById("page-content"));
}

function editFixed(id) {
  const fe = FixedExpenses.all().find(x => x.id === id);
  if (!fe) return;
  document.getElementById("fixed-modal-title").textContent = "Editar Gasto Fixo";
  document.getElementById("fixed-edit-id").value = id;
  document.getElementById("fix-name").value = fe.name;
  document.getElementById("fix-amount").value = fe.amount;
  document.getElementById("fix-cat").value = fe.category;
  document.getElementById("fix-pay").value = fe.paymentMethod;
  document.getElementById("fix-day").value = fe.billingDay;
  document.getElementById("fix-active").checked = fe.isActive;
  toggleFixedCardSelect();
  if (fe.cardId) { const el = document.getElementById("fix-card"); if(el) el.value = fe.cardId; }
  openModal("modal-fixed");
}

async function deleteFixed(id) {
  if (!await confirmDelete("Remover este gasto fixo?")) return;
  FixedExpenses.remove(id);
  Toast.success("Gasto fixo removido!");
  renderExpenses(document.getElementById("page-content"));
}

function toggleFixed(id, val) {
  const month = MonthState.get();
  PaidFixedExpenses.setPaid(id, month, val);
  Toast.success(val ? "Gasto fixo marcado como pago!" : "Gasto fixo marcado como pendente");
  renderExpenses(document.getElementById("page-content"));
}

function clearFixedForm() {
  document.getElementById("fixed-modal-title").textContent = "Adicionar Gasto Fixo";
  document.getElementById("fixed-edit-id").value = "";
  document.getElementById("fix-name").value = "";
  document.getElementById("fix-amount").value = "";
  document.getElementById("fix-day").value = "1";
  document.getElementById("fix-active").checked = true;
  document.getElementById("fix-card-group").style.display = "none";
}

// ── Filtro e Ordenação de Gastos ─────────────────────────────────────────────
let _expSortField = null;
let _expSortAsc = true;

function applyExpenseFilter() {
  const listEl = document.getElementById("var-expense-list");
  if (!listEl) return;

  const text  = (document.getElementById("exp-filter-text")?.value || "").toLowerCase().trim();
  const cat   = document.getElementById("exp-filter-cat")?.value || "";
  const month = MonthState.get();
  const cards = Cards.all();
  const members = Members.all();

  let data = Expenses.byMonth(month);

  // Filtrar
  if (text) data = data.filter(e => e.description.toLowerCase().includes(text));
  if (cat)  data = data.filter(e => e.category === cat || (cat === "credit" && e.paymentMethod === "credit"));

  // Ordenar
  if (_expSortField === "date") {
    data = [...data].sort((a, b) => _expSortAsc
      ? a.date.localeCompare(b.date)
      : b.date.localeCompare(a.date));
  } else if (_expSortField === "amount") {
    data = [...data].sort((a, b) => _expSortAsc ? a.amount - b.amount : b.amount - a.amount);
  }

  const catBadge = (e) => {
    const map = { credit: "badge-credit", debit: "badge-debit", leisure: "badge-leisure", investment: "badge-investment", other: "badge-other" };
    const labels = { credit: "Crédito", debit: "Débito", leisure: "Lazer", investment: "Investimento", other: "Outros" };
    return `<span class="badge ${map[e.category]||"badge-other"}">${labels[e.category]||e.category}</span>`;
  };
  const memberBadge = (id) => Members.getBadge(id);

  if (data.length === 0) {
    listEl.innerHTML = `<div class="empty">${trendDownIcon()}<p>Nenhum gasto encontrado</p></div>`;
    return;
  }

  listEl.innerHTML = `<div class="list">${data.map(e => `
    <div class="list-item" id="expense-item-${e.id}">
      <div class="list-item-main">
        <div class="list-item-title" style="display:flex;align-items:center;gap:.4rem">
          ${escHtml(e.description)}
          ${e.isInstallment ? `<span class="badge badge-parcela">${e.installmentNumber}/${e.installments}x</span>` : ""}
        </div>
        <div class="list-item-sub" style="display:flex;align-items:center;gap:.35rem;flex-wrap:wrap">
          <span>${formatDateBR(e.date)}</span>
          ${catBadge(e)}
          ${e.subcategory ? `<span class="badge badge-other">${escHtml(e.subcategory)}</span>` : ""}
          <span style="font-size:.72rem;color:var(--muted-foreground)">${PAYMENT_METHODS.find(p=>p.value===e.paymentMethod)?.label||e.paymentMethod}</span>
          ${e.cardId ? `<span style="font-size:.72rem">💳 ${escHtml(cards.find(c=>c.id===e.cardId)?.name||"")}</span>` : ""}
          ${memberBadge(e.memberId)}
        </div>
      </div>
      <div class="list-item-amount c-expense">${formatBRL(e.amount)}</div>
      <div class="list-actions">
        <button class="btn-ghost btn" onclick="editExpense('${e.id}')">${editIcon()}</button>
        <button class="btn-ghost btn" onclick="deleteExpenseItem('${e.id}')" style="color:var(--destructive)">${trashIcon()}</button>
      </div>
    </div>`).join("")}</div>`;
}

function toggleExpenseSort(field) {
  if (_expSortField === field) {
    _expSortAsc = !_expSortAsc;
  } else {
    _expSortField = field;
    _expSortAsc = field === "date"; // data: mais recente primeiro (desc), valor: maior primeiro (desc)
    if (field === "amount") _expSortAsc = false;
  }
  // Atualiza estilos dos botões
  ["date", "amount"].forEach(f => {
    const btn = document.getElementById(`sort-${f}-btn`);
    if (btn) btn.classList.toggle("active", _expSortField === f);
  });
  applyExpenseFilter();
}

function clearExpenseFilter() {
  _expSortField = null;
  _expSortAsc = true;
  const textEl = document.getElementById("exp-filter-text");
  const catEl  = document.getElementById("exp-filter-cat");
  if (textEl) textEl.value = "";
  if (catEl)  catEl.value = "";
  ["date", "amount"].forEach(f => {
    const btn = document.getElementById(`sort-${f}-btn`);
    if (btn) btn.classList.remove("active");
  });
  applyExpenseFilter();
}
