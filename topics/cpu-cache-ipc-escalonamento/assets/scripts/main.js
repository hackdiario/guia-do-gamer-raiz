(() => {
  const FALLBACK_CONTENT = {
    scenarios: {
      "sim-heavy": {
        title: "Jogos com Muita Simulação, Física, IA ou Cidades/Multidão",
        detail: "Esses cenários exigem bastante cálculo de estado do mundo, acesso frequente a estruturas de dados e sincronização entre threads. IPC sólido, boa latência de memória e cache suficiente ajudam a manter o frametime mais estável."
      },
      "high-hz": {
        title: "Busca por 120+ FPS em Resoluções Menores com GPU Folgada",
        detail: "Quando a GPU não é o gargalo, cada quadro precisa ser preparado em poucos milissegundos pela CPU. Aqui o desempenho por núcleo, o escalonamento de threads e a resposta de cache ganham destaque."
      },
      "multitask": {
        title: "Jogo Rodando com Captura de Tela, Navegador ou Outros Processos",
        detail: "Processos em segundo plano disputam tempo de CPU e memória. Manter o sistema limpo e evitar cargas pesadas concorrentes ajuda a preservar a estabilidade das mínimas de FPS."
      }
    },
    xrays: [
      {
        question: "Uma CPU com 16 núcleos sempre entrega o dobro de FPS de uma CPU de 8 núcleos em jogos?",
        answer: "Não. Muitos jogos não escalam linearmente além de certos limites de threads e ainda dependem de cadeias de execução que exigem bom desempenho por núcleo e baixa latência."
      },
      {
        question: "Apenas olhar o número em GHz basta para comparar duas CPUs de gerações diferentes?",
        answer: "Não. Se uma arquitetura executa mais trabalho por ciclo (maior IPC) e tem cache mais eficiente, ela pode superar ou igualar um clock maior de geração antiga."
      },
      {
        question: "Cache L3 é a mesma coisa que memória RAM?",
        answer: "Não. Cache L3 fica integrado no processador com latência muito menor e capacidade bem menor que a RAM DDR, atuando como memória intermediária rápida."
      }
    ],
    quiz: [
      {
        id: "q1",
        prompt: "O que significa IPC no contexto de uma CPU?",
        options: [
          "Quantidade média de instruções concluídas por ciclo de clock",
          "Capacidade total do disco NVMe em gigabytes",
          "Taxa de atualização do monitor em hertz"
        ],
        correct: 0,
        explanation: "IPC (Instructions Per Cycle) mede quanto trabalho útil o núcleo realiza a cada ciclo de clock."
      },
      {
        id: "q2",
        prompt: "Qual é o papel principal da memória cache (L1/L2/L3) em relação à RAM principal?",
        options: [
          "Reduzir o tempo de espera por dados e instruções com menor latência que a RAM",
          "Substituir permanentemente o armazenamento de arquivos no SSD",
          "Converter sinal digital em analógico para alto-falantes"
        ],
        correct: 0,
        explanation: "A cache armazena dados/instruções acessados com frequência com acesso mais rápido e menor latência que a RAM."
      },
      {
        id: "q3",
        prompt: "Em um cenário focado em altas taxas de quadros com GPU folgada, o que tende a limitar o teto de FPS?",
        options: [
          "O ritmo de preparação de quadros pela CPU (IPC, clock, cache e escalonamento/latência)",
          "A cor do gabinete do computador",
          "A taxa de atualização máxima do teclado"
        ],
        correct: 0,
        explanation: "Quando a GPU tem folga, a velocidade com que a CPU prepara os quadros e gerencia threads passa a ditar o limite."
      }
    ],
    references: [
      {
        category: "Arquitetura de Processadores",
        items: [
          {
            title: "WikiChip — Microarchitectures & CPU Documentation",
            url: "https://en.wikichip.org/wiki/WikiChip",
            note: "Referência técnica sobre caches, pipelines, IPC e topologias de núcleos."
          },
          {
            title: "Gamers Nexus — CPU Benchmarks & Scaling",
            url: "https://gamersnexus.net/",
            note: "Testes práticos de CPUs em jogos, aplicações e impacto de cache/escalonamento."
          }
        ]
      },
      {
        category: "Análise e Telemetria",
        items: [
          {
            title: "HWiNFO64",
            url: "https://www.hwinfo.com/",
            note: "Monitore clocks efetivos por núcleo, temperaturas, potência e possíveis throttlings."
          },
          {
            title: "CapFrameX",
            url: "https://www.capframex.com/",
            note: "Ferramenta para analisar frametimes, percentis baixos e consistência de quadros."
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

  function initCpuSim() {
    const ipcEl = document.getElementById("cpu-ipc");
    const clockEl = document.getElementById("cpu-clock");
    const cacheEl = document.getElementById("cpu-cache");
    const bgEl = document.getElementById("cpu-bg");

    const ipcVal = document.getElementById("cpu-ipc-val");
    const clockVal = document.getElementById("cpu-clock-val");
    const metricsEl = document.getElementById("cpu-metrics");
    const diagEl = document.getElementById("cpu-diag");

    const btnEsports = document.getElementById("cpu-cmd-esports");
    const btnBg = document.getElementById("cpu-cmd-bg");
    const btnReset = document.getElementById("cpu-cmd-reset");

    if (!ipcEl || !metricsEl) return;

    function update() {
      const ipc = Number(ipcEl.value);
      const clock = Number(clockEl.value);
      const cache = cacheEl.value;
      const bg = bgEl.value;

      ipcVal.textContent = `${ipc.toFixed(2)}x`;
      clockVal.textContent = `${clock.toFixed(1)} GHz`;

      const cacheMult = cache === "high" ? 1.14 : cache === "mid" ? 1.04 : 0.94;
      const bgMult = bg === "clean" ? 1.0 : bg === "stream" ? 0.92 : 0.78;

      // Índice ilustrativo normalizado (referência 1.00x IPC @ 4.8 GHz, cache mid, carga clean = 100)
      const rawIndex = (ipc * clock * cacheMult * bgMult) / (1.0 * 4.8 * 1.04);
      const perfIndex = Math.round(rawIndex * 100);
      const estCpuCapFps = Math.max(45, Math.round(perfIndex * 1.35));

      const isHeavyBg = bg === "heavy";
      const stabilityLabel = isHeavyBg ? "Possível oscilação em mínimas" : "Estável para carga atual";

      metricsEl.innerHTML = `
        <div class="metric-card">
          <span class="metric-label">Índice Relativo CPU (Jogos)</span>
          <span class="metric-val">${perfIndex} pts</span>
          <span class="metric-sub">IPC ${ipc.toFixed(2)}x · ${clock.toFixed(1)} GHz</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Teto Estimado de CPU</span>
          <span class="metric-val">~${estCpuCapFps} FPS</span>
          <span class="metric-sub">Em cenários limitados por CPU</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Perfil de Cache L3</span>
          <span class="metric-val">${cache === "high" ? "Amplo / V-Cache" : cache === "mid" ? "Intermediário" : "Padrão"}</span>
          <span class="metric-sub">Multiplicador cache: ${cacheMult.toFixed(2)}x</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Carga em Segundo Plano</span>
          <span class="metric-val ${isHeavyBg ? "is-warn" : ""}">${bg === "clean" ? "Leve" : bg === "stream" ? "Moderada" : "Pesada"}</span>
          <span class="metric-sub">${stabilityLabel}</span>
        </div>
      `;

      let note = "Combinação equilibrada entre IPC, frequência e cache.";
      if (isHeavyBg) {
        note = "Tarefas pesadas em segundo plano reduzem recursos livres e podem elevar picos de frametime.";
      } else if (cache === "high" && perfIndex >= 115) {
        note = "Cache amplo somado a bom IPC/clock favorece consistência de quadros em títulos sensíveis à memória/cache.";
      }
      diagEl.innerHTML = `<strong>Leitura técnica:</strong> ${note}`;
    }

    [ipcEl, clockEl, cacheEl, bgEl].forEach((el) => {
      el.addEventListener("input", update);
      el.addEventListener("change", update);
    });

    btnEsports?.addEventListener("click", () => {
      ipcEl.value = "1.15";
      clockEl.value = "5.2";
      cacheEl.value = "high";
      bgEl.value = "clean";
      update();
    });

    btnBg?.addEventListener("click", () => {
      bgEl.value = "heavy";
      update();
    });

    btnReset?.addEventListener("click", () => {
      ipcEl.value = "1.00";
      clockEl.value = "4.8";
      cacheEl.value = "mid";
      bgEl.value = "clean";
      update();
    });

    update();
  }

  function initScenarios() {
    const tabsEl = document.getElementById("sched-tabs");
    const outEl = document.getElementById("sched-output");
    if (!tabsEl || !outEl) return;

    function selectScenario(key) {
      const item = data.scenarios[key];
      if (!item) return;

      tabsEl.querySelectorAll(".sched-tab").forEach((t) => {
        t.classList.toggle("is-active", t.dataset.sc === key);
      });

      outEl.innerHTML = `<strong>${item.title}:</strong> ${item.detail}`;
    }

    tabsEl.addEventListener("click", (e) => {
      const tab = e.target.closest(".sched-tab");
      if (!tab) return;
      selectScenario(tab.dataset.sc);
    });

    selectScenario("sim-heavy");
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
    initCpuSim();
    initScenarios();
    renderXRay();
    renderQuiz();
    renderReferences();
    initScrollSpy();
  }

  document.addEventListener("DOMContentLoaded", init);
})();