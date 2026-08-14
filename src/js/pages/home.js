// ── Página Inicial (Landing Page) ───────────────────────────────────────────────────────
Router.register("home", (container) => {
  container.innerHTML = `
  <div class="home-page">
    <!-- Floating Blobs for Tech Aesthetics -->
    <div class="home-blob home-blob-1"></div>
    <div class="home-blob home-blob-2"></div>
    <div class="home-blob home-blob-3"></div>

    <!-- Navbar -->
    <nav class="home-nav">
      <div class="home-nav-brand" onclick="Router.go('home')" style="cursor: pointer">
        <img src="assets/logo.png" alt="Planeja Lar" onerror="this.style.display='none'" style="width:32px;height:32px;border-radius:8px">
        <span>Planeja Lar</span>
      </div>
      <div class="home-nav-actions">
        <button class="btn btn-ghost home-nav-btn" onclick="Router.go('auth')">Entrar</button>
        <button class="btn btn-primary home-nav-btn" onclick="Router.go('auth')">Começar grátis</button>
      </div>
    </nav>

    <!-- Hero -->
    <section class="home-hero">
      <div class="home-hero-badge reveal">✦ 100% offline &amp; gratuito</div>
      <h1 class="home-hero-title reveal">
        Controle financeiro<br>
        <span class="rotator-container home-hero-accent">
          <span class="rotator-word" id="hero-rotator">para toda a família</span>
        </span>
      </h1>
      <p class="home-hero-desc reveal">
        Organize ganhos, gastos, cartões, metas e investimentos em um só lugar.
        Simples, seguro e sem precisar de internet.
      </p>
      <div class="home-hero-ctas reveal">
        <button class="btn home-cta-primary" onclick="Router.go('auth')">
          Criar conta grátis
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="btn home-cta-secondary" onclick="document.getElementById('home-features').scrollIntoView({behavior:'smooth'})">
          Ver funcionalidades
        </button>
      </div>

      <!-- Simulador Interativo de Economias (Mockup interativo) -->
      <div class="home-simulator-card reveal">
        <div class="sim-header">
          <h3>Simulador de Economia Familiar</h3>
          <p>Ajuste os valores abaixo para ver em tempo real a economia da sua família e a projeção de crescimento.</p>
        </div>
        <div class="sim-body">
          <div class="sim-presets">
            <span>Cenários:</span>
            <button type="button" class="sim-preset-btn active" data-inc="5000" data-exp="3000">Família Jovem 🏡</button>
            <button type="button" class="sim-preset-btn" data-inc="3000" data-exp="1800">Estudante Só 🎒</button>
            <button type="button" class="sim-preset-btn" data-inc="12000" data-exp="6000">Casal de Sucesso 🚀</button>
          </div>
          <div class="sim-controls">
            <div class="sim-control-group">
              <div class="sim-label-row">
                <span>Renda Mensal Familiar</span>
                <strong id="sim-income-val">R$ 5.000,00</strong>
              </div>
              <input type="range" id="sim-income" min="1000" max="25000" step="500" value="5000" class="sim-slider">
            </div>
            <div class="sim-control-group">
              <div class="sim-label-row">
                <span>Gastos Mensais Totais</span>
                <strong id="sim-expense-val">R$ 3.000,00</strong>
              </div>
              <input type="range" id="sim-expense" min="500" max="20000" step="250" value="3000" class="sim-slider">
            </div>
          </div>
          
          <div class="sim-results">
            <div class="sim-results-grid">
              <div class="sim-result-item">
                <span class="sim-result-label">Economia Mensal</span>
                <strong id="sim-balance-val" class="sim-result-val" style="color: var(--income);">R$ 2.000,00</strong>
              </div>
              <div class="sim-result-item">
                <span class="sim-result-label">Economia em 1 Ano</span>
                <strong id="sim-annual-val" class="sim-result-val" style="color: var(--primary);">R$ 24.000,00</strong>
              </div>
            </div>
            
            <div class="sim-goal-bar">
              <div class="sim-goal-progress">
                <div id="sim-progress-fill" class="sim-progress-fill" style="width: 40%;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--muted-foreground); margin-top:0.35rem;">
                <span id="sim-percent-text">40% poupado</span>
                <span>Poupar mais é evoluir!</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="sim-chart-wrap">
          <svg viewBox="0 0 400 80" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:80px;display:block">
            <defs>
              <linearGradient id="simGradInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
              </linearGradient>
              <linearGradient id="simGradExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#ef4444" stop-opacity="0.2"/>
                <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path id="sim-path-income-fill" d="" fill="url(#simGradInc)"/>
            <path id="sim-path-income" d="" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
            <path id="sim-path-expense-fill" d="" fill="url(#simGradExp)"/>
            <path id="sim-path-expense" d="" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
            <circle id="sim-dot-income" r="4.5" fill="#10b981" stroke="#fff" stroke-width="1.5" class="sim-chart-dot" cx="200" cy="0" />
            <circle id="sim-dot-expense" r="4.5" fill="#ef4444" stroke="#fff" stroke-width="1.5" class="sim-chart-dot" cx="200" cy="0" />
            <text x="12" y="16" font-size="8" font-weight="600" fill="#10b981" opacity="0.9">● Renda Estimada</text>
            <text x="96" y="16" font-size="8" font-weight="600" fill="#ef4444" opacity="0.9">● Gastos Estimados</text>
          </svg>
        </div>
      </div>

      <!-- Mock Dashboard Preview Interativo -->
      <div class="home-sandbox-card reveal" style="transition-delay: 0.1s">
        <div class="sandbox-header">
          <div class="sandbox-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" style="margin-right: 2px"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="9" y1="9" x2="21" y2="9"/></svg>
            <span>Mini-Dashboard Demo</span>
            <span class="sandbox-badge">Demonstração Interativa</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--muted-foreground); font-weight: 500;">Família Silva 🏡</div>
        </div>
        <div class="sandbox-body">
          <div class="sandbox-left">
            <div class="sandbox-stats-grid">
              <div class="sandbox-stat-box">
                <span>Receitas</span>
                <strong id="sand-inc" style="color: var(--income)">R$ 5.500,00</strong>
              </div>
              <div class="sandbox-stat-box">
                <span>Despesas</span>
                <strong id="sand-exp" style="color: var(--expense)">R$ 2.450,00</strong>
              </div>
              <div class="sandbox-stat-box" style="grid-column: span 2">
                <span>Saldo Mensal</span>
                <strong id="sand-bal" style="color: var(--primary)">R$ 3.050,00</strong>
              </div>
            </div>
            
            <div class="sandbox-actions">
              <button type="button" class="btn btn-primary sandbox-btn" id="sand-add-inc">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Mock Receita
              </button>
              <button type="button" class="btn btn-danger sandbox-btn" id="sand-add-exp">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Mock Despesa
              </button>
            </div>
          </div>
          
          <div class="sandbox-right">
            <div class="sandbox-list-wrap">
              <div class="sandbox-list-title">Transações de Teste</div>
              <div class="sandbox-list" id="sand-list">
                <div class="sandbox-item">
                  <div class="sandbox-item-info">
                    <span>💼</span>
                    <span>Salário</span>
                  </div>
                  <span class="sandbox-item-amount" style="color: var(--income)">+ R$ 5.000,00</span>
                </div>
                <div class="sandbox-item">
                  <div class="sandbox-item-info">
                    <span>🛒</span>
                    <span>Supermercado</span>
                  </div>
                  <span class="sandbox-item-amount" style="color: var(--expense)">- R$ 850,00</span>
                </div>
                <div class="sandbox-item">
                  <div class="sandbox-item-info">
                    <span>💻</span>
                    <span>Freelance</span>
                  </div>
                  <span class="sandbox-item-amount" style="color: var(--income)">+ R$ 500,00</span>
                </div>
                <div class="sandbox-item">
                  <div class="sandbox-item-info">
                    <span>🚗</span>
                    <span>Combustível</span>
                  </div>
                  <span class="sandbox-item-amount" style="color: var(--expense)">- R$ 200,00</span>
                </div>
              </div>
            </div>
            
            <div style="margin-top: 0.8rem">
              <div class="sandbox-chart-title">Balanço (Ganhos vs Gastos)</div>
              <div class="sandbox-chart-wrap">
                <svg id="sandbox-svg" viewBox="0 0 160 80" width="100%" height="80" xmlns="http://www.w3.org/2000/svg" style="display: block">
                  <g id="sandbox-chart-bars"></g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="home-features" id="home-features">
      <div class="home-section-label reveal">Funcionalidades</div>
      <h2 class="home-section-title reveal">Tudo que você precisa para organizar as finanças</h2>
      <div class="home-features-grid">

        <div class="home-feature-card reveal" style="transition-delay: 0.05s">
          <div class="home-feature-icon" style="background:hsl(162,64%,45%,0.15);color:hsl(162,64%,45%)">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <h3>Ganhos &amp; Gastos</h3>
          <p>Registre receitas e despesas com categorias, datas e formas de pagamento. Veja tudo num só dashboard.</p>
        </div>

        <div class="home-feature-card reveal" style="transition-delay: 0.1s">
          <div class="home-feature-icon" style="background:hsl(200,87%,50%,0.15);color:hsl(200,87%,50%)">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <h3>Cartões de Crédito</h3>
          <p>Gerencie faturas, limites e parcelamentos. Saiba exatamente quanto já usou em cada cartão.</p>
        </div>

        <div class="home-feature-card reveal" style="transition-delay: 0.15s">
          <div class="home-feature-icon" style="background:hsl(38,92%,50%,0.15);color:hsl(38,92%,50%)">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <h3>Metas Financeiras</h3>
          <p>Defina metas de poupança, lazer e investimentos. Acompanhe o progresso e receba sugestões automáticas.</p>
        </div>

        <div class="home-feature-card reveal" style="transition-delay: 0.2s">
          <div class="home-feature-icon" style="background:hsl(280,65%,60%,0.15);color:hsl(280,65%,60%)">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          <h3>Investimentos</h3>
          <p>Registre CDBs, Tesouro Direto, ações e mais. Visualize o crescimento do seu patrimônio ao longo do tempo.</p>
        </div>

        <div class="home-feature-card reveal" style="transition-delay: 0.25s">
          <div class="home-feature-icon" style="background:hsl(0,78%,58%,0.15);color:hsl(0,78%,58%)">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
          </div>
          <h3>Relatórios em PDF</h3>
          <p>Gere relatórios completos dos últimos 6 meses e exporte em PDF para guardar ou compartilhar.</p>
        </div>

        <div class="home-feature-card reveal" style="transition-delay: 0.3s">
          <div class="home-feature-icon" style="background:hsl(162,64%,45%,0.15);color:hsl(162,64%,45%)">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h3>Múltiplos Perfis</h3>
          <p>Cada membro da família tem seu próprio perfil com dados separados. Perfeito para organizar as finanças do lar.</p>
        </div>

      </div>
    </section>

    <!-- How it works -->
    <section class="home-steps">
      <div class="home-section-label reveal">Como funciona</div>
      <h2 class="home-section-title reveal">Comece em 3 passos simples</h2>
      <div class="home-steps-grid">
        <div class="home-step reveal" style="transition-delay: 0.05s">
          <div class="home-step-number">01</div>
          <h3>Crie sua conta</h3>
          <p>Cadastre-se com email e senha. Seus dados ficam salvos apenas no seu navegador — sem servidores externos.</p>
        </div>
        <div class="home-step-arrow reveal" style="transition-delay: 0.15s">→</div>
        <div class="home-step reveal" style="transition-delay: 0.25s">
          <div class="home-step-number">02</div>
          <h3>Crie um perfil</h3>
          <p>Adicione os membros da família com nome, emoji e cor. Cada um tem suas finanças separadas.</p>
        </div>
        <div class="home-step-arrow reveal" style="transition-delay: 0.35s">→</div>
        <div class="home-step reveal" style="transition-delay: 0.45s">
          <div class="home-step-number">03</div>
          <h3>Registre e acompanhe</h3>
          <p>Lance seus ganhos e gastos. Veja gráficos, metas e relatórios atualizados em tempo real.</p>
        </div>
      </div>
    </section>

    <!-- Privacy banner -->
    <section class="home-privacy reveal">
      <div class="home-privacy-inner">
        <div class="home-privacy-icon privacy-sonar-container">
          <div class="sonar-ring"></div>
          <div class="sonar-ring"></div>
          <div class="sonar-ring"></div>
          <img src="assets/shield-privacy.png" alt="Escudo de Privacidade" style="width: 96px; height: 96px; object-fit: contain; display: block; position: relative; z-index: 2;">
        </div>
        <div class="home-privacy-text">
          <h3>100% privado &amp; offline</h3>
          <p>Todos os seus dados ficam salvos localmente no seu navegador. Nenhuma informação é enviada para servidores. Funciona mesmo sem internet.</p>
        </div>
        <button class="btn home-cta-primary" onclick="Router.go('auth')" style="flex-shrink:0">
          Começar agora
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="home-footer" style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem; padding: 3rem 2rem; border-top: 1px solid var(--border); background: var(--card);">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 900px; flex-wrap: wrap; gap: 1.5rem;">
        <div class="home-footer-brand" onclick="Router.go('home')" style="cursor: pointer; transition: transform 0.2s ease;">
          <img src="assets/logo.png" alt="Planeja Lar" onerror="this.style.display='none'" style="width:28px;height:28px;border-radius:8px">
          <span style="font-size: 1rem; font-weight: 700;">Planeja Lar</span>
        </div>
        <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
          <a href="#" onclick="event.preventDefault(); Toast.success('Funcionalidade offline: Política de Privacidade')" style="font-size: 0.85rem; color: var(--muted-foreground); transition: color 0.15s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--muted-foreground)'">Privacidade</a>
          <a href="#" onclick="event.preventDefault(); Toast.success('Funcionalidade offline: Termos de Uso')" style="font-size: 0.85rem; color: var(--muted-foreground); transition: color 0.15s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--muted-foreground)'">Termos de Uso</a>
          <a href="#" onclick="event.preventDefault(); Router.go('auth')" style="font-size: 0.85rem; color: var(--muted-foreground); transition: color 0.15s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--muted-foreground)'">Entrar</a>
        </div>
      </div>
      <div style="width: 100%; max-width: 900px; height: 1px; background: var(--border);"></div>
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 900px; flex-wrap: wrap; gap: 1rem; font-size: 0.8rem; color: var(--muted-foreground);">
        <p>&copy; 2026 Planeja Lar. Todos os direitos reservados.</p>
        <p style="display: flex; align-items: center; gap: 0.25rem;">Feito com <span style="color: var(--destructive);">❤</span> para organizar o seu lar.</p>
      </div>
    </footer>
  </div>`;

  // ── 1. Rotator de Título do Hero (Vertical Roll-Up Ticker) ─────────────────
  const rotator = container.querySelector("#hero-rotator");
  if (rotator) {
    const words = ["para toda a família", "para planejar o futuro", "sem complicação", "100% privado e offline"];
    let wordIdx = 0;
    const rotateInterval = setInterval(() => {
      if (!rotator.isConnected) {
        clearInterval(rotateInterval);
        return;
      }
      rotator.classList.add("animating");

      setTimeout(() => {
        wordIdx = (wordIdx + 1) % words.length;
        rotator.textContent = words[wordIdx];
      }, 220);

      setTimeout(() => {
        rotator.classList.remove("animating");
      }, 650);
    }, 3000);
  }

  // ── 2. Background Parallax Blobs (Mouse cursor interaction) ────────────────
  const homePage = container.querySelector(".home-page");
  const blob1 = container.querySelector(".home-blob-1");
  const blob2 = container.querySelector(".home-blob-2");
  const blob3 = container.querySelector(".home-blob-3");
  if (homePage && (blob1 || blob2 || blob3)) {
    let mouseX = 0, mouseY = 0;
    let targetX1 = 0, targetY1 = 0;
    let targetX2 = 0, targetY2 = 0;
    let targetX3 = 0, targetY3 = 0;
    
    let currentX1 = 0, currentY1 = 0;
    let currentX2 = 0, currentY2 = 0;
    let currentX3 = 0, currentY3 = 0;

    const onMouseMove = (e) => {
      const rect = homePage.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      targetX1 = -x * 0.06;
      targetY1 = -y * 0.06;

      targetX2 = x * 0.04;
      targetY2 = y * 0.04;

      targetX3 = -x * 0.02;
      targetY3 = y * 0.02;
    };

    homePage.addEventListener("mousemove", onMouseMove);

    let animationFrameId;
    const updateBlobs = () => {
      if (!homePage.isConnected) return;

      currentX1 += (targetX1 - currentX1) * 0.08;
      currentY1 += (targetY1 - currentY1) * 0.08;

      currentX2 += (targetX2 - currentX2) * 0.08;
      currentY2 += (targetY2 - currentY2) * 0.08;

      currentX3 += (targetX3 - currentX3) * 0.08;
      currentY3 += (targetY3 - currentY3) * 0.08;

      if (blob1) blob1.style.transform = `translate(${currentX1}px, ${currentY1}px)`;
      if (blob2) blob2.style.transform = `translate(${currentX2}px, ${currentY2}px)`;
      if (blob3) blob3.style.transform = `translate(${currentX3}px, ${currentY3}px)`;

      animationFrameId = requestAnimationFrame(updateBlobs);
    };
    updateBlobs();
  }

  // ── 3. 3D Tilt & Glow features cards ─────────────────────────────────────
  const featureCards = container.querySelectorAll(".home-feature-card");
  featureCards.forEach(card => {
    const glow = document.createElement("div");
    glow.className = "card-glow";
    card.appendChild(glow);

    let rect = null;

    card.addEventListener("mouseenter", () => {
      rect = card.getBoundingClientRect();
      card.style.transition = "border-color .2s, box-shadow .2s, transform 0.05s linear";
    });

    card.addEventListener("mousemove", (e) => {
      if (!rect) rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = -(y - centerY) / 10;
      const rotateY = (x - centerX) / 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });

    card.addEventListener("mouseleave", () => {
      rect = null;
      card.style.transition = "border-color .2s, box-shadow .2s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    });
  });

  // ── 3.5. 3D Tilt & Glow Privacy Banner ───────────────────────────────────
  const privacyInner = container.querySelector(".home-privacy-inner");
  if (privacyInner) {
    const glow = document.createElement("div");
    glow.className = "card-glow";
    privacyInner.appendChild(glow);

    let rect = null;

    privacyInner.addEventListener("mouseenter", () => {
      rect = privacyInner.getBoundingClientRect();
      privacyInner.style.transition = "border-color .2s, box-shadow .2s, transform 0.05s linear";
    });

    privacyInner.addEventListener("mousemove", (e) => {
      if (!rect) rect = privacyInner.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      privacyInner.style.setProperty("--mouse-x", `${x}px`);
      privacyInner.style.setProperty("--mouse-y", `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = -(y - centerY) / 25;
      const rotateY = (x - centerX) / 30;

      privacyInner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.015)`;
    });

    privacyInner.addEventListener("mouseleave", () => {
      rect = null;
      privacyInner.style.transition = "border-color .2s, box-shadow .2s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
      privacyInner.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    });
  }

  // ── 4. Scroll Reveal Animations (IntersectionObserver) ───────────────────────
  const reveals = container.querySelectorAll(".reveal");
  if (reveals.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach(el => observer.observe(el));
  }

  // ── 5. Simulador Interativo de Economias (Interactive Dashboard Preview) ──────
  const incSlider = container.querySelector("#sim-income");
  const expSlider = container.querySelector("#sim-expense");
  const incValText = container.querySelector("#sim-income-val");
  const expValText = container.querySelector("#sim-expense-val");
  const balText = container.querySelector("#sim-balance-val");
  const annText = container.querySelector("#sim-annual-val");
  const percentText = container.querySelector("#sim-percent-text");
  const progressFill = container.querySelector("#sim-progress-fill");

  const pathInc = container.querySelector("#sim-path-income");
  const pathIncFill = container.querySelector("#sim-path-income-fill");
  const pathExp = container.querySelector("#sim-path-expense");
  const pathExpFill = container.querySelector("#sim-path-expense-fill");
  const dotInc = container.querySelector("#sim-dot-income");
  const dotExp = container.querySelector("#sim-dot-expense");

  function updateSimulator() {
    if (!incSlider || !expSlider) return;

    let incVal = parseFloat(incSlider.value);
    let expVal = parseFloat(expSlider.value);

    if (expVal > incVal + 2000) {
      expSlider.value = incVal + 2000;
      expVal = incVal + 2000;
    }

    if (incValText) incValText.textContent = formatBRL(incVal);
    if (expValText) expValText.textContent = formatBRL(expVal);

    const balance = incVal - expVal;
    if (balText) {
      balText.textContent = formatBRL(balance);
      if (balance >= 0) {
        balText.style.color = "var(--income)";
      } else {
        balText.style.color = "var(--expense)";
      }
    }

    if (annText) annText.textContent = formatBRL(balance * 12);

    const percent = incVal > 0 ? Math.max(-100, Math.min(100, (balance / incVal) * 100)) : 0;
    if (percentText) {
      if (percent > 0) {
        percentText.textContent = `${Math.round(percent)}% poupado por mês`;
      } else if (percent < 0) {
        percentText.textContent = `Déficit de ${Math.round(Math.abs(percent))}% ao mês`;
      } else {
        percentText.textContent = `0% poupado. No limite!`;
      }
    }

    if (progressFill) {
      const displayPercent = Math.max(0, percent);
      progressFill.style.width = `${displayPercent}%`;
      if (percent < 10) {
        progressFill.style.background = "var(--expense)";
      } else if (percent < 25) {
        progressFill.style.background = "var(--warning)";
      } else {
        progressFill.style.background = "var(--income)";
      }
    }

    const maxVal = Math.max(incVal, expVal, 1000);

    const generateWavePath = (val, seed) => {
      const pts = [];
      const steps = 6;
      for (let i = 0; i <= steps; i++) {
        const x = (i * 400) / steps;
        const wave = Math.sin((i + seed) * 1.1) * 8;
        const baseHeight = 70 - (val / maxVal) * 45;
        const y = Math.max(12, Math.min(76, baseHeight + wave));
        pts.push(`${x},${y}`);
      }
      return "M" + pts.join(" L");
    };

    const ptsInc = generateWavePath(incVal, 0.5);
    const ptsExp = generateWavePath(expVal, 2.5);

    if (pathInc) pathInc.setAttribute("d", ptsInc);
    if (pathIncFill) pathIncFill.setAttribute("d", `${ptsInc} L400,80 L0,80 Z`);
    if (pathExp) pathExp.setAttribute("d", ptsExp);
    if (pathExpFill) pathExpFill.setAttribute("d", `${ptsExp} L400,80 L0,80 Z`);

    // Place bouncing dots on paths
    const getDotY = (val, seed) => {
      const wave = Math.sin((3 + seed) * 1.1) * 8;
      const baseHeight = 70 - (val / maxVal) * 45;
      return Math.max(12, Math.min(76, baseHeight + wave));
    };

    if (dotInc) {
      dotInc.setAttribute("cx", 200);
      dotInc.setAttribute("cy", getDotY(incVal, 0.5));
    }
    if (dotExp) {
      dotExp.setAttribute("cx", 200);
      dotExp.setAttribute("cy", getDotY(expVal, 2.5));
    }
  }

  // Smooth Slider Animating Helper
  function animateSliderTo(slider, targetVal, duration = 350) {
    const startVal = parseFloat(slider.value);
    const startTime = performance.now();

    function step(now) {
      if (!slider.isConnected) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress); // Ease out quad
      slider.value = startVal + (targetVal - startVal) * ease;
      updateSimulator();
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  if (incSlider && expSlider) {
    incSlider.addEventListener("input", updateSimulator);
    expSlider.addEventListener("input", updateSimulator);
    updateSimulator();
  }

  // Simulator preset button listeners
  const presetButtons = container.querySelectorAll(".sim-preset-btn");
  presetButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      presetButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const targetInc = parseFloat(btn.getAttribute("data-inc"));
      const targetExp = parseFloat(btn.getAttribute("data-exp"));

      animateSliderTo(incSlider, targetInc, 450);
      animateSliderTo(expSlider, targetExp, 450);
    });
  });

  // ── 6. Interactive Mock Dashboard Sandbox logic ──────────────────────────
  let currentInc = 5500;
  let currentExp = 2450;

  const sandIncText = container.querySelector("#sand-inc");
  const sandExpText = container.querySelector("#sand-exp");
  const sandBalText = container.querySelector("#sand-bal");
  const sandList = container.querySelector("#sand-list");
  const btnAddInc = container.querySelector("#sand-add-inc");
  const btnAddExp = container.querySelector("#sand-add-exp");

  const mockIncomes = [
    { text: "Venda OLX 💰", amount: 150 },
    { text: "Presente 🎁", amount: 100 },
    { text: "Rendimento CDB 📈", amount: 85 },
    { text: "Cashback Cartão 💳", amount: 35 },
    { text: "Aula Particular 📚", amount: 200 }
  ];

  const mockExpenses = [
    { text: "Pizza Familiar 🍕", amount: 90 },
    { text: "Cinema & Pipoca 🍿", amount: 55 },
    { text: "Padaria da Esquina 🥐", amount: 25 },
    { text: "Uber Viagem 🚗", amount: 30 },
    { text: "Cafeteria Gourmet ☕", amount: 18 }
  ];

  function animateTextValue(element, start, end, prefix = "R$ ") {
    const duration = 500;
    const startTime = performance.now();

    function step(now) {
      if (!element.isConnected) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const current = start + (end - start) * ease;

      element.textContent = prefix + formatBRL(current).replace("R$", "").trim();
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  const drawSandboxChart = (incomes, expenses) => {
    const svgBars = container.querySelector("#sandbox-chart-bars");
    if (!svgBars) return;
    svgBars.innerHTML = "";

    const maxVal = Math.max(incomes, expenses, 1000);
    const hInc = (incomes / maxVal) * 55;
    const hExp = (expenses / maxVal) * 55;

    // SVG elements must be created with the correct namespace
    const svgNS = "http://www.w3.org/2000/svg";

    // Income Bar
    const barInc = document.createElementNS(svgNS, "rect");
    barInc.setAttribute("x", "30");
    barInc.setAttribute("y", (70 - hInc).toFixed(1));
    barInc.setAttribute("width", "25");
    barInc.setAttribute("height", hInc.toFixed(1));
    barInc.setAttribute("rx", "4");
    barInc.setAttribute("fill", "var(--income)");
    barInc.style.transition = "y 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";

    // Expense Bar
    const barExp = document.createElementNS(svgNS, "rect");
    barExp.setAttribute("x", "85");
    barExp.setAttribute("y", (70 - hExp).toFixed(1));
    barExp.setAttribute("width", "25");
    barExp.setAttribute("height", hExp.toFixed(1));
    barExp.setAttribute("rx", "4");
    barExp.setAttribute("fill", "var(--expense)");
    barExp.style.transition = "y 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";

    // Labels
    const labelInc = document.createElementNS(svgNS, "text");
    labelInc.setAttribute("x", "42.5");
    labelInc.setAttribute("y", "78");
    labelInc.setAttribute("text-anchor", "middle");
    labelInc.setAttribute("font-size", "7px");
    labelInc.setAttribute("font-weight", "600");
    labelInc.setAttribute("fill", "var(--muted-foreground)");
    labelInc.textContent = "Ganhos";

    const labelExp = document.createElementNS(svgNS, "text");
    labelExp.setAttribute("x", "97.5");
    labelExp.setAttribute("y", "78");
    labelExp.setAttribute("text-anchor", "middle");
    labelExp.setAttribute("font-size", "7px");
    labelExp.setAttribute("font-weight", "600");
    labelExp.setAttribute("fill", "var(--muted-foreground)");
    labelExp.textContent = "Gastos";

    svgBars.appendChild(barInc);
    svgBars.appendChild(barExp);
    svgBars.appendChild(labelInc);
    svgBars.appendChild(labelExp);
  };

  const drawSandbox = () => {
    drawSandboxChart(currentInc, currentExp);
  };

  if (btnAddInc && btnAddExp && sandList) {
    drawSandbox();

    btnAddInc.addEventListener("click", () => {
      const item = mockIncomes[Math.floor(Math.random() * mockIncomes.length)];
      const oldInc = currentInc;
      currentInc += item.amount;

      const div = document.createElement("div");
      div.className = "sandbox-item";
      div.innerHTML = `
        <div class="sandbox-item-info">
          <span>${item.text.split(" ").pop()}</span>
          <span>${item.text.replace(/\s\S+$/, "")}</span>
        </div>
        <span class="sandbox-item-amount" style="color: var(--income)">+ R$ ${item.amount.toFixed(2).replace(".", ",")}</span>
      `;

      sandList.insertBefore(div, sandList.firstChild);
      if (sandList.children.length > 5) {
        sandList.removeChild(sandList.lastChild);
      }

      animateTextValue(sandIncText, oldInc, currentInc);
      animateTextValue(sandBalText, oldInc - currentExp, currentInc - currentExp);
      drawSandbox();

      btnAddInc.style.transform = "scale(0.92)";
      setTimeout(() => btnAddInc.style.transform = "", 150);
    });

    btnAddExp.addEventListener("click", () => {
      const item = mockExpenses[Math.floor(Math.random() * mockExpenses.length)];
      const oldExp = currentExp;
      currentExp += item.amount;

      const div = document.createElement("div");
      div.className = "sandbox-item";
      div.innerHTML = `
        <div class="sandbox-item-info">
          <span>${item.text.split(" ").pop()}</span>
          <span>${item.text.replace(/\s\S+$/, "")}</span>
        </div>
        <span class="sandbox-item-amount" style="color: var(--expense)">- R$ ${item.amount.toFixed(2).replace(".", ",")}</span>
      `;

      sandList.insertBefore(div, sandList.firstChild);
      if (sandList.children.length > 5) {
        sandList.removeChild(sandList.lastChild);
      }

      animateTextValue(sandExpText, oldExp, currentExp);
      animateTextValue(sandBalText, currentInc - oldExp, currentInc - currentExp);
      drawSandbox();

      btnAddExp.style.transform = "scale(0.92)";
      setTimeout(() => btnAddExp.style.transform = "", 150);
    });
  }
});
