/* ==========================================================================
   cadastro.js — comportamento da tela de cadastro do aluno
   1. Matrícula: aceita só números.
   2. CPF: coloca a máscara 000.000.000-00 enquanto digita.
   3. Validação: matrícula, CPF, nome e senha são obrigatórios.
   4. Sem backend: se estiver tudo certo, mostra uma confirmação (alert).
   ========================================================================== */
(function () {
  "use strict";

  var form = document.getElementById("form-cadastro");
  var matricula = document.getElementById("matricula");
  var cpf = document.getElementById("cpf");
  var nome = document.getElementById("nome");
  var senha = document.getElementById("senha");

  /* ----- 1. Matrícula: tira tudo que não for número ----- */
  matricula.addEventListener("input", function () {
    matricula.value = matricula.value.replace(/\D/g, "");
  });

  /* ----- 2. Máscara do CPF ----- */
  // Pega só os números (máximo 11) e coloca os pontos e o traço nos lugares certos
  function mascararCpf(valor) {
    var n = valor.replace(/\D/g, "").slice(0, 11);
    if (n.length > 9) return n.slice(0, 3) + "." + n.slice(3, 6) + "." + n.slice(6, 9) + "-" + n.slice(9);
    if (n.length > 6) return n.slice(0, 3) + "." + n.slice(3, 6) + "." + n.slice(6);
    if (n.length > 3) return n.slice(0, 3) + "." + n.slice(3);
    return n;
  }

  cpf.addEventListener("input", function () {
    cpf.value = mascararCpf(cpf.value);
  });

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

  // Devolve a mensagem de erro de cada campo (ou "" se estiver certo)
  function erroDe(input) {
    if (input === matricula) {
      return matricula.value.trim() === "" ? "Informe a matrícula." : "";
    }
    if (input === cpf) {
      var digitos = cpf.value.replace(/\D/g, "");
      if (digitos.length === 0) return "Informe o CPF.";
      if (digitos.length < 11) return "O CPF precisa ter 11 números.";
      return "";
    }
    if (input === nome) {
      return nome.value.trim() === "" ? "Informe o nome completo." : "";
    }
    if (input === senha) {
      return senha.value === "" ? "Informe a senha provisória." : "";
    }
    return "";
  }

  var obrigatorios = [matricula, cpf, nome, senha]; // ordem de tabulação = ordem da tela

  function validar() {
    var primeiroInvalido = null;

    obrigatorios.forEach(function (input) {
      var mensagem = erroDe(input);
      mostrarErro(input, mensagem);
      if (mensagem && !primeiroInvalido) primeiroInvalido = input;
    });

    // Leva o foco ao primeiro campo com problema
    if (primeiroInvalido) primeiroInvalido.focus();
    return primeiroInvalido === null;
  }

  // Quando a pessoa corrige o campo, o erro dele some na hora
  obrigatorios.forEach(function (input) {
    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true" && erroDe(input) === "") {
        mostrarErro(input, "");
      }
    });
  });

  /* ----- 4. Envio (simulado) ----- */
  form.addEventListener("submit", function (evento) {
    evento.preventDefault(); // não deixa o navegador recarregar a página

    if (!validar()) return;

    // Sem backend: só confirma na tela. A senha NÃO aparece na mensagem.
    alert("Aluno cadastrado com sucesso!\n\nMatrícula: " + matricula.value +
          "\nNome: " + nome.value.trim() +
          "\n\nO acesso foi gerado com a senha provisória informada.");

    form.reset();
    obrigatorios.forEach(function (input) { mostrarErro(input, ""); });
    matricula.focus();
  });
})();
