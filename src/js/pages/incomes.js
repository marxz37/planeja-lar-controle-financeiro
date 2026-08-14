// ── Página de Receitas ──────────────────────────────────────────────────────────────
Router.register("incomes", (container) => {
  renderIncomes(container);
});

function renderIncomes(container) {
  const month = MonthState.get();
  const members = Members.all();
  const activeMember = Members.getActive();
  const incomes = Incomes.byMonth(month);
  const totalReceived = incomes.filter(i => i.received).reduce((s, i) => s + i.amount, 0);
  const totalPending = incomes.filter(i => !i.received).reduce((s, i) => s + i.amount, 0);

  const memberBadge = (id) => Members.getBadge(id);

  const listHtml = incomes.length === 0
    ? `<div class="empty-state-wrapper">
        <div class="empty-state-icon-container">
          ${trendUpIcon()}
        </div>
        <div class="empty-state-title">Nenhum ganho registrado</div>
        <div class="empty-state-desc">Organize o orçamento do seu lar adicionando as receitas da família para este mês de ${monthName(month)}.</div>
        <button class="btn btn-primary empty-state-action-btn" onclick="openModal('modal-income')">
          ${plusIcon()} Adicionar primeiro ganho
        </button>
      </div>`
    : `<div class="list">${incomes.map(inc => `
      <div class="list-item" id="income-item-${inc.id}">
        <div class="list-item-main">
          <div class="list-item-title">${escHtml(inc.source)}</div>
          <div class="list-item-sub" style="display:flex;gap:.4rem;align-items:center;flex-wrap:wrap">
            <span>${formatDateBR(inc.expectedDate)}</span>
            ${inc.received ? `<span class="badge badge-success">✓ Recebido</span>` : `<span class="badge badge-danger">Pendente</span>`}
            ${memberBadge(inc.memberId)}
          </div>
        </div>
        <div class="list-item-amount c-income">${formatBRL(inc.amount)}</div>
        <div class="list-actions">
          ${!inc.received ? `<button class="btn-ghost btn" title="Marcar recebido" onclick="toggleReceived('${inc.id}',true)">${checkIcon()}</button>` : `<button class="btn-ghost btn" title="Marcar pendente" onclick="toggleReceived('${inc.id}',false)" style="opacity:.5">${checkIcon()}</button>`}
          <button class="btn-ghost btn" onclick="editIncome('${inc.id}')">${editIcon()}</button>
          <button class="btn-ghost btn" onclick="deleteIncome('${inc.id}')" style="color:var(--destructive)">${trashIcon()}</button>
        </div>
      </div>`).join("")}</div>`;

  container.innerHTML = `
  <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
    <div><h1>Ganhos</h1><p>Gerencie suas receitas de ${monthName(month)}</p></div>
    <div style="display:flex; gap:.5rem; align-items:center; flex-wrap:wrap;">
      <input type="text" id="income-search" class="form-input" placeholder="Pesquisar ganho..." style="max-width: 200px; padding: 0.35rem 0.65rem; font-size: 0.8rem; margin: 0;">
      <button class="btn btn-primary" onclick="openModal('modal-income')">${plusIcon()} Adicionar Ganho</button>
    </div>
  </div>

  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-card-row"><span class="card-title-sm">Total Recebido</span>${trendUpIcon()}</div>
      <div class="stat-value c-income">${formatBRL(totalReceived)}</div>
      <div class="stat-sub">${incomes.filter(i=>i.received).length} ganho(s) recebido(s)</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-row"><span class="card-title-sm">A Receber</span>${infoIcon()}</div>
      <div class="stat-value">${formatBRL(totalPending)}</div>
      <div class="stat-sub">${incomes.filter(i=>!i.received).length} ganho(s) pendente(s)</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-row"><span class="card-title-sm">Total do Mês</span>${walletIcon()}</div>
      <div class="stat-value">${formatBRL(totalReceived + totalPending)}</div>
    </div>
  </div>

  <div class="card">
    <div class="card-header" style="padding:1rem 1.25rem .75rem"><span class="card-title">Ganhos de ${monthName(month)}</span></div>
    <div class="card-body">${listHtml}</div>
  </div>

  <!-- Modal -->
  <div class="modal-backdrop" id="modal-income">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title" id="income-modal-title">Adicionar Ganho</span>
        <button class="modal-close" onclick="closeModal('modal-income')">×</button>
      </div>
      <input type="hidden" id="income-edit-id">
      <div class="form-group">
        <label class="form-label">Fonte / Descrição *</label>
        <input id="income-source" class="form-input" placeholder="Ex: Salário, Freelance...">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Valor *</label>
          <input id="income-amount" class="form-input" type="number" step="0.01" placeholder="0.00">
        </div>
        <div class="form-group">
          <label class="form-label">Data prevista *</label>
          <input id="income-date" class="form-input" type="date">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Integrante *</label>
        <select id="income-member" class="form-input form-select">
          <option value="">Selecione...</option>
          ${members.map(m => `<option value="${m.id}" ${m.id === activeMember?.id ? "selected" : ""}>${escHtml(m.emoji||"")} ${escHtml(m.name)}</option>`).join("")}
        </select>
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="income-received">
        <label for="income-received">Já recebido?</label>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveIncome()">Salvar</button>
        <button class="btn btn-outline" onclick="closeModal('modal-income');clearIncomeForm()">Cancelar</button>
      </div>
    </div>
  </div>`;

  // Data padrão
  const today = new Date().toISOString().split("T")[0];
  const [y, m2] = month.split("-");
  document.getElementById("income-date").value = `${y}-${m2}-${today.split("-")[2]}`;

  // Evento de Pesquisa/Filtro
  const searchInput = container.querySelector("#income-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const items = container.querySelectorAll(".list-item");
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

      const listContainer = container.querySelector(".list");
      let emptySearch = container.querySelector("#income-search-empty");

      if (visibleCount === 0 && items.length > 0) {
        if (!emptySearch) {
          emptySearch = document.createElement("div");
          emptySearch.id = "income-search-empty";
          emptySearch.className = "empty";
          emptySearch.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto .75rem; display: block; opacity: 0.3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <p>Nenhum ganho corresponde à pesquisa</p>`;
          listContainer.parentNode.appendChild(emptySearch);
        }
        if (listContainer) listContainer.style.display = "none";
      } else {
        if (emptySearch) emptySearch.remove();
        if (listContainer) listContainer.style.display = "flex";
      }
    });
  }
}

function saveIncome() {
  const source = document.getElementById("income-source").value.trim();
  const amount = parseFloat(document.getElementById("income-amount").value);
  const date = document.getElementById("income-date").value;
  const memberId = document.getElementById("income-member").value;
  const received = document.getElementById("income-received").checked;
  const editId = document.getElementById("income-edit-id").value;

  if (!source || !amount || !date) {
    if (!source) { const el = document.getElementById("income-source"); el.classList.add("invalid"); setTimeout(() => el.classList.remove("invalid"), 1000); }
    if (!amount) { const el = document.getElementById("income-amount"); el.classList.add("invalid"); setTimeout(() => el.classList.remove("invalid"), 1000); }
    if (!date)   { const el = document.getElementById("income-date");   el.classList.add("invalid"); setTimeout(() => el.classList.remove("invalid"), 1000); }
    Toast.error("Preencha todos os campos"); return;
  }
  if (!memberId) {
    const el = document.getElementById("income-member"); el.classList.add("invalid"); setTimeout(() => el.classList.remove("invalid"), 1000);
    Toast.error("Selecione o integrante"); return;
  }

  const targetMonth = date.slice(0, 7);
  const data = { source, amount, expectedDate: date, received, month: targetMonth, memberId };

  if (editId) { Incomes.update(editId, data); Toast.success("Ganho atualizado!"); }
  else { Incomes.add(data); Toast.success("Ganho adicionado!"); }

  closeModal("modal-income");
  clearIncomeForm();
  renderIncomes(document.getElementById("page-content"));
}

function editIncome(id) {
  const inc = Incomes.all().find(i => i.id === id);
  if (!inc) return;
  document.getElementById("income-modal-title").textContent = "Editar Ganho";
  document.getElementById("income-edit-id").value = id;
  document.getElementById("income-source").value = inc.source;
  document.getElementById("income-amount").value = inc.amount;
  document.getElementById("income-date").value = inc.expectedDate;
  document.getElementById("income-member").value = inc.memberId || "";
  document.getElementById("income-received").checked = inc.received;
  openModal("modal-income");
}

async function deleteIncome(id) {
  if (!await confirmDelete("Remover este ganho?")) return;
  Incomes.remove(id);
  Toast.success("Ganho removido!");
  renderIncomes(document.getElementById("page-content"));
}

function toggleReceived(id, val) {
  Incomes.update(id, { received: val });
  Toast.success(val ? "Marcado como recebido!" : "Marcado como pendente");
  renderIncomes(document.getElementById("page-content"));
}

function clearIncomeForm() {
  document.getElementById("income-modal-title").textContent = "Adicionar Ganho";
  document.getElementById("income-edit-id").value = "";
  document.getElementById("income-source").value = "";
  document.getElementById("income-amount").value = "";
  document.getElementById("income-received").checked = false;
}
