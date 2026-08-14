// ── Página de Autenticação ─────────────────────────────────────────────────────────────────
Router.register("auth", (container) => {
  container.innerHTML = `
  <div class="auth-fullpage">
    <div class="auth-card-wrapper">
      <div class="auth-card" style="position: relative;">
        <!-- Loading Overlay for Social Login -->
        <div class="auth-loading-overlay" id="auth-social-loader" style="display: none;">
          <div class="auth-loader-content">
            <div class="spinner"></div>
            <p id="auth-loader-text">Conectando...</p>
          </div>
        </div>

        <div class="auth-logo" onclick="Router.go('home')" style="cursor: pointer">
          <img src="assets/logo.png" alt="Planeja Lar" onerror="this.style.display='none'">
          <h1>Planeja Lar</h1>
          <p>Finanças da família</p>
        </div>
        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="signin">Entrar</button>
          <button class="auth-tab" data-tab="signup">Criar Conta</button>
        </div>

        <form id="auth-form-signin" onsubmit="event.preventDefault(); doLogin();">
          <div class="form-group">
            <label class="form-label auth-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>
              Email
            </label>
            <input id="auth-email" class="form-input" type="email" placeholder="seu@email.com" autocomplete="email" required>
          </div>
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <label class="form-label auth-label" style="margin-bottom: 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Senha
              </label>
              <a href="#" class="auth-forgot-link" onclick="event.preventDefault(); openForgotPasswordModal();" style="font-size: 0.75rem; color: var(--primary); text-decoration: none; transition: opacity 0.15s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Esqueci minha senha</a>
            </div>
            <input id="auth-pass" class="form-input" type="password" placeholder="••••••••" autocomplete="current-password" required>
          </div>
          <button type="submit" class="btn btn-primary auth-submit">Entrar</button>
        </form>

        <form id="auth-form-signup" style="display:none" onsubmit="event.preventDefault(); doSignup();">
          <div class="form-group">
            <label class="form-label auth-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>
              Email
            </label>
            <input id="auth-email2" class="form-input" type="email" placeholder="seu@email.com" required>
          </div>
          <div class="form-group">
            <label class="form-label auth-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Senha
            </label>
            <input id="auth-pass2" class="form-input" type="password" placeholder="Mínimo 6 caracteres" required minlength="6">
          </div>
          <div class="form-group">
            <label class="form-label auth-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Confirmar Senha
            </label>
            <input id="auth-pass2-confirm" class="form-input" type="password" placeholder="Repita a senha" required minlength="6">
          </div>
          <button type="submit" class="btn btn-primary auth-submit">Criar Conta</button>
        </form>

        <form id="auth-form-forgot" style="display:none" data-step="email" onsubmit="event.preventDefault(); handleForgotPasswordSubmit();">
          <div class="form-group" id="forgot-step-email-group" style="margin-bottom: 1rem;">
            <label class="form-label auth-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>
              Email Cadastrado
            </label>
            <input id="auth-forgot-email" class="form-input" type="email" placeholder="seu@email.com" required>
          </div>

          <div class="form-group" id="forgot-step-code" style="display:none; margin-bottom: 1rem;">
            <label class="form-label auth-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Código de Verificação (4 dígitos)
            </label>
            <input id="auth-forgot-code" class="form-input" type="text" placeholder="Digite o código enviado" maxlength="4">
            <small style="color: var(--muted-foreground); font-size: 0.72rem; margin-top: 0.3rem; display: block;">Código demonstrativo: <strong style="color: var(--primary);">1234</strong></small>
          </div>

          <div id="forgot-step-pass" style="display:none;">
            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label auth-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Nova Senha
              </label>
              <input id="auth-forgot-newpass" class="form-input" type="password" placeholder="Mínimo 6 caracteres" minlength="6">
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label auth-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Confirmar Nova Senha
              </label>
              <input id="auth-forgot-confirm-pass" class="form-input" type="password" placeholder="Repita a nova senha" minlength="6">
            </div>
          </div>

          <button type="submit" id="auth-forgot-submit" class="btn btn-primary auth-submit">Verificar Email</button>
          <button type="button" class="btn btn-ghost" onclick="showSigninForm()" style="width:100%; margin-top:0.6rem; justify-content:center; font-size:0.85rem;">
            Voltar para o Login
          </button>
        </form>

        <div class="auth-social-separator">
          <span>ou continuar com</span>
        </div>
        <div class="auth-social-grid">
          <button class="btn btn-outline btn-social" onclick="doSocialLogin('Google')">
            <svg viewBox="0 0 24 24" width="14" height="14" style="margin-right: 0.15rem;">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Google
          </button>
          <button class="btn btn-outline btn-social" onclick="doSocialLogin('GitHub')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="margin-right: 0.15rem;">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            GitHub
          </button>
          <button class="btn btn-outline btn-social" onclick="doSocialLogin('Apple')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="margin-right: 0.15rem;">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.57 2.94-1.39z"/>
            </svg>
            Apple
          </button>
        </div>
      </div>

      <div class="auth-saiba-mais" onclick="document.querySelector('.auth-info-section').scrollIntoView({behavior:'smooth'})">
        Saiba mais
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </div>

    <div class="auth-info-section">
      <h2 class="info-title">Por que usar o Planeja Lar?</h2>
      <p class="info-subtitle">Gerencie as finanças da sua casa com simplicidade, segurança e controle total.</p>
      
      <div class="info-grid">
        <div class="info-card">
          <div class="info-icon" style="color: var(--income);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <h3>Controle de Fluxo</h3>
          <p>Registre ganhos e gastos diários. Divida-os por categorias, membros da família e formas de pagamento.</p>
        </div>

        <div class="info-card">
          <div class="info-icon" style="color: var(--credit);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
          </div>
          <h3>Cartões de Crédito</h3>
          <p>Acompanhe limites, faturas abertas e parcelas futuras. Evite surpresas no fechamento da fatura.</p>
        </div>

        <div class="info-card">
          <div class="info-icon" style="color: var(--leisure);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <h3>Metas e Limites</h3>
          <p>Defina tetos de gastos para lazer, alimentação e outros, garantindo que a família economize todo mês.</p>
        </div>

        <div class="info-card">
          <div class="info-icon" style="color: var(--investment);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          </div>
          <h3>Investimentos</h3>
          <p>Monitore aportes e a evolução dos seus investimentos de forma simples, direto no painel consolidado.</p>
        </div>
      </div>

      <div class="info-footer">
        <div class="info-privacy-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Seus dados são 100% privados e salvos localmente
        </div>
        <button class="btn btn-outline info-scroll-up-btn" onclick="document.querySelector('.auth-card-wrapper').scrollIntoView({behavior:'smooth'})">
          Voltar para o Login
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
      </div>
    </div>
  </div>`;

  container.querySelectorAll(".auth-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const t = tab.dataset.tab;
      container.querySelectorAll(".auth-tab").forEach(b => b.classList.toggle("active", b === tab));
      document.getElementById("auth-form-signin").style.display = t === "signin" ? "" : "none";
      document.getElementById("auth-form-signup").style.display  = t === "signup" ? "" : "none";
      document.getElementById("auth-form-forgot").style.display = "none";
      resetForgotPasswordState();
      container.querySelector(".auth-social-separator").style.display = "";
      container.querySelector(".auth-social-grid").style.display = "";
    });
  });

  // Helpers to reset forgot form state
  function resetForgotPasswordState() {
    const emailInput = container.querySelector("#auth-forgot-email");
    const codeGroup = container.querySelector("#forgot-step-code");
    const codeInput = container.querySelector("#auth-forgot-code");
    const passGroup = container.querySelector("#forgot-step-pass");
    const newPassInput = container.querySelector("#auth-forgot-newpass");
    const confirmPassInput = container.querySelector("#auth-forgot-confirm-pass");
    const submitBtn = container.querySelector("#auth-forgot-submit");

    if (emailInput) {
      emailInput.disabled = false;
      emailInput.value = "";
    }
    if (codeGroup) codeGroup.style.display = "none";
    if (codeInput) {
      codeInput.value = "";
      codeInput.required = false;
    }
    if (passGroup) passGroup.style.display = "none";
    if (newPassInput) {
      newPassInput.value = "";
      newPassInput.required = false;
    }
    if (confirmPassInput) {
      confirmPassInput.value = "";
      confirmPassInput.required = false;
    }
    if (submitBtn) submitBtn.textContent = "Verificar Email";
    
    container.querySelector("#auth-form-forgot").dataset.step = "email";
  }

  window.openForgotPasswordModal = function() {
    document.getElementById("auth-form-signin").style.display = "none";
    document.getElementById("auth-form-signup").style.display = "none";
    
    container.querySelector(".auth-tabs").style.display = "none";
    container.querySelector(".auth-social-separator").style.display = "none";
    container.querySelector(".auth-social-grid").style.display = "none";
    
    const forgotForm = document.getElementById("auth-form-forgot");
    forgotForm.style.display = "";
    resetForgotPasswordState();
  };

  window.showSigninForm = function() {
    container.querySelector(".auth-tabs").style.display = "";
    container.querySelector(".auth-social-separator").style.display = "";
    container.querySelector(".auth-social-grid").style.display = "";
    
    container.querySelectorAll(".auth-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === "signin"));
    
    document.getElementById("auth-form-signin").style.display = "";
    document.getElementById("auth-form-signup").style.display = "none";
    document.getElementById("auth-form-forgot").style.display = "none";
    resetForgotPasswordState();
  };

  window.handleForgotPasswordSubmit = function() {
    const forgotForm = container.querySelector("#auth-form-forgot");
    const step = forgotForm.dataset.step;

    const emailInput = container.querySelector("#auth-forgot-email");
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (step === "email") {
      if (!email || !emailRegex.test(email)) {
        Toast.error("Por favor, insira um email válido.");
        return;
      }

      const accounts = Auth.getAccounts();
      const exists = accounts.some(acc => acc.email.toLowerCase() === email.toLowerCase());

      if (!exists) {
        Toast.error("Email não cadastrado.");
        return;
      }

      emailInput.disabled = true;
      container.querySelector("#forgot-step-code").style.display = "";
      const codeInput = container.querySelector("#auth-forgot-code");
      codeInput.required = true;
      codeInput.focus();
      
      container.querySelector("#auth-forgot-submit").textContent = "Verificar Código";
      forgotForm.dataset.step = "code";
      Toast.info("Código de verificação enviado! Use o código demonstrativo 1234.");
    } 
    else if (step === "code") {
      const codeInput = container.querySelector("#auth-forgot-code");
      const code = codeInput.value.trim();

      if (code !== "1234") {
        Toast.error("Código incorreto. Use o código 1234 para o teste offline.");
        return;
      }

      container.querySelector("#forgot-step-code").style.display = "none";
      container.querySelector("#forgot-step-pass").style.display = "";
      
      const newPassInput = container.querySelector("#auth-forgot-newpass");
      const confirmPassInput = container.querySelector("#auth-forgot-confirm-pass");
      newPassInput.required = true;
      confirmPassInput.required = true;
      newPassInput.focus();

      container.querySelector("#auth-forgot-submit").textContent = "Redefinir Senha";
      forgotForm.dataset.step = "password";
      Toast.success("Código verificado! Crie sua nova senha.");
    } 
    else if (step === "password") {
      const newPass = container.querySelector("#auth-forgot-newpass").value;
      const confirmPass = container.querySelector("#auth-forgot-confirm-pass").value;

      if (!newPass || newPass.length < 6) {
        Toast.error("A nova senha deve ter no mínimo 6 caracteres.");
        return;
      }
      if (newPass !== confirmPass) {
        Toast.error("As senhas não coincidem.");
        return;
      }

      const res = Auth.resetPassword(email, newPass);
      if (res.success) {
        Toast.success("Senha redefinida! Faça login com as novas credenciais.");
        showSigninForm();
      } else {
        Toast.error(res.message);
      }
    }
  };

  window.doSocialLogin = function(provider) {
    const loader = container.querySelector("#auth-social-loader");
    const loaderText = container.querySelector("#auth-loader-text");
    
    if (loader && loaderText) {
      loaderText.textContent = `Conectando com o ${provider}...`;
      loader.style.display = "flex";
      
      setTimeout(() => {
        loader.style.display = "none";
        
        const mockEmail = `social.${provider.toLowerCase()}@planejalar.com`;
        const mockPass = "social-login-token-123456";
        
        const accounts = Auth.getAccounts();
        const exists = accounts.some(acc => acc.email.toLowerCase() === mockEmail.toLowerCase());
        
        if (!exists) {
          Auth.register(mockEmail, mockPass);
        }
        
        const res = Auth.authenticate(mockEmail, mockPass);
        if (res.success) {
          Toast.success(`Conectado com o ${provider}!`);
          Router.go("select-profile");
        } else {
          Toast.error(res.message);
        }
      }, 1250);
    }
  };
});

function doLogin() {
  const email = document.getElementById("auth-email")?.value?.trim();
  const pass  = document.getElementById("auth-pass")?.value;
  if (!email) { Toast.error("Informe seu email"); return; }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    Toast.error("Por favor, insira um email válido.");
    return;
  }
  if (!pass) { Toast.error("Informe sua senha"); return; }
  
  const res = Auth.authenticate(email, pass);
  if (res.success) {
    Toast.success("Login realizado!");
    Router.go("select-profile");
  } else {
    Toast.error(res.message);
  }
}

function doSignup() {
  const email = document.getElementById("auth-email2")?.value?.trim();
  const pass  = document.getElementById("auth-pass2")?.value;
  const passConfirm = document.getElementById("auth-pass2-confirm")?.value;
  if (!email) { Toast.error("Informe seu email"); return; }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    Toast.error("Por favor, insira um email válido.");
    return;
  }
  if (!pass || pass.length < 6) {
    Toast.error("A senha deve ter no mínimo 6 caracteres.");
    return;
  }
  if (pass !== passConfirm) {
    Toast.error("As senhas não coincidem.");
    return;
  }
  
  const res = Auth.register(email, pass);
  if (res.success) {
    Auth.authenticate(email, pass);
    Toast.success("Conta criada com sucesso!");
    Router.go("select-profile");
  } else {
    showAlert(res.message, "Conta Existente");
  }
}

// ── Página de Seleção de Perfil ───────────────────────────────────────────────────────
Router.register("select-profile", (container) => {
  const members = Members.all();
  const active  = Members.getActive();

  const cards = members.map(m => `
    <div class="sp-card ${active?.id === m.id ? "sp-selected" : ""}"
         data-id="${m.id}"
         onclick="handleProfileClick('${m.id}')"
         style="--card-clr:${escHtml(m.color || "#0d9488")}">
      <div class="sp-avatar" style="overflow:hidden; display:flex; align-items:center; justify-content:center; padding:0;">
        ${m.photo ? `<img src="${m.photo}" style="width:100%;height:100%;object-fit:cover;">` : escHtml(m.emoji || m.name[0])}
      </div>
      <div class="sp-name">${escHtml(m.name)}</div>
    </div>`).join("");

  container.innerHTML = `
  <div class="sp-fullpage">
    <img src="assets/logo.png" class="sp-logo" alt="" onerror="this.style.display='none'" onclick="Router.go('home')" style="cursor: pointer">
    <h1 class="sp-title">Quem está usando?</h1>
    <p  class="sp-sub">Escolha um perfil para continuar</p>

    <div class="sp-grid">${cards}
      <div class="sp-card sp-add" onclick="openModal('modal-add-member')">
        <div class="sp-avatar sp-avatar-add">+</div>
        <div class="sp-name">Adicionar</div>
      </div>
    </div>

    <div class="sp-actions">
      <button class="btn btn-outline sp-btn-manage" onclick="openModal('modal-add-member')">Gerenciar perfis</button>
      <button class="btn btn-ghost  sp-btn-sair"   onclick="handleProfileLogout()">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sair
      </button>
    </div>
  </div>

  <!-- Modal Add Member -->
  <div class="modal-backdrop" id="modal-add-member">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">Novo Integrante</span>
        <button class="modal-close" onclick="closeModal('modal-add-member')">×</button>
      </div>
      <div class="form-group">
        <label class="form-label">Nome *</label>
        <input id="new-member-name" class="form-input" placeholder="Ex: João, Maria...">
      </div>
      <div class="form-group">
        <label class="form-label">Emoji</label>
        <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.5rem">
          ${["😀","👨","👩","👧","👦","🧑","👴","👵","🐶","🦊","🦁","🐼","🐻","🦊","🐯"].map(e =>
            `<button class="btn btn-sm btn-outline" onclick="pickEmoji('${e}')" style="font-size:1.1rem;padding:.3rem .45rem">${e}</button>`
          ).join("")}
        </div>
        <input id="new-member-emoji" class="form-input" placeholder="Ou digite um emoji" value="😀" style="width:80px">
      </div>
      <div class="form-group">
        <label class="form-label">Cor</label>
        <div style="display:flex;gap:.4rem;flex-wrap:wrap" id="color-picks">
          ${["#0d9488","#0ea5e9","#8b5cf6","#ec4899","#f97316","#10b981","#ef4444","#6366f1"].map(c =>
            `<button onclick="pickColor('${c}')" style="width:28px;height:28px;border-radius:50%;background:${c};border:2px solid transparent;cursor:pointer" class="color-pick" data-color="${c}"></button>`
          ).join("")}
        </div>
        <input id="new-member-color" type="hidden" value="#0d9488">
      </div>
      <div class="form-group">
        <label class="form-label">Foto de Perfil (Opcional)</label>
        <div style="display:flex;align-items:center;gap:1rem;margin-top:.25rem">
          <div id="new-member-photo-preview" style="width:50px;height:50px;border-radius:50%;background:var(--muted);display:flex;align-items:center;justify-content:center;font-size:1.2rem;overflow:hidden;border:2px solid var(--border)">
            📷
          </div>
          <div style="flex:1">
            <label class="btn btn-sm btn-outline" style="cursor:pointer;display:inline-block;padding:.35rem .75rem;font-size:.8rem;border-radius:var(--radius)">
              Escolher imagem
              <input type="file" id="new-member-photo" accept="image/*" style="display:none" onchange="handlePhotoUpload(this)">
            </label>
            <button class="btn btn-sm btn-ghost" id="new-member-photo-clear" style="display:none;color:var(--destructive);font-size:.8rem;padding:.35rem .75rem" onclick="clearPhotoUpload()">Remover</button>
          </div>
        </div>
        <input type="hidden" id="new-member-photo-base64" value="">
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="addMemberAndRefresh()">Adicionar</button>
        <button class="btn btn-outline" onclick="closeModal('modal-add-member');clearPhotoUpload()">Cancelar</button>
      </div>
    </div>
  </div>`;

  setTimeout(() => {
    const first = document.querySelector(".color-pick");
    if (first) first.style.borderColor = "#fff";
  }, 50);
});

// ── Lógica de clique no perfil ───────────────────────────────────────────────────────
// 1º clique → seleciona (destaca) o card
// 2º clique no card já selecionado → entra no app
function handleProfileClick(id) {
  const active = Members.getActive();
  if (active?.id === id) {
    // Já selecionado — entra no app
    Router.go("dashboard");
  } else {
    // Seleciona e re-renderiza
    Members.setActive(id);
    Router.go("select-profile");
  }
}

async function handleProfileLogout() {
  if (await confirmDelete("Deseja realmente sair da sua conta?", "Confirmar Saída", false)) {
    Auth.logout();
    Router.go("auth");
  }
}

function pickEmoji(e) { const el = document.getElementById("new-member-emoji"); if (el) el.value = e; }
function pickColor(c) {
  document.getElementById("new-member-color").value = c;
  document.querySelectorAll(".color-pick").forEach(b => {
    b.style.borderColor = b.dataset.color === c ? "#fff" : "transparent";
  });
}
function addMemberAndRefresh() {
  const name  = document.getElementById("new-member-name")?.value?.trim();
  const emoji = document.getElementById("new-member-emoji")?.value?.trim() || "😀";
  const color = document.getElementById("new-member-color")?.value || "#0d9488";
  const photo = document.getElementById("new-member-photo-base64")?.value || "";
  if (!name) { Toast.error("Informe o nome"); return; }
  
  const isFirstMember = Members.all().length === 0;
  
  const m = Members.add({ name, emoji, color, photo });
  Members.setActive(m.id);
  closeModal("modal-add-member");
  clearPhotoUpload();
  
  if (isFirstMember) {
    showOnboardingModal();
  } else {
    Toast.success("Perfil criado! Clique novamente para entrar.");
    Router.go("select-profile");
  }
}

function handlePhotoUpload(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const size = 120;
      canvas.width = size;
      canvas.height = size;

      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);

      const base64 = canvas.toDataURL("image/jpeg", 0.85);
      
      const hiddenInput = document.getElementById("new-member-photo-base64");
      const preview = document.getElementById("new-member-photo-preview");
      const clearBtn = document.getElementById("new-member-photo-clear");
      
      if (hiddenInput) hiddenInput.value = base64;
      if (preview) preview.innerHTML = `<img src="${base64}" style="width:100%;height:100%;object-fit:cover;">`;
      if (clearBtn) clearBtn.style.display = "inline-block";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function clearPhotoUpload() {
  const fileInput = document.getElementById("new-member-photo");
  const hiddenInput = document.getElementById("new-member-photo-base64");
  const preview = document.getElementById("new-member-photo-preview");
  const clearBtn = document.getElementById("new-member-photo-clear");
  
  if (fileInput) fileInput.value = "";
  if (hiddenInput) hiddenInput.value = "";
  if (preview) preview.innerHTML = "📷";
  if (clearBtn) clearBtn.style.display = "none";
}

function showOnboardingModal() {
  let backdrop = document.getElementById("modal-onboarding");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop open confirm-modal-backdrop"; // use to block click-outside or standard closeModal
    backdrop.id = "modal-onboarding";
    backdrop.style.zIndex = "9999";
    document.body.appendChild(backdrop);
  }
  
  let currentStep = 1;
  const steps = [
    {
      title: "1. Cadastre sua renda",
      text: "Comece registrando seus ganhos mensais (salário, extra, etc.) na aba de <strong>Ganhos</strong> para saber exatamente quanto dinheiro entra no orçamento familiar.",
    },
    {
      title: "2. Registre seus gastos",
      text: "Lançar seus gastos (alimentação, lazer, contas fixas e faturas de cartão) na aba de <strong>Gastos</strong> é essencial para descobrir para onde seu dinheiro está indo.",
    },
    {
      title: "3. Defina metas",
      text: "Defina limites e metas mensais de poupança e gastos na aba de <strong>Metas</strong> para garantir que você economize o planejado e evite surpresas.",
    }
  ];
  
  const renderStep = () => {
    backdrop.innerHTML = `
      <div class="modal open" style="max-width:400px; animation: modalEnter .3s ease;">
        <div class="modal-header">
          <span class="modal-title" style="font-weight:700; color:var(--primary);">Boas-vindas ao Planeja Lar!</span>
          <button class="modal-close" onclick="closeOnboarding()">×</button>
        </div>
        <div class="modal-body" style="padding:1rem 0; font-size:0.92rem; line-height:1.5; color:var(--foreground);">
          <h3 style="font-weight:600; font-size:1.05rem; margin-bottom:0.5rem; color:var(--foreground);">${steps[currentStep - 1].title}</h3>
          <p>${steps[currentStep - 1].text}</p>
          <div style="display:flex; justify-content:center; gap:0.4rem; margin-top:1.5rem;">
            <span style="width:8px; height:8px; border-radius:50%; background:${currentStep === 1 ? "var(--primary)" : "var(--border)"};"></span>
            <span style="width:8px; height:8px; border-radius:50%; background:${currentStep === 2 ? "var(--primary)" : "var(--border)"};"></span>
            <span style="width:8px; height:8px; border-radius:50%; background:${currentStep === 3 ? "var(--primary)" : "var(--border)"};"></span>
          </div>
        </div>
        <div class="form-actions" style="margin-top:0.5rem; display:flex; gap:0.5rem;">
          <button class="btn btn-outline" id="onboarding-skip-btn" style="flex:1; justify-content:center;">${currentStep === 3 ? "Concluir" : "Pular"}</button>
          ${currentStep < 3 ? `<button class="btn btn-primary" id="onboarding-next-btn" style="flex:1; justify-content:center;">Próximo</button>` : ""}
        </div>
      </div>
    `;
    
    backdrop.querySelector("#onboarding-skip-btn").onclick = closeOnboarding;
    const nextBtn = backdrop.querySelector("#onboarding-next-btn");
    if (nextBtn) {
      nextBtn.onclick = () => {
        currentStep++;
        renderStep();
      };
    }
  };
  
  const closeOnboarding = () => {
    backdrop.remove();
    Toast.success("Perfil ativado! Entrando no painel...");
    Router.go("dashboard");
  };
  
  window.closeOnboarding = closeOnboarding;
  renderStep();
}
