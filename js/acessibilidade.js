/* ==========================================================================
   acessibilidade.js — usado por TODAS as telas
   - Botão "Contraste": liga/desliga a classe "alto-contraste" no <body>.
   - Botões "A-" e "A+": trocam a classe do <html> (fonte-menor / fonte-maior).
   - A escolha fica salva no localStorage e é aplicada ao abrir qualquer tela.
   Se a tela não tiver os botões (como o cadastro no Figma), o script só
   aplica a escolha salva e não dá erro.
   ========================================================================== */
(function () {
  "use strict";

  var CHAVE = "senai-inclusao:acessibilidade";

  // Níveis de fonte: -1 = menor, 0 = normal, 1 = maior (limites: nunca passa disso)
  var estado = { contraste: false, fonte: 0 };

  /* ----- localStorage sempre dentro de try/catch (pode estar bloqueado) ----- */
  function carregar() {
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE));
      if (salvo) {
        estado.contraste = salvo.contraste === true;
        estado.fonte = Math.max(-1, Math.min(1, Number(salvo.fonte) || 0));
      }
    } catch (e) {
      /* sem localStorage: segue com o padrão, a tela funciona do mesmo jeito */
    }
  }

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (e) {
      /* ignora: só não vai lembrar da escolha no próximo acesso */
    }
  }

  /* ----- aplica o estado na página ----- */
  function aplicar() {
    var html = document.documentElement;
    html.classList.toggle("fonte-menor", estado.fonte === -1);
    html.classList.toggle("fonte-maior", estado.fonte === 1);

    // O <body> pode ainda não existir se o script rodar no <head>
    if (document.body) {
      document.body.classList.toggle("alto-contraste", estado.contraste);
    }

    // Avisa os leitores de tela se o botão está "ligado"
    var botaoContraste = document.querySelector('[data-acessibilidade="contraste"]');
    if (botaoContraste) botaoContraste.setAttribute("aria-pressed", String(estado.contraste));

    // Desativa A- / A+ quando chega no limite
    var menos = document.querySelector('[data-acessibilidade="fonte-menor"]');
    var mais = document.querySelector('[data-acessibilidade="fonte-maior"]');
    if (menos) menos.setAttribute("aria-disabled", String(estado.fonte <= -1));
    if (mais) mais.setAttribute("aria-disabled", String(estado.fonte >= 1));
  }

  function iniciar() {
    carregar();
    aplicar();

    var contraste = document.querySelector('[data-acessibilidade="contraste"]');
    var menos = document.querySelector('[data-acessibilidade="fonte-menor"]');
    var mais = document.querySelector('[data-acessibilidade="fonte-maior"]');

    if (contraste) {
      contraste.addEventListener("click", function () {
        estado.contraste = !estado.contraste;
        salvar();
        aplicar();
      });
    }
    if (menos) {
      menos.addEventListener("click", function () {
        if (estado.fonte > -1) { estado.fonte -= 1; salvar(); aplicar(); }
      });
    }
    if (mais) {
      mais.addEventListener("click", function () {
        if (estado.fonte < 1) { estado.fonte += 1; salvar(); aplicar(); }
      });
    }
  }

  // Roda quando o HTML terminar de carregar (o script fica no fim do <body>)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
