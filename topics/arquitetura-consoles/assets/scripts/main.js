(() => {
  const FALLBACK_CONTENT = {
    xrays: [
      {
        question: "Qualquer jogo em modo Desempenho roda cravado a 120 FPS?",
        answer: "Não. Muitos modos Desempenho miram 60 FPS estáveis; modos de 120 FPS existem em títulos ou situações específicas e costumam reduzir resolução e efeitos visuais."
      },
      {
        question: "Ter uma TV 4K 60Hz impede ligar um console moderno?",
        answer: "Não. O console ajusta a saída para 4K 60Hz (ou 1080p/1440p conforme o caso), mas você não terá 120 Hz nem recursos exclusivos de HDMI 2.1 que dependam do painel."
      },
      {
        question: "Memória unificada significa memória infinita?",
        answer: "Não. O pool é compartilhado entre CPU, GPU e sistema; jogos exigentes ainda precisam gerenciar orçamento de memória para texturas, buffers e assets."
      }
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Qual é a principal vantagem arquitetônica da memória unificada em uma APU de console?",
        options: [
          "CPU e GPU acessam o mesmo pool de memória sem duplicar cópias entre RAM e VRAM separadas",
          "Elimina completamente a necessidade de armazenamento interno",
          "Aumenta a taxa de atualização física de qualquer monitor antigo para 240 Hz"
        ],
        correct: 0,
        explanation: "O pool unificado permite que CPU e GPU compartilhem dados na mesma memória física, evitando cópias redundantes entre pools separados."
      },
      {
        id: "q2",
        prompt: "Qual recurso ajuda a reduzir screen tearing e suavizar quedas moderadas de taxa de quadros na tela?",
        options: [
          "VRR (Variable Refresh Rate)",
          "Modo de economia de energia em standby",
          "Desativar a saída de áudio"
        ],
        correct: 0,
        explanation: "O VRR ajusta dinamicamente a atualização do display para acompanhar a entrega de quadros dentro da faixa suportada."
      },
      {
        id: "q3",
        prompt: "Em um jogo com opção entre Fidelidade e Desempenho, qual troca costuma ocorrer no modo Desempenho?",
        options: [
          "Prioriza maior taxa de quadros/fluidez em troca de menor resolução interna ou redução de detalhes/efeitos",
          "Aumenta o consumo elétrico da TV para dobrar a memória RAM do console",
          "Desliga o controle sem fio automaticamente"
        ],
        correct: 0,
        explanation: "O modo Desempenho reduz carga gráfica (resolução/sombras/RT) para entregar maior taxa de quadros e resposta mais fluida."
      }
    ],
    references: [
      {
        category: "Padrões de Vídeo e Display",
        items: [
          {
            title: "HDMI Licensing Administrator — HDMI 2.1 Overview",
            url: "https://www.hdmi.org/spec/hdmi2_1",
            note: "Especificações oficiais de largura de banda, VRR e ALLM no HDMI 2.1."
          },
          {
            title: "VESA — Adaptive-Sync / Display Standards",
            url: "https://vesa.org/",
            note: "Padrões da indústria de exibição e sincronização adaptativa."
          }
        ]
      },
      {
        category: "Análises Técnicas de Consoles",
        items: [
          {
            title: "Digital Foundry — Console & Graphics Tech Analysis",
            url: "https://www.eurogamer.net/digitalfoundry",
            note: "Análises detalhadas de modos gráficos, resolução, frametime e VRR em consoles."
          },
          {
            title: "RTINGS — TV & Gaming Display Reviews",
            url: "https://www.rtings.com/tv",
            note: "Medições técnicas de input lag, VRR, HDMI 2.1 e HDR em televisores."
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

  function initModeSim() {
    const modeEl = document.getElementById("con-mode");
    const outEl = document.getElementById("con-out");
    const vrrEl = document.getElementById("con-vrr");
    const sceneEl = document.getElementById("con-scene");

    const sceneVal = document.getElementById("con-scene-val");
    const metricsEl = document.getElementById("con-metrics");
    const diagEl = document.getElementById("con-diag");

    const btnPerf = document.getElementById("con-cmd-perf");
    const btnFid = document.getElementById("con-cmd-fid");
    const btnReset = document.getElementById("con-cmd-reset");

    if (!modeEl || !metricsEl) return;

    function update() {
      const mode = modeEl.value;
      const out = outEl.value;
      const vrrOn = vrrEl.value === "on";
      const scene = Number(sceneEl.value);

      sceneVal.textContent = scene === 1 ? "Leve" : scene === 2 ? "Médio" : "Pesado";

      let targetFps = 60;
      if (mode === "fidelity") targetFps = scene === 3 ? 30 : 30;
      else if (mode === "balanced") targetFps = 40;
      else targetFps = scene === 3 ? 52 : 60;

      if (out === "1080p120" && mode === "performance" && scene === 1) {
        targetFps = 100;
      }

      const frametimeMs = (1000 / targetFps).toFixed(1);
      const needsHdmi21 = out === "4k120";
      const smoothness = vrrOn
        ? "Suavização VRR ativa em oscilações"
        : "Sem VRR (sujeito a tearing/stutter em quedas)";

      metricsEl.innerHTML = `
        <div class="metric-card">
          <span class="metric-label">FPS Estimado / Frametime</span>
          <span class="metric-val">~${targetFps} FPS · ${frametimeMs} ms</span>
          <span class="metric-sub">Modo: ${mode === "fidelity" ? "Fidelidade" : mode === "balanced" ? "Balanceado" : "Desempenho"}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Sincronia de Tela</span>
          <span class="metric-val ${!vrrOn ? "is-warn" : ""}">${vrrOn ? "VRR ON" : "VRR OFF"}</span>
          <span class="metric-sub">${smoothness}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Perfil de Saída</span>
          <span class="metric-val">${out.toUpperCase()}</span>
          <span class="metric-sub">${needsHdmi21 ? "Requer HDMI 2.1 na tela" : "Compatível com HDMI 2.0/2.1"}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Prioridade de Recursos</span>
          <span class="metric-val">${mode === "fidelity" ? "Visual / Resolução" : "Fluidez / Resposta"}</span>
          <span class="metric-sub">Cena nível ${scene}/3</span>
        </div>
      `;

      let msg = "Configuração alinhada entre modo gráfico e saída de vídeo.";
      if (needsHdmi21 && !vrrOn) {
        msg = "Em saída 4K @ 120 Hz, ativar o VRR (quando suportado pela tela) ajuda a absorver variações de FPS.";
      } else if (mode === "fidelity" && targetFps === 30) {
        msg = "30 FPS exigem ~33,3 ms por quadro: prioriza resolução e detalhes visuais sobre resposta imediata.";
      }
      diagEl.innerHTML = `<strong>Leitura prática:</strong> ${msg}`;
    }

    [modeEl, outEl, vrrEl, sceneEl].forEach((el) => {
      el.addEventListener("input", update);
      el.addEventListener("change", update);
    });

    btnPerf?.addEventListener("click", () => {
      modeEl.value = "performance";
      outEl.value = "4k120";
      vrrEl.value = "on";
      sceneEl.value = "2";
      update();
    });

    btnFid?.addEventListener("click", () => {
      modeEl.value = "fidelity";
      outEl.value = "4k60";
      vrrEl.value = "on";
      sceneEl.value = "3";
      update();
    });

    btnReset?.addEventListener("click", () => {
      modeEl.value = "performance";
      outEl.value = "4k120";
      vrrEl.value = "on";
      sceneEl.value = "2";
      update();
    });

    update();
  }

  function initTvChecklist() {
    const box = document.getElementById("tv-checklist");
    const sumEl = document.getElementById("tv-summary");
    if (!box || !sumEl) return;

    function refresh() {
      const checks = [...box.querySelectorAll("[data-tv-check]")];
      const done = checks.filter((c) => c.checked).length;
      sumEl.textContent = `Itens verificados: ${done} de ${checks.length}`;
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
    initModeSim();
    initTvChecklist();
    renderXRay();
    renderQuiz();
    renderReferences();
    initScrollSpy();
  }

  document.addEventListener("DOMContentLoaded", init);
})();