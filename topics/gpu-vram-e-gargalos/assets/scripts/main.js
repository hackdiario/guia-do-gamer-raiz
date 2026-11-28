(() => {
  const FALLBACK_CONTENT = {
    symptoms: {
      "vram-spike": {
        title: "Queda Brusca de FPS e Stutter ao Virar a Câmera / Carregar Áreas",
        detail: "Verifique o consumo de VRAM no overlay (ex.: MSI Afterburner/RTSS ou HWiNFO64). Se a VRAM estiver no teto da placa, reduzir a qualidade de texturas em um nível costuma resolver rapidamente sem perder tanta nitidez quanto baixar a resolução."
      },
      "low-gpu-util": {
        title: "Utilização da GPU Abaixo do Esperado com FPS Baixo",
        detail: "Pode indicar limitação de CPU/thread principal, gargalo de memória/latência, limite de quadros ativo ou cena muito pesada para a CPU. Subir a resolução costuma aumentar a carga na GPU sem necessariamente elevar o limite imposto pela CPU."
      },
      "high-gpu-util": {
        title: "GPU Próxima de 98–100% com Frametime Consistente",
        detail: "Em geral, indica que a GPU está entregando o máximo de desempenho possível para a resolução e os ajustes gráficos atuais — comportamento esperado quando a placa de vídeo é o fator limitante do quadro."
      }
    },
    xrays: [
      {
        question: "Existe uma porcentagem 'mágica' de gargalo que resume qualquer PC?",
        answer: "Não. Calculadoras genéricas de gargalo na internet não medem o motor do jogo, a cena, a resolução, a taxa de atualização nem a memória/latência do sistema."
      },
      {
        question: "FPS médio alto significa jogabilidade lisa sem travadas?",
        answer: "Não. Picos isolados de frametime (stuttering) podem ocorrer mesmo quando a média de FPS parece alta."
      },
      {
        question: "Mais gigabytes de VRAM sempre deixam uma GPU fraca mais rápida?",
        answer: "Não. A capacidade de VRAM evita falta de memória para texturas/buffers, mas o poder de processamento gráfico e a largura de banda continuam determinando a velocidade base da GPU."
      }
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Qual métrica revela melhor picos isolados de engasgo (stuttering) que podem ficar disfarçados em uma média alta de quadros?",
        options: [
          "Frametime (tempo por quadro em milissegundos) e percentis baixos de FPS",
          "Apenas o FPS médio da partida inteira",
          "A capacidade nominal do SSD SATA"
        ],
        correct: 0,
        explanation: "O frametime mostra o tempo gasto em cada quadro individual; picos em ms evidenciam engasgos mesmo com média elevada."
      },
      {
        id: "q2",
        prompt: "O que tende a ocorrer quando um jogo exige mais VRAM do que a placa de vídeo possui?",
        options: [
          "Quedas acentuadas de desempenho e stutter por troca de dados fora da VRAM",
          "Aumento automático do clock base da GPU em 500 MHz",
          "Redução do consumo de energia do monitor"
        ],
        correct: 0,
        explanation: "A falta de VRAM força tráfego pela memória principal/barramento e degrada a consistência dos quadros."
      },
      {
        id: "q3",
        prompt: "Se a GPU está em ~55% de uso em 1080p e o FPS não sobe ao reduzir a resolução, qual é a hipótese técnica principal?",
        options: [
          "Outro fator (como CPU/threads, memória ou limite do motor do jogo) está limitando o teto de quadros antes da GPU saturar",
          "A GPU precisa de mais cabo HDMI para ligar",
          "O monitor está com brilho baixo"
        ],
        correct: 0,
        explanation: "Quando diminuir a carga gráfica da GPU não eleva o FPS, o teto de quadros está sendo imposto fora da GPU."
      }
    ],
    references: [
      {
        category: "Análises e Benchmarks de GPU",
        items: [
          {
            title: "TechPowerUp — GPU Reviews & Relative Performance",
            url: "https://www.techpowerup.com/review/",
            note: "Benchmarks em múltiplas resoluções, consumo, temperaturas e frametime."
          },
          {
            title: "Gamers Nexus — GPU Benchmarks & Frametime Analysis",
            url: "https://gamersnexus.net/",
            note: "Análise de médias, 1% / 0.1% lows e consistência de entrega de quadros."
          }
        ]
      },
      {
        category: "Monitoramento e Ferramentas",
        items: [
          {
            title: "GPU-Z",
            url: "https://www.techpowerup.com/gpuz/",
            note: "Inspecione VRAM total, largura de banda, clocks e uso de memória na aba Sensors."
          },
          {
            title: "HWiNFO64",
            url: "https://www.hwinfo.com/",
            note: "Monitore uso de GPU, VRAM alocada/dedicada, temperaturas e hot spot."
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

  function initGpuSim() {
    const vramEl = document.getElementById("gpu-vram");
    const tierEl = document.getElementById("gpu-tier");
    const resEl = document.getElementById("gpu-res");
    const texEl = document.getElementById("gpu-tex");
    const cpuEl = document.getElementById("gpu-cpu");
    const scaleEl = document.getElementById("gpu-scale");

    const scaleVal = document.getElementById("gpu-scale-val");
    const metricsEl = document.getElementById("gpu-metrics");
    const diagEl = document.getElementById("gpu-diag");

    const btnVram = document.getElementById("gpu-cmd-vram");
    const btnCpu = document.getElementById("gpu-cmd-cpu");
    const btnReset = document.getElementById("gpu-cmd-reset");

    if (!vramEl || !metricsEl) return;

    const scaleLabels = ["Nativo", "Qualidade (Upscale)", "Desempenho (Upscale)"];
    const scaleMults = [1.0, 1.25, 1.45];

    function update() {
      const vramGb = Number(vramEl.value);
      const tier = tierEl.value;
      const res = resEl.value;
      const tex = texEl.value;
      const cpu = cpuEl.value;
      const scaleIdx = Number(scaleEl.value);

      scaleVal.textContent = scaleLabels[scaleIdx] || "Nativo";

      const resBase = res === "1080p" ? 6.2 : res === "1440p" ? 8.6 : 11.8;
      const texAdd = tex === "med" ? 0.5 : tex === "high" ? 1.8 : 4.2;
      const neededVramGb = Number((resBase + texAdd - scaleIdx * 0.4).toFixed(1));
      const vramOverflow = neededVramGb > vramGb;

      const gpuScore = { entry: 75, mid: 115, high: 165 }[tier] || 115;
      const resFactor = { "1080p": 1.0, "1440p": 0.72, "4k": 0.48 }[res] || 0.72;
      const texFactor = { med: 1.08, high: 1.0, ultra: 0.78 }[tex] || 1.0;

      let gpuFps = gpuScore * resFactor * texFactor * (scaleMults[scaleIdx] || 1.0);
      if (vramOverflow) {
        gpuFps *= 0.62;
      }

      const cpuCapFps = { weak: 78, balanced: 125, strong: 185 }[cpu] || 125;
      const finalFps = Math.max(18, Math.round(Math.min(gpuFps, cpuCapFps)));
      const frametimeMs = (1000 / finalFps).toFixed(1);

      let limiter = "GPU (Limitante Gráfico)";
      if (vramOverflow) limiter = "VRAM Esgotada (Stutter / Queda)";
      else if (cpuCapFps < gpuFps) limiter = "CPU / Plataforma (Teto de Quadros)";

      const hasWarn = vramOverflow || cpuCapFps < gpuFps;

      metricsEl.innerHTML = `
        <div class="metric-card">
          <span class="metric-label">FPS Estimado / Frametime</span>
          <span class="metric-val ${vramOverflow ? "is-warn" : ""}">~${finalFps} FPS · ${frametimeMs} ms</span>
          <span class="metric-sub">Resolução: ${res.toUpperCase()}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">VRAM Estimada / Limite</span>
          <span class="metric-val ${vramOverflow ? "is-warn" : ""}">${neededVramGb} / ${vramGb} GB</span>
          <span class="metric-sub">${vramOverflow ? "Acima da capacidade da GPU" : "Dentro da margem da placa"}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Fator Limitante</span>
          <span class="metric-val ${hasWarn ? "is-warn" : ""}">${limiter}</span>
          <span class="metric-sub">CPU teto: ~${cpuCapFps} FPS</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Escala de Renderização</span>
          <span class="metric-val">${scaleLabels[scaleIdx]}</span>
          <span class="metric-sub">Qualidade: ${tex.toUpperCase()}</span>
        </div>
      `;

      let msg = "Desempenho equilibrado para a combinação escolhida.";
      if (vramOverflow) {
        msg = `Demanda estimada de ${neededVramGb} GB excede os ${vramGb} GB de VRAM: reduza texturas ou resolução/upscaling para evitar engasgos.`;
      } else if (cpuCapFps < gpuFps) {
        msg = `A GPU entregaria ~${Math.round(gpuFps)} FPS, mas o perfil de CPU limita em torno de ~${cpuCapFps} FPS neste cenário.`;
      }
      diagEl.innerHTML = `<strong>Leitura de gargalo:</strong> ${msg}`;
    }

    [vramEl, tierEl, resEl, texEl, cpuEl, scaleEl].forEach((el) => {
      el.addEventListener("input", update);
      el.addEventListener("change", update);
    });

    btnVram?.addEventListener("click", () => {
      vramEl.value = "8";
      tierEl.value = "mid";
      resEl.value = "4k";
      texEl.value = "ultra";
      scaleEl.value = "0";
      update();
    });

    btnCpu?.addEventListener("click", () => {
      vramEl.value = "16";
      tierEl.value = "high";
      resEl.value = "1080p";
      texEl.value = "med";
      cpuEl.value = "weak";
      scaleEl.value = "0";
      update();
    });

    btnReset?.addEventListener("click", () => {
      vramEl.value = "12";
      tierEl.value = "mid";
      resEl.value = "1440p";
      texEl.value = "high";
      cpuEl.value = "balanced";
      scaleEl.value = "0";
      update();
    });

    update();
  }

  function initSymptoms() {
    const tabsEl = document.getElementById("symptom-tabs");
    const outEl = document.getElementById("symptom-output");
    if (!tabsEl || !outEl) return;

    function selectSym(key) {
      const item = data.symptoms[key];
      if (!item) return;

      tabsEl.querySelectorAll(".symptom-tab").forEach((t) => {
        t.classList.toggle("is-active", t.dataset.sym === key);
      });

      outEl.innerHTML = `<strong>${item.title}:</strong> ${item.detail}`;
    }

    tabsEl.addEventListener("click", (e) => {
      const tab = e.target.closest(".symptom-tab");
      if (!tab) return;
      selectSym(tab.dataset.sym);
    });

    selectSym("vram-spike");
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
    initGpuSim();
    initSymptoms();
    renderXRay();
    renderQuiz();
    renderReferences();
    initScrollSpy();
  }

  document.addEventListener("DOMContentLoaded", init);
})();