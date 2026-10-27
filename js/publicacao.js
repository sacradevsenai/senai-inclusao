/* ==========================================================================
   publicacao.js — comportamento da tela "Publicação de Notificações"
   1. Pré-visualização ao vivo do texto (cartão "Texto").
   2. Botão "Ouvir prévia" (voz sintetizada do navegador, em português).
   3. "Agendar Recorrência" mostra/esconde dias e hora (sem mudar o layout).
   4. Validação: título, texto e hora (quando agendar).
   5. Publicar (simulado) e Cancelar (limpa e volta aos padrões).
   ========================================================================== */
(function () {
  "use strict";

  var form = document.getElementById("form-publicacao");
  var titulo = document.getElementById("titulo");
  var texto = document.getElementById("texto");
  var turma = document.getElementById("turma");
  var dias = document.getElementById("dias");
  var hora = document.getElementById("hora");
  var agenda = document.getElementById("agenda");
  var previaTexto = document.getElementById("previa-texto");
  var btnOuvir = document.getElementById("btn-ouvir");
  var rotuloOuvir = document.getElementById("btn-ouvir-rotulo");
  var avisoAudio = document.getElementById("aviso-audio");
  var btnCancelar = document.getElementById("btn-cancelar");

  // Valores padrão (os mesmos do Figma) usados ao limpar o formulário
  var PADRAO = { dias: "Seg, Ter, Qua, Qui, Sex", hora: "6:45" };

  // Fica true quando a pessoa mexe em algum campo (usado para confirmar o "Cancelar")
  var alterado = false;

  /* ----- 1. Pré-visualização ao vivo ----- */
  function atualizarPrevia() {
    var conteudo = texto.value.trim();
    previaTexto.textContent = conteudo === "" ? "Sem texto ainda" : texto.value; // textContent: nunca interpreta HTML
    previaTexto.classList.toggle("vazio", conteudo === "");
  }
  texto.addEventListener("input", atualizarPrevia);

  /* ----- 2. Ouvir prévia (speechSynthesis) ----- */
  var suportaVoz = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  var falando = false;

  function mostrarRotuloOuvir() {
    rotuloOuvir.textContent = falando ? "Parar prévia" : "Ouvir prévia";
  }

  function pararVoz() {
    if (suportaVoz) window.speechSynthesis.cancel();
    falando = false;
    mostrarRotuloOuvir();
  }

  btnOuvir.addEventListener("click", function () {
    avisoAudio.textContent = "";

    if (!suportaVoz) {
      avisoAudio.textContent = "Seu navegador não suporta voz sintetizada.";
      return;
    }
    // Segundo clique durante a fala interrompe
    if (falando) { pararVoz(); return; }

    var fala = (titulo.value.trim() + ". " + texto.value.trim()).replace(/^\.\s*/, "").trim();
    if (fala === "" || fala === ".") {
      avisoAudio.textContent = "Escreva o título e o texto para ouvir.";
      return;
    }

    var leitura = new SpeechSynthesisUtterance(fala);
    leitura.lang = "pt-BR";
    leitura.onend = function () { falando = false; mostrarRotuloOuvir(); };
    leitura.onerror = function (e) {
      falando = false;
      mostrarRotuloOuvir();
      // "canceled"/"interrupted" acontecem quando a própria pessoa para a fala: não é erro
      if (e.error && e.error !== "canceled" && e.error !== "interrupted") {
        avisoAudio.textContent = "Não foi possível reproduzir o áudio.";
      }
    };

    falando = true;
    mostrarRotuloOuvir();
    window.speechSynthesis.cancel();   // limpa qualquer fala pendente
    window.speechSynthesis.speak(leitura);
  });

  // Se sair da página, para de falar
  window.addEventListener("pagehide", pararVoz);

  /* ----- 3. Entrega: Enviar agora x Agendar Recorrência ----- */
  var radiosEntrega = form.querySelectorAll('input[name="entrega"]');

  function atualizarEntrega() {
    var agendar = form.elements["entrega"].value === "agendar";
    // visibility (classe "oculta") mantém o espaço; disabled tira os campos do teclado
    agenda.classList.toggle("oculta", !agendar);
    dias.disabled = !agendar;
    hora.disabled = !agendar;
    if (!agendar) mostrarErro(hora, "");
  }
  Array.prototype.forEach.call(radiosEntrega, function (r) {
    r.addEventListener("change", atualizarEntrega);
  });

  /* ----- 4. Validação ----- */
  // Mostra ou limpa o erro de um campo (mensagem com aria-live, como no cadastro)
  function mostrarErro(input, mensagem) {
    var campo = input.closest(".campo");
    var local = document.getElementById("erro-" + input.id);
    if (!local) return;
    campo.classList.toggle("tem-erro", Boolean(mensagem));
    input.setAttribute("aria-invalid", mensagem ? "true" : "false");
    local.textContent = mensagem;
  }

  // Aceita 6:45, 06:45, 18:30 (hora 0–23, minutos 00–59)
  var FORMATO_HORA = /^([01]?\d|2[0-3]):[0-5]\d$/;

  function erroDe(input) {
    if (input === titulo) return titulo.value.trim() === "" ? "Informe o título do comunicado." : "";
    if (input === texto) return texto.value.trim() === "" ? "Escreva o texto do comunicado." : "";
    if (input === hora) {
      if (form.elements["entrega"].value !== "agendar") return "";
      var h = hora.value.trim();
      if (h === "") return "Informe a hora de envio.";
      return FORMATO_HORA.test(h) ? "" : "Use o formato H:MM ou HH:MM (ex.: 6:45).";
    }
    return "";
  }

  var validaveis = [titulo, texto, hora]; // ordem da tela = ordem do foco

  function validar() {
    var primeiroInvalido = null;
    validaveis.forEach(function (input) {
      var mensagem = erroDe(input);
      mostrarErro(input, mensagem);
      if (mensagem && !primeiroInvalido) primeiroInvalido = input;
    });
    if (primeiroInvalido) primeiroInvalido.focus();
    return primeiroInvalido === null;
  }

  // Quando a pessoa corrige o campo, o erro some na hora
  validaveis.forEach(function (input) {
    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true" && erroDe(input) === "") {
        mostrarErro(input, "");
      }
    });
  });

  // Qualquer mudança marca o formulário como "alterado"
  form.addEventListener("input", function () { alterado = true; });
  form.addEventListener("change", function () { alterado = true; });

  /* ----- 5. Limpar / voltar aos padrões ----- */
  function limparFormulario() {
    pararVoz();
    titulo.value = "";
    texto.value = "";
    turma.selectedIndex = 0;                          // "Todas as turmas"
    form.elements["tipo"].value = "fluxo";            // "Fluxo e ocupação"
    form.elements["entrega"].value = "agendar";       // "Agendar Recorrência"
    dias.value = PADRAO.dias;
    hora.value = PADRAO.hora;
    avisoAudio.textContent = "";
    validaveis.forEach(function (input) { mostrarErro(input, ""); });
    atualizarEntrega();
    atualizarPrevia();
    alterado = false;
  }

  /* ----- Envio (simulado, sem backend) ----- */
  form.addEventListener("submit", function (evento) {
    evento.preventDefault(); // não deixa o navegador recarregar a página
    if (!validar()) return;

    alert("Comunicado publicado com sucesso!\n\nTítulo: " + titulo.value.trim());
    limparFormulario();
    titulo.focus();
  });

  btnCancelar.addEventListener("click", function () {
    if (alterado && !window.confirm("Descartar o que foi preenchido e limpar o formulário?")) return;
    limparFormulario();
  });

  /* ----- Estado inicial ----- */
  atualizarEntrega();
  atualizarPrevia();
})();
