/* ==========================================================================
   login.js — comportamento da tela de login
   1. Olho: mostra/esconde a senha.
   2. "Lembrar meu acesso": guarda SÓ o usuário (nunca a senha).
   3. Validação: usuário e senha obrigatórios.
   4. Sem backend: se estiver tudo preenchido, finge o login indo para o cadastro.
   ========================================================================== */
(function () {
  "use strict";

  var CHAVE_USUARIO = "senai-inclusao:usuario-lembrado";

  var form = document.getElementById("form-login");
  var usuario = document.getElementById("usuario");
  var senha = document.getElementById("senha");
  var lembrar = document.getElementById("lembrar");
  var botaoOlho = document.getElementById("botao-olho");

  /* ----- 1. Olho da senha ----- */
  botaoOlho.addEventListener("click", function () {
    var estavaOculta = senha.type === "password";
    senha.type = estavaOculta ? "text" : "password";
    // Troca o texto lido pelo leitor de tela, para refletir a ação seguinte
    botaoOlho.setAttribute("aria-label", estavaOculta ? "Ocultar senha" : "Mostrar senha");
    botaoOlho.setAttribute("aria-pressed", String(estavaOculta));
  });

  /* ----- 2. Lembrar o usuário (localStorage sempre em try/catch) ----- */
  function lerUsuarioLembrado() {
    try {
      return localStorage.getItem(CHAVE_USUARIO) || "";
    } catch (e) {
      return "";
    }
  }

  function guardarUsuario(valor) {
    try {
      if (valor) localStorage.setItem(CHAVE_USUARIO, valor);
      else localStorage.removeItem(CHAVE_USUARIO);
    } catch (e) {
      /* sem localStorage: o login funciona, só não lembra o usuário */
    }
  }

  // Ao abrir a tela, preenche o usuário salvo (e marca a caixinha)
  var salvo = lerUsuarioLembrado();
  if (salvo) {
    usuario.value = salvo;
    lembrar.checked = true;
  }

  /* ----- 3. Validação ----- */
  // Mostra ou limpa o erro de um campo. A mensagem usa aria-live,
  // então o leitor de tela anuncia sem a pessoa precisar procurar.
  function mostrarErro(input, mensagem) {
    var campo = input.closest(".campo");
    var local = document.getElementById("erro-" + input.id);
    campo.classList.toggle("tem-erro", Boolean(mensagem));
    input.setAttribute("aria-invalid", mensagem ? "true" : "false");
    local.textContent = mensagem;
  }

  function validar() {
    var ok = true;
    var primeiroInvalido = null;

    if (usuario.value.trim() === "") {
      mostrarErro(usuario, "Informe seu e-mail ou CPF.");
      primeiroInvalido = usuario;
      ok = false;
    } else {
      mostrarErro(usuario, "");
    }

    if (senha.value === "") {
      mostrarErro(senha, "Informe sua senha.");
      if (!primeiroInvalido) primeiroInvalido = senha;
      ok = false;
    } else {
      mostrarErro(senha, "");
    }

    // Leva o foco ao primeiro campo com problema
    if (primeiroInvalido) primeiroInvalido.focus();
    return ok;
  }

  // Quando a pessoa volta a digitar, o erro daquele campo some
  [usuario, senha].forEach(function (input) {
    input.addEventListener("input", function () {
      if (input.value.trim() !== "") mostrarErro(input, "");
    });
  });

  /* ----- 4. Envio (simulado) ----- */
  form.addEventListener("submit", function (evento) {
    evento.preventDefault(); // não deixa o navegador recarregar a página

    if (!validar()) return;

    // Só o usuário é guardado; a senha nunca é salva
    guardarUsuario(lembrar.checked ? usuario.value.trim() : "");

    // Sem backend: "login" simulado levando para o cadastro
    window.location.href = "cadastro.html";
  });
})();
