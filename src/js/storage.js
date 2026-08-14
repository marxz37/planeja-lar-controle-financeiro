// ── PlanejaLar — Armazenamento e Estado (localStorage) ──────────────────────────────
const KEYS = {
  auth: "planejaLar.auth",
  accounts: "planejaLar.accounts",
  members: "planejaLar.members",
  activeMember: "planejaLar.activeMemberId",
  incomes: "planejaLar.incomes",
  expenses: "planejaLar.expenses",
  cards: "planejaLar.cards",
  investments: "planejaLar.investments",
  goals: "planejaLar.goals",
  fixedExpenses: "planejaLar.fixedExpenses",
  paidInvoices: "planejaLar.paidInvoices",
  leisureSubs: "planejaLar.leisureSubcategories",
  selectedMonth: "selectedMonth",
  theme: "planejaLar.theme",
  paidFixedExpenses: "planejaLar.paidFixedExpenses",
};

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Resolve a chave final do localStorage isolando os dados de cada conta
function getStorageKey(key) {
  if (key === KEYS.auth || key === KEYS.accounts) {
    return key;
  }
  const userStr = localStorage.getItem(KEYS.auth);
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.email) {
        const safeEmail = user.email.replace(/[^a-zA-Z0-9]/g, "_");
        return `${key}_${safeEmail}`;
      }
    } catch (e) {}
  }
  return key;
}

function load(key) {
  const finalKey = getStorageKey(key);
  try { return JSON.parse(localStorage.getItem(finalKey) || "null"); } catch { return null; }
}
function save(key, val) {
  const finalKey = getStorageKey(key);
  try {
    localStorage.setItem(finalKey, JSON.stringify(val));
    return true;
  } catch (e) {
    if (typeof Toast !== "undefined" && Toast.error) {
      Toast.error("Não foi possível salvar: armazenamento local cheio ou indisponível.");
    }
    return false;
  }
}
function loadArr(key) { return load(key) || []; }
function saveArr(key, arr) { save(key, arr); }

// ── Autenticação ──────────────────────────────────────────────────────────────────────
const Auth = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.auth) || "null");
    } catch {
      return null;
    }
  },
  getAccounts() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.accounts) || "[]");
    } catch {
      return [];
    }
  },
  register(email, password) {
    const accounts = this.getAccounts();
    if (accounts.some(acc => acc.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: "Este email já está cadastrado." };
    }
    accounts.push({ email, password });
    localStorage.setItem(KEYS.accounts, JSON.stringify(accounts));
    return { success: true };
  },
  authenticate(email, password) {
    const accounts = this.getAccounts();
    const acc = accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
    if (!acc) {
      return { success: false, message: "Email não cadastrado." };
    }
    if (acc.password !== password) {
      return { success: false, message: "Senha incorreta." };
    }
    const u = { id: `user-${acc.email}`, email: acc.email };
    localStorage.setItem(KEYS.auth, JSON.stringify(u));
    return { success: true, user: u };
  },
  resetPassword(email, password) {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex(acc => acc.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) {
      return { success: false, message: "Email não cadastrado." };
    }
    accounts[idx].password = password;
    localStorage.setItem(KEYS.accounts, JSON.stringify(accounts));
    return { success: true };
  },
  logout() {
    const activeMemberKey = getStorageKey(KEYS.activeMember);
    localStorage.removeItem(KEYS.auth);
    localStorage.removeItem(activeMemberKey);
  },
};

// ── Integrantes ───────────────────────────────────────────────────────────────────
const Members = {
  all() { return loadArr(KEYS.members); },
  save(arr) { saveArr(KEYS.members, arr); },
  add(m) {
    const all = this.all();
    const item = { id: genId(), ...m, isDefault: all.length === 0 };
    all.push(item);
    this.save(all);
    return item;
  },
  update(id, data) {
    const all = this.all().map(x => x.id === id ? { ...x, ...data } : x);
    this.save(all);
  },
  remove(id) { this.save(this.all().filter(x => x.id !== id)); },
  getActive() {
    const id = load(KEYS.activeMember);
    return this.all().find(m => m.id === id) || null;
  },
  setActive(id) {
    if (id) save(KEYS.activeMember, id);
    else localStorage.removeItem(KEYS.activeMember);
  },
  checkStreak(id) {
    const m = this.all().find(x => x.id === id);
    if (!m) return null;
    
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const todayStr = (new Date(Date.now() - tzoffset)).toISOString().split("T")[0];
    
    let streak = m.streak || 0;
    let lastActive = m.lastActiveDate || "";
    let updated = false;
    
    if (!lastActive) {
      streak = 1;
      lastActive = todayStr;
      updated = true;
    } else {
      const d1 = new Date(lastActive + "T00:00:00");
      const d2 = new Date(todayStr + "T00:00:00");
      const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak += 1;
        lastActive = todayStr;
        updated = true;
      } else if (diffDays > 1) {
        streak = 1;
        lastActive = todayStr;
        updated = true;
      }
    }
    
    if (updated) {
      this.update(id, { streak, lastActiveDate: lastActive });
    }
    return { streak, updated, lastActiveDate: lastActive };
  },
  getBadge(id) {
    const m = this.all().find(x => x.id === id);
    if (!m) return "";
    const avatarHtml = m.photo
      ? `<img src="${m.photo}" style="width:12px;height:12px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:.2rem">`
      : escHtml(m.emoji || "");
    return `<span style="display:inline-flex;align-items:center;gap:.25rem;font-size:.72rem;background:${escHtml(m.color||"#0d9488")}22;color:${escHtml(m.color||"#0d9488")};padding:.1rem .45rem;border-radius:999px;border:1px solid ${escHtml(m.color||"#0d9488")}44">${avatarHtml} ${escHtml(m.name)}</span>`;
  }
};

// ── Receitas ───────────────────────────────────────────────────────────────────
const Incomes = {
  all() { return loadArr(KEYS.incomes); },
  add(data) {
    const all = this.all();
    const item = { id: genId(), ...data };
    all.push(item);
    saveArr(KEYS.incomes, all);
    return item;
  },
  update(id, data) {
    saveArr(KEYS.incomes, this.all().map(x => x.id === id ? { ...x, ...data } : x));
  },
  remove(id) { saveArr(KEYS.incomes, this.all().filter(x => x.id !== id)); },
  byMonth(month) { return this.all().filter(x => x.month === month); },
};

// ── Despesas ──────────────────────────────────────────────────────────────────
function calcInvoiceMonth(purchaseDate, closingDay) {
  const [y, m, d] = purchaseDate.split("-").map(Number);
  let im = m, iy = y;
  if (d > closingDay) {
    im += 1;
    if (im > 12) { im = 1; iy += 1; }
  }
  return `${iy}-${String(im).padStart(2, "0")}`;
}
function addMonths(yyyymm, n) {
  let [y, m] = yyyymm.split("-").map(Number);
  m += n;
  while (m > 12) { m -= 12; y += 1; }
  return `${y}-${String(m).padStart(2, "0")}`;
}

const Expenses = {
  all() { return loadArr(KEYS.expenses); },
  add(data) {
    const cards = Cards.all();
    const card = data.cardId ? cards.find(c => c.id === data.cardId) : null;
    const nParcelas = data.isInstallment && data.installments ? data.installments : 1;
    let firstMonth;
    if (card && data.paymentMethod === "credit") {
      firstMonth = calcInvoiceMonth(data.date, card.closingDay);
    } else {
      firstMonth = data.date.slice(0, 7);
    }
    const valorTotal = data.isInstallment && data.totalAmount ? data.totalAmount : data.amount;
    const base = Math.floor((valorTotal / nParcelas) * 100) / 100;
    const remainder = Math.round((valorTotal - base * nParcelas) * 100) / 100;
    const all = this.all();
    for (let i = 0; i < nParcelas; i++) {
      const month = addMonths(firstMonth, i);
      const amount = i === 0 ? +(base + remainder).toFixed(2) : +base.toFixed(2);
      all.push({
        id: genId(),
        description: data.description,
        amount,
        category: data.category,
        subcategory: data.subcategory || null,
        paymentMethod: data.paymentMethod,
        date: data.date,
        cardId: data.cardId || null,
        isInstallment: nParcelas > 1,
        installments: nParcelas > 1 ? nParcelas : null,
        installmentNumber: nParcelas > 1 ? i + 1 : null,
        totalAmount: nParcelas > 1 ? valorTotal : null,
        month,
        paid: false,
        memberId: data.memberId || null,
      });
    }
    saveArr(KEYS.expenses, all);
  },
  update(id, data) {
    saveArr(KEYS.expenses, this.all().map(x => x.id === id ? { ...x, ...data } : x));
  },
  remove(id) { saveArr(KEYS.expenses, this.all().filter(x => x.id !== id)); },
  byMonth(month) { return this.all().filter(x => x.month === month); },
};

// ── Cartões ─────────────────────────────────────────────────────────────────────
const Cards = {
  all() { return loadArr(KEYS.cards); },
  add(data) {
    const all = this.all();
    const item = { id: genId(), ...data };
    all.push(item);
    saveArr(KEYS.cards, all);
    return item;
  },
  update(id, data) {
    saveArr(KEYS.cards, this.all().map(x => x.id === id ? { ...x, ...data } : x));
  },
  remove(id) { saveArr(KEYS.cards, this.all().filter(x => x.id !== id)); },
};

// ── Investimentos ───────────────────────────────────────────────────────────────
const Investments = {
  all() { return loadArr(KEYS.investments); },
  add(data) {
    const all = this.all();
    const item = { id: genId(), ...data };
    all.push(item);
    saveArr(KEYS.investments, all);
    return item;
  },
  update(id, data) {
    saveArr(KEYS.investments, this.all().map(x => x.id === id ? { ...x, ...data } : x));
  },
  remove(id) { saveArr(KEYS.investments, this.all().filter(x => x.id !== id)); },
  byMonth(month) { return this.all().filter(x => x.month === month); },
};

// ── Metas ─────────────────────────────────────────────────────────────────────
const Goals = {
  all() { return loadArr(KEYS.goals); },
  add(data) {
    const all = this.all();
    const item = { id: genId(), ...data };
    all.push(item);
    saveArr(KEYS.goals, all);
    return item;
  },
  update(id, data) {
    saveArr(KEYS.goals, this.all().map(x => x.id === id ? { ...x, ...data } : x));
  },
  byMonth(month) { return this.all().filter(x => x.month === month); },
};

// ── Despesas Fixas ────────────────────────────────────────────────────────────
const FixedExpenses = {
  all() { return loadArr(KEYS.fixedExpenses); },
  add(data) {
    const all = this.all();
    const item = { id: genId(), isActive: true, ...data };
    all.push(item);
    saveArr(KEYS.fixedExpenses, all);
    return item;
  },
  update(id, data) {
    saveArr(KEYS.fixedExpenses, this.all().map(x => x.id === id ? { ...x, ...data } : x));
  },
  remove(id) { saveArr(KEYS.fixedExpenses, this.all().filter(x => x.id !== id)); },
  active() { return this.all().filter(x => x.isActive); },
};

// ── Faturas Pagas ─────────────────────────────────────────────────────────────
const PaidInvoices = {
  all() { return load(KEYS.paidInvoices) || {}; },
  isPaid(cardId, month) { return !!this.all()[`${cardId}:${month}`]; },
  markPaid(cardId, month) {
    const all = this.all();
    all[`${cardId}:${month}`] = true;
    save(KEYS.paidInvoices, all);
  },
};

// ── Despesas Fixas Pagas ───────────────────────────────────────────────────────
const PaidFixedExpenses = {
  all() { return load(KEYS.paidFixedExpenses) || {}; },
  isPaid(id, month) { return !!this.all()[`${id}:${month}`]; },
  setPaid(id, month, val) {
    const all = this.all();
    if (val) {
      all[`${id}:${month}`] = true;
    } else {
      delete all[`${id}:${month}`];
    }
    save(KEYS.paidFixedExpenses, all);
  }
};

// ── Subcategorias de Lazer ─────────────────────────────────────────────────────
const LeisureSubs = {
  all() { return loadArr(KEYS.leisureSubs); },
  add(data) {
    const all = this.all();
    const item = { id: genId(), ...data };
    all.push(item);
    saveArr(KEYS.leisureSubs, all);
    return item;
  },
  update(id, data) {
    saveArr(KEYS.leisureSubs, this.all().map(x => x.id === id ? { ...x, ...data } : x));
  },
  remove(id) { saveArr(KEYS.leisureSubs, this.all().filter(x => x.id !== id)); },
};

// ── Mês Selecionado ────────────────────────────────────────────────────────────
const MonthState = {
  get() {
    const saved = localStorage.getItem(KEYS.selectedMonth);
    if (saved) return saved;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  },
  set(month) { localStorage.setItem(KEYS.selectedMonth, month); },
};

// ── Tema ─────────────────────────────────────────────────────────────────────
const Theme = {
  get() { return load(KEYS.theme) || "dark"; },
  set(t) {
    save(KEYS.theme, t);
    document.documentElement.classList.toggle("dark", t === "dark");
  },
  toggle() { this.set(this.get() === "dark" ? "light" : "dark"); },
  init() { this.set(this.get()); },
};

// ── Utilitários ───────────────────────────────────────────────────────────────────
function formatBRL(n) {
  const num = Number(n || 0);
  return "R$ " + num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatDateBR(s) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}
function monthName(yyyymm) {
  if (!yyyymm) return "";
  const [y, m] = yyyymm.split("-");
  const names = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  return `${names[parseInt(m) - 1]} de ${y}`;
}
function monthNameShort(yyyymm) {
  if (!yyyymm) return "";
  const [y, m] = yyyymm.split("-");
  const names = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${names[parseInt(m) - 1]}/${y}`;
}
function prevMonth(yyyymm) {
  let [y, m] = yyyymm.split("-").map(Number);
  m -= 1;
  if (m < 1) { m = 12; y -= 1; }
  return `${y}-${String(m).padStart(2, "0")}`;
}
function nextMonth(yyyymm) {
  let [y, m] = yyyymm.split("-").map(Number);
  m += 1;
  if (m > 12) { m = 1; y += 1; }
  return `${y}-${String(m).padStart(2, "0")}`;
}
function escHtml(s) {
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

const DAILY_TIPS = [
  "Guarde pelo menos 10% da sua renda mensal antes de pagar qualquer conta.",
  "Evite compras por impulso: espere 24 horas antes de comprar algo não essencial.",
  "Use a regra 50/30/20: 50% necessidades, 30% desejos, 20% poupança.",
  "Revise suas assinaturas mensais e cancele as que não usa.",
  "Crie uma reserva de emergência com 3 a 6 meses de despesas.",
  "Pague a fatura do cartão de crédito integralmente para evitar juros.",
  "Anote todos os seus gastos, mesmo os pequenos. Eles fazem diferença!",
  "Defina metas financeiras específicas e mensuráveis.",
  "Evite parcelar compras pequenas — isso compromete o orçamento futuro.",
  "Renegocie contratos anuais como internet e celular.",
  "Compare preços online antes de comprar produtos de valor elevado.",
  "Evite ir ao supermercado com fome para reduzir compras por impulso.",
  "Diversifique seus investimentos para reduzir riscos a longo prazo.",
  "Automatize suas poupanças configurando uma transferência automática após o recebimento.",
  "Defina limites semanais para gastos variáveis (como lazer e saídas).",
];

// ── Exportar / Importar Dados (Backup JSON) ───────────────────────────────────
function exportData() {
  try {
    const data = {};
    const exportKeys = ["members", "incomes", "expenses", "cards", "investments", "goals", "fixedExpenses", "paidInvoices", "leisureSubs", "paidFixedExpenses"];
    exportKeys.forEach(k => {
      const keyName = KEYS[k];
      if (keyName) {
        data[k] = load(keyName);
      }
    });
    
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `PlanejaLar_backup_${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Toast.success("Dados exportados com sucesso!");
  } catch (err) {
    Toast.error("Erro ao exportar dados: " + err.message);
  }
}

function triggerImport() {
  const el = document.getElementById("import-file");
  if (el) el.click();
}

async function importData(input) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (typeof data !== "object" || data === null) {
        throw new Error("Formato JSON inválido");
      }
      
      const expectedKeys = ["members", "incomes", "expenses", "cards", "investments", "goals", "fixedExpenses", "paidInvoices", "leisureSubs", "paidFixedExpenses"];
      const hasAnyKey = expectedKeys.some(k => k in data);
      if (!hasAnyKey) {
        throw new Error("Arquivo não contém dados válidos do Planeja Lar");
      }
      
      const confirmed = await confirmDelete("Importar estes dados irá SOBRESCREVER todos os dados atuais do aplicativo. Tem certeza que deseja continuar?");
      if (!confirmed) {
        input.value = "";
        return;
      }
      
      expectedKeys.forEach(k => {
        const keyName = KEYS[k];
        if (keyName && data[k] !== undefined) {
          save(keyName, data[k]);
        }
      });
      
      Toast.success("Dados importados com sucesso!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      Toast.error("Erro ao importar dados: " + err.message);
      input.value = "";
    }
  };
  reader.readAsText(file);
}
