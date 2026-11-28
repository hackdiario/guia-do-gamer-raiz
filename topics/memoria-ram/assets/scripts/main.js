(() => {
  const FALLBACK_CONTENT = {
    xrays: [
      {
        question: "Só olhar o número em MHz/MT/s basta para comparar duas memórias?",
        answer: "Não. Uma memória com maior MT/s mas latência CAS (CL) muito alta pode ter tempo de acesso inicial semelhante ou pior em nanosegundos do que um kit bem ajustado."
      },
      {
        question: "Instalar dois pentes no mesmo canal (ex.: A1 e A2) ativa Dual Channel?",
        answer: "Não. Para operar em Dual Channel em placas com canais A e B, os módulos devem ocupar ambos os canais (tipicamente A2 e B2 quando são 2 pentes)."
      },
      {
        question: "Capacidade maior de RAM (ex.: 32 GB vs 16 GB) aumenta FPS quando já sobra memória?",
        answer: "Não. Se o jogo e o sistema não excedem a capacidade disponível, sobrar memória não cria FPS extra; o ganho ocorre quando a capacidade anterior estoura e causa paginação/engasgos."
      }
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Qual é a latência de coluna aproximada de um kit DDR4-3200 CL16 usando a fórmula (CL * 2000) / MT/s?",
        options: [
          "10,0 ns",
          "5,0 ns",
          "20,0 ns"
        ],
        correct: 0,
        explanation: "(16 * 2000) / 3200 = 32000 / 3200 = 10,0 ns."
      },
      {
        id: "q2",
        prompt: "Em uma placa-mãe com 4 slots (A1, A2, B1, B2) e 2 módulos de RAM, qual combinação costuma ser a recomendada pelo manual?",
        options: [
          "A2 e B2",
          "A1 e A2",
          "B1 e B2"
        ],
        correct: 0,
        explanation: "A2 e B2 atendem aos dois canais (A e B) e costumam ser os slots preferenciais na extremidade da trilha para melhor integridade de sinal."
      },
      {
        id: "q3",
        prompt: "Qual recurso na BIOS/UEFI carrega o perfil de frequência e temporizações da memória além do padrão básico inicial?",
        options: [
          "XMP ou EXPO",
          "CSM Legacy Boot",
          "Smart Access / ReBAR"
        ],
        correct: 0,
        explanation: "XMP (mais comum em plataformas Intel) e EXPO (mais comum em plataformas AMD) aplicam os perfis de alta frequência e timings do módulo."
      }
    ],
    references: [
      {
        category: "Padrões e Memória",
        items: [
          {
            title: "JEDEC — Memory Standards (DDR4 / DDR5)",
            url: "https://www.jedec.org/standards-documents",
            note: "Padrões oficiais de memória DDR e temporizações."
          },
          {
            title: "Corsair — Understanding Memory Timings & Latency",
            url: "https://www.corsair.com/us/en/explorer/diy-builder/memory/",
            note: "Guias práticos sobre frequência, CAS latency e canais de memória."
          }
        ]
      },
      {
        category: "Testes e Diagnóstico",
        items: [
          {
            title: "TechPowerUp — Memory Timings & Overclocking Guides",
            url: "https://www.techpowerup.com/review/",
            note: "Análises e testes de memória em jogos e aplicações."
          },
          {
            title: "CPU-Z",
            url: "https://www.cpuid.com/softwares/cpu-z.html",
            note: "Confira na aba Memory se está em Dual Channel e a frequência real/DRAM."
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

  function initRamCalculator() {
    const rateEl = document.getElementById("ram-rate");
    const clEl = document.getElementById("ram-cl");
    const chanEl = document.getElementById("ram-channels");
    const genEl = document.getElementById("ram-gen");

    const rateVal = document.getElementById("ram-rate-val");
    const clVal = document.getElementById("ram-cl-val");
    const metricsEl = document.getElementById("ram-metrics");

    if (!rateEl || !clEl || !metricsEl) return;

    function update() {
      const rate = Number(rateEl.value);
      const cl = Number(clEl.value);
      const channels = Number(chanEl.value);
      const gen = genEl.value;

      rateVal.textContent = `${rate} MT/s`;
      clVal.textContent = `CL${cl}`;

      const latencyNs = (cl * 2000) / rate;
      // Largura de banda teórica em GB/s: (MT/s * 8 bytes * canais)
      const bandwidthGBs = ((rate * 8 * channels) / 1000).toFixed(1);
      const realClockMhz = (rate / 2).toFixed(0);

      let note = "Latência equilibrada para jogos.";
      if (latencyNs <= 10.5) {
        note = "Baixa latência de coluna para a faixa.";
      } else if (latencyNs >= 13.0) {
        note = "Latência mais alta: avalie se a banda extra compensa.";
      }

      metricsEl.innerHTML = `
        <div class="metric-card">
          <span class="metric-label">Latência Real (CAS)</span>
          <span class="metric-val ${latencyNs > 13 ? "is-highlight" : ""}">${latencyNs.toFixed(2)} ns</span>
          <span class="metric-sub">${note}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Largura de Banda Teórica</span>
          <span class="metric-val">${bandwidthGBs} GB/s</span>
          <span class="metric-sub">${channels === 2 ? "Dual Channel (128-bit)" : "Single Channel (64-bit)"}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Clock I/O Base (${gen.toUpperCase()})</span>
          <span class="metric-val">${realClockMhz} MHz</span>
          <span class="metric-sub">DDR = 2x transferência/ciclo</span>
        </div>
      `;
    }

    document.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const preset = btn.dataset.preset;
        if (preset === "ddr4-3200-16") {
          genEl.value = "ddr4";
          rateEl.value = "3200";
          clEl.value = "16";
        } else if (preset === "ddr4-3600-16") {
          genEl.value = "ddr4";
          rateEl.value = "3600";
          clEl.value = "16";
        } else if (preset === "ddr5-6000-30") {
          genEl.value = "ddr5";
          rateEl.value = "6000";
          clEl.value = "30";
        } else if (preset === "ddr5-7200-34") {
          genEl.value = "ddr5";
          rateEl.value = "7200";
          clEl.value = "34";
        }
        update();
      });
    });

    [rateEl, clEl, chanEl, genEl].forEach((el) => {
      el.addEventListener("input", update);
      el.addEventListener("change", update);
    });

    update();
  }

  function initSlotPractice() {
    const slotsRow = document.getElementById("dimm-slots-row");
    const statusEl = document.getElementById("slot-status");
    const btnDual = document.getElementById("slot-preset-dual");
    const btnSingle = document.getElementById("slot-preset-single");
    const btnClear = document.getElementById("slot-preset-clear");

    if (!slotsRow || !statusEl) return;

    const occupied = new Set(["A2", "B2"]);

    function renderSlots() {
      slotsRow.querySelectorAll(".dimm-slot-btn").forEach((btn) => {
        const slot = btn.dataset.slot;
        const active = occupied.has(slot);
        btn.classList.toggle("is-populated", active);
        btn.setAttribute("aria-pressed", String(active));
      });

      const list = [...occupied];
      const hasA = list.some((s) => s.startsWith("A"));
      const hasB = list.some((s) => s.startsWith("B"));

      let mode = "Sem módulos instalados";
      let advice = "Clique em um ou mais slots para simular a instalação.";

      if (list.length === 0) {
        mode = "Nenhum pente instalado";
        advice = "O sistema não iniciará sem memória RAM instalada.";
      } else if (list.length === 1) {
        mode = `Single Channel (1 pente em ${list[0]})`;
        advice = list[0] === "A2"
          ? "Bom posicionamento para 1 pente em muitos manuais; adicionar um segundo pente em B2 ativará Dual Channel."
          : "Verifique o manual da placa para saber qual slot é o primeiro indicado para 1 módulo.";
      } else if (hasA && hasB) {
        const isIdealTwo = list.length === 2 && occupied.has("A2") && occupied.has("B2");
        mode = `Dual Channel ativo (${list.length} pentes: ${list.join(", ")})`;
        advice = isIdealTwo
          ? "Configuração ideal (A2 + B2) para 2 módulos na maioria das placas de 4 slots."
          : "Canais A e B ocupados. Se usar apenas 2 pentes, confira se A2 + B2 oferece melhor estabilidade/XMP.";
      } else {
        mode = `Apenas um canal ocupado (${list.join(", ")})`;
        advice = "Módulos no mesmo canal limitam o paralelismo entre canais A e B. Distribua entre os canais A e B.";
      }

      statusEl.innerHTML = `<strong>Modo detectado:</strong> ${mode} — ${advice}`;
    }

    slotsRow.addEventListener("click", (e) => {
      const btn = e.target.closest(".dimm-slot-btn");
      if (!btn) return;
      const slot = btn.dataset.slot;
      if (occupied.has(slot)) {
        occupied.delete(slot);
      } else {
        occupied.add(slot);
      }
      renderSlots();
    });

    btnDual?.addEventListener("click", () => {
      occupied.clear();
      occupied.add("A2");
      occupied.add("B2");
      renderSlots();
    });

    btnSingle?.addEventListener("click", () => {
      occupied.clear();
      occupied.add("A2");
      renderSlots();
    });

    btnClear?.addEventListener("click", () => {
      occupied.clear();
      renderSlots();
    });

    renderSlots();
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
    initRamCalculator();
    initSlotPractice();
    renderXRay();
    renderQuiz();
    renderReferences();
    initScrollSpy();
  }

  document.addEventListener("DOMContentLoaded", init);
})();