// ── Dashboard ─────────────────────────────────────────────────────────────────
Router.register("dashboard", (container) => {
  const activeM = Members.getActive();
  const streak = activeM ? (activeM.streak || 0) : 0;
  const month = MonthState.get(); // Espera-se formato "YYYY-MM"
  const prev = prevMonth(month);
  const incomes = Incomes.byMonth(month);
  const expenses = Expenses.byMonth(month);
  const prevExp = Expenses.byMonth(prev);
  const cards = Cards.all();
  const fixedActive = FixedExpenses.active();

  const totalIncome = incomes.filter(i => i.received).reduce((s, i) => s + i.amount, 0);
  const totalPending = incomes.filter(i => !i.received).reduce((s, i) => s + i.amount, 0);
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const prevTotalExp = prevExp.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExp;
  const fixedTotal = fixedActive.reduce((s, f) => s + f.amount, 0);

  // Totais dos cartões
  const cardTotals = cards.map(card => {
    const cardExp = expenses.filter(e => e.cardId === card.id && !e.paid);
    const fixedOnCard = fixedActive.filter(f => f.paymentMethod === "credit" && f.cardId === card.id);
    const used = cardExp.reduce((s, e) => s + e.amount, 0) + fixedOnCard.reduce((s, f) => s + f.amount, 0);
    return { card, used };
  });
  const totalCardUsed = cardTotals.reduce((s, c) => s + c.used, 0);

  // Distribuição por categoria
  const catData = [
    { name: "Crédito", value: expenses.filter(e => e.paymentMethod === "credit").reduce((s, e) => s + e.amount, 0), color: "hsl(192,70%,42%)" },
    { name: "Débito", value: expenses.filter(e => e.category === "debit").reduce((s, e) => s + e.amount, 0), color: "hsl(210,65%,50%)" },
    { name: "Lazer", value: expenses.filter(e => e.category === "leisure").reduce((s, e) => s + e.amount, 0), color: "hsl(280,65%,60%)" },
    { name: "Investimento", value: expenses.filter(e => e.category === "investment").reduce((s, e) => s + e.amount, 0), color: "hsl(38,92%,50%)" },
    { name: "Outros", value: expenses.filter(e => e.category === "other").reduce((s, e) => s + e.amount, 0), color: "hsl(195,20%,55%)" },
  ].filter(d => d.value > 0);

  // Tendência
  const expChange = prevTotalExp > 0 ? ((totalExp - prevTotalExp) / prevTotalExp * 100).toFixed(1) : null;
  const day = new Date().getDate();
  const tip1 = DAILY_TIPS[day % DAILY_TIPS.length];
  const tip2 = DAILY_TIPS[(day + 3) % DAILY_TIPS.length];
  const tip3 = DAILY_TIPS[(day + 7) % DAILY_TIPS.length];

  // Progresso das metas
  const goals = Goals.byMonth(month);
  const savings = totalIncome - totalExp;
  const goalItems = goals.map(g => {
    let current = 0, label = "";
    if (g.category === "savings") { current = savings; label = "Poupança"; }
    else if (g.category === "leisure") { current = expenses.filter(e => e.category === "leisure").reduce((s, e) => s + e.amount, 0); label = "Lazer"; }
    else if (g.category === "credit") { current = expenses.filter(e => e.paymentMethod === "credit").reduce((s, e) => s + e.amount, 0); label = "Crédito"; }
    else if (g.category === "investment") { current = expenses.filter(e => e.category === "investment").reduce((s, e) => s + e.amount, 0); label = "Investimento"; }
    const pct = Math.min(current / g.target * 100, 100);
    const color = pct >= 100 ? "danger" : pct >= 80 ? "warn" : "";
    return `<div style="margin-bottom:.75rem">
      <div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:.25rem">
        <span>${escHtml(label)}</span>
        <span style="font-weight:600">${formatBRL(current)} / ${formatBRL(g.target)}</span>
      </div>
      <div class="progress-bar"><div class="progress-fill ${color}" style="width:${pct}%"></div></div>
    </div>`;
  }).join("");

  // Saúde financeira score 50/30/20
  const essential = fixedTotal + expenses.filter(e => e.category !== "leisure" && e.category !== "investment").reduce((s, e) => s + e.amount, 0);
  const wants = expenses.filter(e => e.category === "leisure").reduce((s, e) => s + e.amount, 0);
  const savingsAndInvest = balance + expenses.filter(e => e.category === "investment").reduce((s, e) => s + e.amount, 0);
  
  let score = 0;
  let feedback = "";
  let essentialPct = 0;
  let wantsPct = 0;
  let savingsPct = 0;
  
  if (totalIncome > 0) {
    essentialPct = essential / totalIncome * 100;
    wantsPct = wants / totalIncome * 100;
    savingsPct = savingsAndInvest / totalIncome * 100;
    
    const diffEssential = Math.abs(essentialPct - 50);
    const diffWants = Math.abs(wantsPct - 30);
    const diffSavings = Math.max(0, 20 - savingsPct);
    const penalty = diffEssential + diffWants + diffSavings;
    score = Math.max(0, Math.round(100 - penalty));
    
    const issues = [];
    if (essentialPct > 55) issues.push(`gastos essenciais acima do recomendado (${essentialPct.toFixed(0)}% vs 50%)`);
    if (wantsPct > 35) issues.push(`gastos com lazer acima do recomendado (${wantsPct.toFixed(0)}% vs 30%)`);
    if (savingsPct < 15) issues.push(`poupança/investimentos abaixo de 20% (${savingsPct.toFixed(0)}% vs 20%)`);
    
    if (issues.length > 0) {
      feedback = "Ajustes sugeridos: " + issues.join(", ") + ".";
    } else {
      feedback = "Parabéns! Seus gastos estão equilibrados na regra 50/30/20.";
    }
  } else {
    feedback = "Registre receitas recebidas para analisar sua saúde financeira.";
  }
  
  const scoreColor = score >= 70 ? "var(--income)" : score >= 40 ? "var(--warning)" : "var(--expense)";
  const dashArray = 220;
  const dashOffset = dashArray * (1 - score / 100);

  container.innerHTML = `
  <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
    <div>
      <h1>Dashboard</h1>
      <p>${monthName(month).charAt(0).toUpperCase() + monthName(month).slice(1)}</p>
    </div>
    <div style="display:flex; align-items:center; gap:.5rem;">
      <label for="dash-month-picker" style="font-size:.875rem; color:var(--muted-foreground); font-weight:500;">Alterar mês:</label>
      <input type="month" id="dash-month-picker" value="${month}" style="padding:.375rem .75rem; border-radius:.375rem; border:1px solid var(--border); background:var(--background); color:var(--foreground); font-family:inherit; font-size:.875rem; cursor:pointer;">
    </div>
  </div>

  ${streak > 0 ? `
  <div class="streak-dashboard-banner" style="display:flex; align-items:center; gap:0.75rem; background:linear-gradient(135deg, hsl(24, 95%, 50%, 0.1) 0%, hsl(14, 95%, 45%, 0.05) 100%); border:1px solid hsl(24, 95%, 50%, 0.25); padding:0.75rem 1.25rem; border-radius:12px; margin-bottom:1.25rem; position:relative; overflow:hidden;">
    <div style="font-size:1.75rem; animation: fireFlame 1.5s ease-in-out infinite alternate;">🔥</div>
    <div style="flex:1;">
      <div style="font-size:0.875rem; font-weight:700; color:var(--foreground); display:flex; align-items:center; gap:0.35rem;">
        Ofensiva de Acesso Mantida! 
        <span class="badge badge-success" style="font-size:0.65rem; background:hsl(24, 95%, 50%, 0.15); color:hsl(24, 95%, 45%); border:1px solid hsl(24, 95%, 50%, 0.2); font-weight:700; padding: 0.1rem 0.4rem;">${streak} dia${streak === 1 ? "" : "s"}</span>
      </div>
      <p style="font-size:0.78rem; color:var(--muted-foreground); margin:0.1rem 0 0 0;">Você está mantendo o foco nas finanças. Continue registrando seus lançamentos para não perder a ofensiva!</p>
    </div>
  </div>
  ` : ""}

  <div class="stat-grid">
    <div class="stat-card" data-tip="${totalPending > 0 ? `+ ${formatBRL(totalPending)} pendente` : `${incomes.filter(i=>i.received).length} recebimento(s)`}">
      <div class="stat-card-row"><span class="card-title-sm">Receita Recebida</span>${trendUpIcon()}</div>
      <div class="stat-value c-income animate-count" data-val="${totalIncome}">R$ 0,00</div>
      ${totalPending > 0 ? `<div class="stat-sub">+ ${formatBRL(totalPending)} pendente</div>` : ""}
    </div>
    <div class="stat-card" data-tip="${expChange !== null ? `${parseFloat(expChange) > 0 ? '▲' : '▼'} ${Math.abs(parseFloat(expChange))}% vs mês anterior` : `${expenses.length} transação(ões)`}">
      <div class="stat-card-row"><span class="card-title-sm">Total Gastos</span>${trendDownIcon()}</div>
      <div class="stat-value c-expense animate-count" data-val="${totalExp}">R$ 0,00</div>
      ${expChange !== null ? `<div class="stat-sub" style="color:${parseFloat(expChange) > 0 ? "var(--expense)" : "var(--income)"}">${parseFloat(expChange) > 0 ? "▲" : "▼"} ${Math.abs(parseFloat(expChange))}% vs mês anterior</div>` : ""}
    </div>
    <div class="stat-card" data-tip="${balance >= 0 ? 'Você está no positivo! 🎉' : 'Gastos acima da renda ⚠️'}">
      <div class="stat-card-row"><span class="card-title-sm">Saldo</span>${walletIcon()}</div>
      <div class="stat-value animate-count" data-val="${balance}" style="color:${balance >= 0 ? "var(--income)" : "var(--expense)"}">R$ 0,00</div>
    </div>
    <div class="stat-card" data-tip="${cards.length} cartão(ões) cadastrado(s)">
      <div class="stat-card-row"><span class="card-title-sm">Cartões (fatura)</span>${cardIcon()}</div>
      <div class="stat-value c-credit animate-count" data-val="${totalCardUsed}">R$ 0,00</div>
      <div class="stat-sub">${cards.length} cartão(ões)</div>
    </div>
    <div class="stat-card" data-tip="${fixedActive.length} despesa(s) fixa(s) ativa(s)">
      <div class="stat-card-row"><span class="card-title-sm">Gastos Fixos</span>${rotateIcon()}</div>
      <div class="stat-value c-warn animate-count" data-val="${fixedTotal}">R$ 0,00</div>
      <div class="stat-sub">${fixedActive.length} ativo(s)</div>
    </div>
  </div>

  <div class="dash-grid" style="grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));">
    <div class="card">
      <div class="card-header" style="padding:1rem 1.25rem .75rem"><span class="card-title">Saúde Financeira do Mês</span></div>
      <div class="card-body" style="display:flex; flex-direction:column; align-items:center; text-align:center; padding-top:0;">
        <svg width="180" height="100" viewBox="0 0 180 100" style="margin-top:0.5rem;">
          <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="var(--border)" stroke-width="12" stroke-linecap="round"/>
          <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="${scoreColor}" stroke-width="12" stroke-linecap="round"
                stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}" style="transition: stroke-dashoffset 0.6s ease;"/>
          <text x="90" y="70" text-anchor="middle" font-size="28" font-weight="700" fill="var(--foreground)">${score}</text>
          <text x="90" y="88" text-anchor="middle" font-size="10" fill="var(--muted-foreground)">Score</text>
        </svg>
        <p style="font-size:0.8rem; font-weight:500; color:var(--foreground); margin-top:0.5rem; max-width:240px;">${feedback}</p>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header" style="padding:1rem 1.25rem .75rem"><span class="card-title">Gastos por Categoria</span></div>
      <div class="card-body">
        <div id="dash-pie">${catData.length === 0 ? '<p style="color:var(--muted-foreground);font-size:.875rem">Nenhum gasto registrado</p>' : ""}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-header" style="padding:1rem 1.25rem .75rem"><span class="card-title">Metas do Mês</span></div>
      <div class="card-body">
        ${goals.length === 0 ? `<div class="empty" style="padding:1.5rem"><p>Nenhuma meta definida</p><button class="btn btn-sm btn-outline" onclick="Router.go('goals')">Definir metas</button></div>` : goalItems}
      </div>
    </div>
  </div>

  ${cards.length > 0 ? `<div class="card" style="margin-bottom:1rem; margin-top:1rem;">
    <div class="card-header" style="padding:1rem 1.25rem .75rem"><span class="card-title">Resumo dos Cartões</span></div>
    <div class="card-body">
      <div style="display:flex;flex-direction:column;gap:.5rem">
        ${cardTotals.map(({ card, used }) => {
          const pct = Math.min(used / card.limit * 100, 100);
          const color = pct >= 80 ? "danger" : "";
          return `<div>
            <div style="display:flex;justify-content:space-between;font-size:.875rem;margin-bottom:.25rem">
              <span style="font-weight:500">${escHtml(card.name)}</span>
              <span>${formatBRL(used)} / ${formatBRL(card.limit)}</span>
            </div>
            <div class="progress-bar"><div class="progress-fill ${color}" style="width:${pct}%"></div></div>
          </div>`;
        }).join("")}
      </div>
    </div>
  </div>` : ""}

  <div class="card" style="margin-top:1rem;">
    <div class="card-header" style="padding:1rem 1.25rem .75rem;display:flex;align-items:center;gap:.5rem">
      ${lightbulbIcon()}<span class="card-title">FinAI — Análise do Mês</span>
    </div>
    <div class="card-body">
      <div style="display:flex;flex-direction:column;gap:.5rem;font-size:.875rem">
        ${expChange !== null ? `<p>📊 ${parseFloat(expChange) < 0 ? `Você reduziu seus gastos em ${Math.abs(parseFloat(expChange))}% em relação ao mês anterior. Ótimo trabalho!` : `Seus gastos aumentaram ${expChange}% em relação ao mês anterior.`}</p>` : `<p>📊 Sem dados do mês anterior para comparar.</p>`}
        ${balance < 0 ? `<p style="color:var(--expense)">⚠️ Seus gastos superaram a renda em ${formatBRL(Math.abs(balance))} este mês.</p>` : balance > 0 ? `<p style="color:var(--income)">✓ Você economizou ${formatBRL(balance)} este mês.</p>` : ""}
        ${totalCardUsed > totalIncome * 0.3 ? `<p style="color:var(--warning)">💳 Gastos no cartão representam mais de 30% da sua renda.</p>` : ""}
        <div style="color:var(--muted-foreground);border-top:1px solid var(--border);padding-top:0.75rem;margin-top:0.5rem;display:flex;flex-direction:column;gap:0.4rem;">
          <strong style="color:var(--foreground);font-size:0.8rem;margin-bottom:0.15rem;display:block;">💡 Dicas Econômicas Recomendadas:</strong>
          <p style="margin:0;padding-left:0.9rem;text-indent:-0.9rem;">• ${escHtml(tip1)}</p>
          <p style="margin:0;padding-left:0.9rem;text-indent:-0.9rem;">• ${escHtml(tip2)}</p>
          <p style="margin:0;padding-left:0.9rem;text-indent:-0.9rem;">• ${escHtml(tip3)}</p>
        </div>
      </div>
    </div>
  </div>`;

  // Ouvinte de evento para capturar a mudança do mês pelo calendário
  const picker = document.getElementById("dash-month-picker");
  if (picker) {
    picker.addEventListener("change", (e) => {
      const selectedMonth = e.target.value; // Retorna "YYYY-MM"
      if (selectedMonth) {
        MonthState.set(selectedMonth);
        Router.go("dashboard"); // Força a re-renderização do Dashboard com o novo mês
      }
    });
  }

  // Renderiza o gráfico de pizza
  if (catData.length > 0) {
    SVGCharts.pie(document.getElementById("dash-pie"), catData);
  }

  // Trigger count-up statistic animations
  setTimeout(() => {
    document.querySelectorAll(".animate-count").forEach(el => {
      const targetVal = parseFloat(el.dataset.val || "0");
      if (typeof animateValue === "function") {
        animateValue(el, 0, targetVal, 600);
      } else {
        el.textContent = formatBRL(targetVal);
      }
    });
  }, 50);
});