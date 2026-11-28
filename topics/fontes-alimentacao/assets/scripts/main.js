(() => {
  const FALLBACK_CONTENT = {
    xrays: [
      {
        question: "Uma fonte de 1000W consome 1000W o tempo todo?",
        answer: "Não. A fonte entrega a potência exigida pelos componentes naquele instante (mais perdas de eficiência), não o máximo nominal o tempo todo."
      },
      {
        question: "Selo 80 Plus Gold garante que a fonte não é ruim?",
        answer: "Não. Eficiência mede conversão energética em carga específica, não qualidade de filtragem de ripple, proteções (OCP/OVP/OPP) ou durabilidade de capacitores."
      },
      {
        question: "Usar estabilizador melhora ou protege a fonte do PC?",
        answer: "Em fontes modernas com PFC ativo (faixa ampla de tensão), estabilizadores criam chaveamentos lentos e podem prejudicar a fonte em vez de ajudar."
      }
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Qual trilho concentra a maior demanda de energia em uma placa de vídeo e processador modernos?",
        options: [
          "Trilho +12V",
          "Trilho -12V",
          "Trilho +3.3VSB apenas"
        ],
        correct: 0,
        explanation: "O trilho +12V alimenta CPU (EPS), GPU (PCIe / 12V-2x6) e os estágios reguladores principais."
      },
      {
        id: "q2",
        prompt: "O que ocorre quando uma GPU gera um pico transiente muito acima do TDP médio e a fonte não tem margem/excursão adequada?",
        options: [
          "A fonte pode desligar ou reiniciar o PC por proteção de sobrecarga/sobrecorrente",
          "A frequência da memória RAM aumenta automaticamente",
          "A temperatura do monitor diminui"
        ],
        correct: 0,
        explanation: "Picos transientes rápidos elevam a corrente instantânea; fontes sem folga ou tolerância adequada podem desarmar."
      },
      {
        id: "q3",
        prompt: "Em um conector 12VHPWR / 12V-2x6 de GPU, qual cuidado de instalação é essencial?",
        options: [
          "Encaixar completamente até o travamento sem dobra brusca próxima ao conector",
          "Deixar uma pequena folga para facilitar a ventilação",
          "Conectar apenas metade dos pinos em GPUs acima de 200W"
        ],
        correct: 0,
        explanation: "Mau encaixe ou dobra forçada na saída do conector aumenta resistência de contato e aquecimento localizado."
      }
    ],
    references: [
      {
        category: "Padrões e Certificações",
        items: [
          {
            title: "CLEAResult — 80 PLUS Program",
            url: "https://www.clearesult.com/80plus/",
            note: "Informações oficiais sobre níveis de certificação de eficiência energética."
          },
          {
            title: "Intel — ATX Power Supply Design Guides",
            url: "https://www.intel.com/content/www/us/en/products/docs/power-management.html",
            note: "Diretrizes de projeto de fontes ATX e requisitos de excursão de potência."
          }
        ]
      },
      {
        category: "Testes e Engenharia de PSU",
        items: [
          {
            title: "Cybenetics — PSU Efficiency & Noise Certifications",
            url: "https://www.cybenetics.com/",
            note: "Avaliações de eficiência ponderada e ruído acústico de fontes."
          },
          {
            title: "TechPowerUp — Power Supply Reviews",
            url: "https://www.techpowerup.com/review/?category=Power+Supplies",
            note: "Testes de carga, ripple, eficiência e abertura interna de fontes."
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

  function initPsuSim() {
    const wattsEl = document.getElementById("psu-watts");
    const tierEl = document.getElementById("psu-tier");
    const gpuEl = document.getElementById("psu-gpu-w");
    const cpuEl = document.getElementById("psu-cpu-w");
    const spikeEl = document.getElementById("psu-spike");
    const ambEl = document.getElementById("psu-amb");

    const gpuVal = document.getElementById("psu-gpu-val");
    const cpuVal = document.getElementById("psu-cpu-val");
    const spikeVal = document.getElementById("psu-spike-val");
    const ambVal = document.getElementById("psu-amb-val");
    const telemetryEl = document.getElementById("psu-telemetry");
    const diagLogEl = document.getElementById("psu-diag-log");

    const svgAcW = document.getElementById("svg-ac-w");
    const svg12vA = document.getElementById("svg-12v-a");
    const svgGpuLoad = document.getElementById("svg-gpu-load");
    const svgCpuLoad = document.getElementById("svg-cpu-load");
    const svgHeatW = document.getElementById("svg-heat-w");
    const svgPeakW = document.getElementById("svg-peak-w");
    const svgPsuBox = document.getElementById("svg-psu-box");

    const btnHeavy = document.getElementById("psu-cmd-heavy");
    const btnMid = document.getElementById("psu-cmd-mid");
    const btnReset = document.getElementById("psu-cmd-reset");

    if (!wattsEl || !telemetryEl) return;

    const effMap = { bomba: 0.76, bronze: 0.85, gold: 0.90, platinum: 0.92 };

    function compute() {
      const ratedW = Number(wattsEl.value);
      const tier = tierEl.value;
      const gpuW = Number(gpuEl.value);
      const cpuW = Number(cpuEl.value);
      const spikeMult = Number(spikeEl.value);
      const ambC = Number(ambEl.value);

      gpuVal.textContent = `${gpuW} W`;
      cpuVal.textContent = `${cpuW} W`;
      spikeVal.textContent = `${spikeMult.toFixed(1)}x`;
      ambVal.textContent = `${ambC}°C`;

      const dcSustainedW = gpuW + cpuW;
      const dcPeakW = Math.round(gpuW * spikeMult + cpuW * 1.1);
      const eff = effMap[tier] || 0.88;
      const acDrawW = Math.round(dcSustainedW / eff);
      const heatW = Math.max(0, acDrawW - dcSustainedW);

      const useful12vW = tier === "bomba" ? ratedW * 0.75 : ratedW * 0.98;
      const loadPct = Math.round((dcSustainedW / ratedW) * 100);
      const current12vA = (dcSustainedW / 12).toFixed(1);

      const isOverloadSustained = dcSustainedW > useful12vW;
      const isPeakRisk = dcPeakW > ratedW * (tier === "bomba" ? 1.05 : 1.35);
      const isBomba = tier === "bomba";
      const hasWarn = isOverloadSustained || isPeakRisk || isBomba || loadPct > 85;

      telemetryEl.innerHTML = `
        <div class="telemetry-card">
          <span class="telemetry-label">Carga DC / Rede AC</span>
          <span class="telemetry-value ${isOverloadSustained ? "is-warn" : ""}">${dcSustainedW} W / ${acDrawW} W</span>
          <span class="telemetry-sub">Utilização: ${loadPct}% da nominal</span>
        </div>
        <div class="telemetry-card">
          <span class="telemetry-label">Corrente +12V / Calor</span>
          <span class="telemetry-value ${heatW > 85 ? "is-warn" : ""}">${current12vA} A / ${heatW} W</span>
          <span class="telemetry-sub">Eficiência estimada: ${Math.round(eff * 100)}%</span>
        </div>
        <div class="telemetry-card">
          <span class="telemetry-label">Pico Transiente Estimado</span>
          <span class="telemetry-value ${isPeakRisk ? "is-warn" : ""}">${dcPeakW} W</span>
          <span class="telemetry-sub">Limite útil +12V: ~${Math.round(useful12vW)} W</span>
        </div>
        <div class="telemetry-card">
          <span class="telemetry-label">Estado da PSU</span>
          <span class="telemetry-value ${hasWarn ? "is-warn" : ""}">${isOverloadSustained ? "SOBRECARGA" : isPeakRisk ? "PICO CRÍTICO" : hasWarn ? "ATENÇÃO" : "ESTÁVEL"}</span>
          <span class="telemetry-sub">Ambiente: ${ambC}°C</span>
        </div>
      `;

      svgAcW.textContent = `${acDrawW} W`;
      svg12vA.textContent = `${current12vA} A`;
      svgGpuLoad.textContent = `${gpuW} W`;
      svgCpuLoad.textContent = `${cpuW} W`;
      svgHeatW.textContent = `Calor dissipado: ${heatW} W`;
      svgPeakW.textContent = `Pico transiente: ${dcPeakW} W`;
      svgPsuBox.style.stroke = hasWarn ? "var(--accent-red)" : "currentColor";

      let msg = "Potência e margem dentro de faixa segura para o cenário configurado.";
      if (isBomba) {
        msg = "Alerta: projeto genérico/sem certificação confiável apresenta risco elétrico e baixa entrega real no +12V.";
      } else if (isOverloadSustained) {
        msg = `Sobrecarga contínua (${dcSustainedW}W DC acima de ~${Math.round(useful12vW)}W úteis no +12V). Suba a potência nominal da PSU.`;
      } else if (isPeakRisk) {
        msg = `Pico transiente de ${dcPeakW}W pode desarmar fontes sem folga ou padrão ATX 3.x.`;
      } else if (loadPct > 85) {
        msg = `Carga em ${loadPct}%: há pouca folga para upgrades e aumento de ruído térmico.`;
      }

      diagLogEl.innerHTML = `<strong>Diagnóstico:</strong> ${msg}`;
    }

    [wattsEl, tierEl, gpuEl, cpuEl, spikeEl, ambEl].forEach((el) => {
      el.addEventListener("input", compute);
      el.addEventListener("change", compute);
    });

    btnHeavy?.addEventListener("click", () => {
      wattsEl.value = "750";
      tierEl.value = "gold";
      gpuEl.value = "420";
      cpuEl.value = "210";
      spikeEl.value = "1.8";
      compute();
    });

    btnMid?.addEventListener("click", () => {
      wattsEl.value = "650";
      tierEl.value = "bronze";
      gpuEl.value = "180";
      cpuEl.value = "110";
      spikeEl.value = "1.3";
      compute();
    });

    btnReset?.addEventListener("click", () => {
      wattsEl.value = "750";
      tierEl.value = "gold";
      gpuEl.value = "260";
      cpuEl.value = "155";
      spikeEl.value = "1.4";
      ambEl.value = "25";
      compute();
    });

    compute();
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
    initPsuSim();
    renderXRay();
    renderQuiz();
    renderReferences();
    initScrollSpy();
  }

  document.addEventListener("DOMContentLoaded", init);
})();