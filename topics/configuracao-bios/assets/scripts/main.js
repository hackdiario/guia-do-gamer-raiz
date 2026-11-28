(() => {
  const FALLBACK_CONTENT = {
    xrays: [
      {
        question: "Atualizar a BIOS é obrigatório todo mês mesmo quando o PC funciona perfeitamente?",
        answer: "Não. Em geral, atualize quando houver correção importante de estabilidade, segurança ou suporte a processador/memória que você realmente utilize."
      },
      {
        question: "Dar Clear CMOS apaga meus arquivos pessoais do SSD?",
        answer: "Não. Clear CMOS restaura as configurações da BIOS/UEFI da placa-mãe para o padrão, não formata discos nem apaga arquivos do sistema operacional."
      },
      {
        question: "Ativar Resizable BAR sempre dá ganho enorme em todo jogo?",
        answer: "Não. Depende do jogo, do driver e da arquitetura; em alguns títulos há ganho mensurável e em outros o impacto é neutro ou exige teste específico."
      }
    ],
    quiz: [
      {
        id: "q1",
        prompt: "O PC liga as ventoinhas, mas o Debug LED da placa-mãe fica aceso em DRAM e não dá vídeo. Qual é o primeiro passo prático?",
        options: [
          "Desligar da tomada, reencaixar os módulos de RAM nos slots recomendados (ex.: A2/B2) e testar novamente",
          "Trocar o cabo de força do monitor por um cabo de rede",
          "Formatar o SSD antes de entrar na UEFI"
        ],
        correct: 0,
        explanation: "LED em DRAM indica falha ou dificuldade na inicialização/treinamento da memória; reencaixar e validar os slots é o passo inicial padrão."
      },
      {
        id: "q2",
        prompt: "Qual recurso na UEFI permite que a CPU acesse regiões maiores da memória de vídeo (VRAM) da GPU?",
        options: [
          "Resizable BAR (com Above 4G Decoding habilitado)",
          "CSM Legacy Mode",
          "Eco Fan Stop"
        ],
        correct: 0,
        explanation: "Resizable BAR amplia a janela de acesso da CPU à memória da GPU quando suportado pelo conjunto de hardware e firmware."
      },
      {
        id: "q3",
        prompt: "Após instalar o sistema operacional a partir de um pendrive, o que é boa prática na ordem de boot?",
        options: [
          "Priorizar o SSD/unidade com o sistema operacional em vez de manter o pendrive em primeiro",
          "Desativar o armazenamento NVMe na BIOS",
          "Remover a bateria CMOS após cada reinicialização"
        ],
        correct: 0,
        explanation: "Priorizar o drive do sistema evita iniciar novamente o instalador USB e acelera o boot normal."
      }
    ],
    references: [
      {
        category: "Padrões de Firmware",
        items: [
          {
            title: "UEFI Forum — Unified Extensible Firmware Interface",
            url: "https://uefi.org/",
            note: "Especificações oficiais da arquitetura de firmware UEFI."
          },
          {
            title: "Microsoft — Boot to UEFI Mode & BIOS Settings",
            url: "https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/boot-to-uefi-mode-or-bios",
            note: "Documentação técnica sobre inicialização UEFI e modos de boot."
          }
        ]
      },
      {
        category: "Diagnóstico e Utilitários",
        items: [
          {
            title: "CPU-Z",
            url: "https://www.cpuid.com/softwares/cpu-z.html",
            note: "Verifique na aba Mainboard a versão e data da BIOS instalada."
          },
          {
            title: "HWiNFO64",
            url: "https://www.hwinfo.com/",
            note: "Acompanhe temperaturas, clocks e status de Resizable BAR / sensores do sistema."
          }
        ]
      }
    ]
  };

  let data = FALLBACK_CONTENT;

  function initThemeSync() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("ggr-theme", next);
    });
  }

  async function loadContent() {
    try {
      const res = await fetch("./assets/data/content.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    } catch {
      data = FALLBACK_CONTENT;
    }
  }

  function initBiosSim() {
    const verEl = document.getElementById("bios-ver");
    const ramEl = document.getElementById("bios-ram");
    const xmpEl = document.getElementById("bios-xmp");
    const rebarEl = document.getElementById("bios-rebar");

    const gridEl = document.getElementById("bios-status-grid");
    const logEl = document.getElementById("bios-log");

    const btnTest = document.getElementById("bios-cmd-test");
    const btnFault = document.getElementById("bios-cmd-fault");
    const btnReset = document.getElementById("bios-cmd-reset");

    if (!verEl || !gridEl) return;

    function evaluate() {
      const biosOk = verEl.value === "ok";
      const ramOk = ramEl.value === "dual";
      const xmpOn = xmpEl.value === "on";
      const rebarOn = rebarEl.value === "on";

      let postResult = "POST CONCLUÍDO (BOOT OK)";
      let ledState = "LEDs apagados / Boot normal";
      let hasFault = false;
      let diag = "POST finalizado sem falhas. Perfil de memória e barramento configurados.";

      if (!biosOk) {
        postResult = "FALHA NO POST (BIOS)";
        ledState = "LED CPU / sem vídeo";
        hasFault = true;
        diag = "BIOS desatualizada para a CPU: atualize o firmware (via BIOS Flashback ou CPU compatível).";
      } else if (!ramOk) {
        postResult = "FALHA NO POST (DRAM)";
        ledState = "LED DRAM aceso";
        hasFault = true;
        diag = "Falha de memória: verifique encaixe dos módulos e uso dos slots A2/B2; faça Clear CMOS se necessário.";
      } else if (xmpOn) {
        diag = "XMP/EXPO ativo: valide estabilidade em jogos e testes de memória; se houver instabilidade, reduza taxa ou ajuste tensão.";
      }

      gridEl.innerHTML = `
        <div class="bios-card">
          <span class="bios-card-label">Resultado POST</span>
          <span class="bios-card-val ${hasFault ? "is-warn" : ""}">${postResult}</span>
          <span class="bios-card-sub">${ledState}</span>
        </div>
        <div class="bios-card">
          <span class="bios-card-label">Memória / XMP-EXPO</span>
          <span class="bios-card-val ${!ramOk ? "is-warn" : ""}">${ramOk ? (xmpOn ? "Dual + XMP/EXPO" : "Dual + Padrão") : "Erro DRAM"}</span>
          <span class="bios-card-sub">Topologia de slots</span>
        </div>
        <div class="bios-card">
          <span class="bios-card-label">Resizable BAR</span>
          <span class="bios-card-val">${rebarOn ? "Habilitado" : "Desabilitado"}</span>
          <span class="bios-card-sub">Acesso CPU à VRAM</span>
        </div>
        <div class="bios-card">
          <span class="bios-card-label">Firmware BIOS</span>
          <span class="bios-card-val ${!biosOk ? "is-warn" : ""}">${biosOk ? "Atualizada" : "Requer update"}</span>
          <span class="bios-card-sub">Compatibilidade CPU</span>
        </div>
      `;

      logEl.innerHTML = `<strong>Diagnóstico UEFI:</strong> ${diag}`;
    }

    [verEl, ramEl, xmpEl, rebarEl].forEach((el) => {
      el.addEventListener("change", evaluate);
    });

    btnTest?.addEventListener("click", evaluate);

    btnFault?.addEventListener("click", () => {
      verEl.value = "ok";
      ramEl.value = "loose";
      evaluate();
    });

    btnReset?.addEventListener("click", () => {
      verEl.value = "ok";
      ramEl.value = "dual";
      xmpEl.value = "on";
      rebarEl.value = "on";
      evaluate();
    });

    evaluate();
  }

  function initBootChecklist() {
    const box = document.getElementById("boot-checklist");
    const progEl = document.getElementById("boot-progress");
    if (!box || !progEl) return;

    function refresh() {
      const checks = [...box.querySelectorAll("[data-boot-check]")];
      const done = checks.filter((c) => c.checked).length;
      progEl.textContent = `Etapas concluídas: ${done} de ${checks.length}`;
    }

    box.addEventListener("change", refresh);
    refresh();
  }

  function renderXRay() {
    const container = document.getElementById("xray-container");
    if (!container) return;

    container.innerHTML = data.xrays
      .map(
        (item, idx) => `
        <article class="xray-card" id="xray-${idx}">
          <button type="button" class="xray-trigger" aria-expanded="false" aria-controls="xray-body-${idx}">
            <span>${item.question}</span>
            <span class="xray-indicator" aria-hidden="true">+</span>
          </button>
          <div id="xray-body-${idx}" class="xray-body">
            <p>${item.answer}</p>
          </div>
        </article>`
      )
      .join("");

    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".xray-trigger");
      if (!btn) return;
      const card = btn.closest(".xray-card");
      const expanded = btn.getAttribute("aria-expanded") === "true";

      btn.setAttribute("aria-expanded", String(!expanded));
      card.classList.toggle("is-open", !expanded);
      btn.querySelector(".xray-indicator").textContent = !expanded ? "−" : "+";
    });
  }

  function renderQuiz() {
    const container = document.getElementById("quiz-container");
    if (!container) return;

    const answers = new Map();

    container.innerHTML = `
      ${data.quiz
        .map(
          (q, qIndex) => `
          <div class="quiz-question" data-qid="${q.id}">
            <p class="quiz-q-title">${qIndex + 1}. ${q.prompt}</p>
            <div class="quiz-options">
              ${q.options
                .map(
                  (opt, oIndex) => `
                  <button type="button" class="quiz-option-btn" data-qindex="${qIndex}" data-oindex="${oIndex}">
                    ${opt}
                  </button>`
                )
                .join("")}
            </div>
            <div class="quiz-feedback" hidden></div>
          </div>`
        )
        .join("")}
      <button type="button" id="quiz-finish-btn" class="btn-primary-red">Calcular Pontuação Final</button>
      <div id="quiz-score" class="quiz-score" aria-live="polite"></div>
    `;

    container.addEventListener("click", (e) => {
      const optBtn = e.target.closest(".quiz-option-btn");
      if (optBtn) {
        const qIndex = Number(optBtn.dataset.qindex);
        const oIndex = Number(optBtn.dataset.oindex);
        const question = data.quiz[qIndex];
        const qBox = optBtn.closest(".quiz-question");
        const buttons = qBox.querySelectorAll(".quiz-option-btn");
        const feedbackEl = qBox.querySelector(".quiz-feedback");

        answers.set(qIndex, oIndex === question.correct);

        buttons.forEach((b, idx) => {
          b.disabled = true;
          if (idx === question.correct) {
            b.classList.add("is-correct");
          } else if (idx === oIndex && oIndex !== question.correct) {
            b.classList.add("is-wrong");
          }
        });

        const isRight = oIndex === question.correct;
        feedbackEl.hidden = false;
        feedbackEl.innerHTML = `
          <strong>${isRight ? "Correto:" : "Incorreto:"}</strong> ${question.explanation}
        `;
      }

      if (e.target.id === "quiz-finish-btn") {
        let score = 0;
        answers.forEach((val) => {
          if (val) score += 1;
        });
        const scoreEl = document.getElementById("quiz-score");
        scoreEl.textContent = `Pontuação: ${score} / ${data.quiz.length} (${answers.size} respondidas)`;
      }
    });
  }

  function renderReferences() {
    const container = document.getElementById("references-container");
    if (!container) return;

    container.innerHTML = data.references
      .map(
        (group) => `
        <div class="ref-card">
          <h3>${group.category}</h3>
          <ul>
            ${group.items
              .map(
                (item) => `
                <li>
                  <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>
                  <span>${item.note}</span>
                </li>`
              )
              .join("")}
          </ul>
        </div>`
      )
      .join("");
  }

  function initScrollSpy() {
    const links = document.querySelectorAll("#anchor-list a");
    const sections = document.querySelectorAll(".topic-main section[id]");
    if (!links.length || !sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            links.forEach((a) => {
              a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  async function init() {
    initThemeSync();
    await loadContent();
    initBiosSim();
    initBootChecklist();
    renderXRay();
    renderQuiz();
    renderReferences();
    initScrollSpy();
  }

  document.addEventListener("DOMContentLoaded", init);
})();