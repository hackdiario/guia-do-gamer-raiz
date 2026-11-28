(() => {
  const FALLBACK_CONTENT = {
    matrix: {
      "gamer-main": {
        title: "SSD Principal (Sistema Operacional + Jogos)",
        detail: "Um bom NVMe PCIe Gen4 x4 (com DRAM ou HMB sólido) oferece ótimo equilíbrio entre preço, velocidade e disponibilidade. Para jogos, a transição de HDD ou SATA para NVMe traz o salto mais perceptível; entre Gen4 e Gen5, o ganho em carregamento de fases costuma ser modesto."
      },
      "library-extra": {
        title: "Expansão de Biblioteca de Jogos e Arquivos",
        detail: "Avalie custo por terabyte e slots disponíveis. Um SSD NVMe Gen3/Gen4 secundário ou até um SSD SATA (quando os slots M.2 já estão ocupados) atende bem bibliotecas grandes, lembrando de verificar possíveis compartilhamentos de portas no manual da placa-mãe."
      },
      "creator-heavy": {
        title: "Transferência Frequente de Arquivos Grandes e Produção",
        detail: "Priorize controladoras capazes de sustentar escritas longas, cache DRAM (ou boa gestão de SLC cache/HMB) e dissipação térmica adequada para evitar queda de velocidade por superaquecimento."
      }
    },
    xrays: [
      {
        question: "Dobrar a velocidade sequencial do SSD (ex.: 7.000 MB/s para 14.000 MB/s) corta o tempo de carregamento de jogos pela metade?",
        answer: "Não. Carregar um jogo envolve descompressão, preparo de texturas/shaders, CPU e GPU — não apenas leitura sequencial bruta do drive."
      },
      {
        question: "SSD NVMe DRAM-less é sempre ruim?",
        answer: "Não. Modelos DRAM-less com HMB (Host Memory Buffer) funcionam bem para uso cotidiano e jogos, embora SSDs com DRAM costumem lidar melhor com escritas intensas e sustentadas."
      },
      {
        question: "Aumentar o espaço livre do SSD não faz diferença?",
        answer: "Manter margem livre ajuda a controladora no garbage collection, wear leveling e manutenção de cache SLC, evitando degradação quando o drive fica quase 100% cheio."
      }
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Qual é o limite prático aproximado de transferência da interface SATA III em comparação a um SSD NVMe PCIe Gen4 x4?",
        options: [
          "SATA III fica em torno de 500–600 MB/s, enquanto NVMe Gen4 x4 alcança cerca de 6.500–7.400 MB/s",
          "SATA III alcança 12.000 MB/s e NVMe Gen4 fica em 550 MB/s",
          "Ambos têm a mesma banda máxima de 600 MB/s"
        ],
        correct: 0,
        explanation: "SATA III é limitado a ~6 Gbps (~550–600 MB/s reais), enquanto NVMe PCIe Gen4 x4 oferece largura de banda muito superior."
      },
      {
        id: "q2",
        prompt: "O que é HMB (Host Memory Buffer) em um SSD NVMe sem chip DRAM próprio?",
        options: [
          "Recurso que permite ao SSD utilizar uma pequena porção da memória RAM do sistema via PCIe",
          "Um tipo de cabo de energia extra para o slot M.2",
          "Uma ventoinha acoplada à placa-mãe"
        ],
        correct: 0,
        explanation: "HMB usa uma pequena fatia da RAM do host para auxiliar no mapeamento de endereços em drives DRAM-less."
      },
      {
        id: "q3",
        prompt: "Por que dissipadores em SSDs NVMe de alta velocidade são relevantes em cargas longas?",
        options: [
          "Para reduzir o risco de thermal throttling da controladora sob uso contínuo",
          "Para aumentar a capacidade de gigabytes do SSD",
          "Para converter sinais SATA em USB"
        ],
        correct: 0,
        explanation: "Controladoras sob transferência pesada aquecem e podem reduzir a velocidade para se proteger caso superaqueçam."
      }
    ],
    references: [
      {
        category: "Padrões e Tecnologia",
        items: [
          {
            title: "NVM Express (NVMe) Organization",
            url: "https://nvmexpress.org/",
            note: "Especificações oficiais do protocolo NVMe sobre PCIe."
          },
          {
            title: "Microsoft — DirectStorage Overview",
            url: "https://learn.microsoft.com/en-us/gaming/windows/directstorage",
            note: "Documentação sobre carregamento moderno de ativos de jogos via GPU/NVMe."
          }
        ]
      },
      {
        category: "Benchmarks e Análises",
        items: [
          {
            title: "TechPowerUp — SSD Reviews & Storage Benchmarks",
            url: "https://www.techpowerup.com/review/?category=SSDs",
            note: "Testes de leitura/escrita, latência, cache e temperaturas de SSDs."
          },
          {
            title: "Tom's Hardware — Best SSDs & Storage Testing",
            url: "https://www.tomshardware.com/reviews/best-ssds,3891.html",
            note: "Guias e testes práticos de unidades NVMe e SATA."
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

  function initSsdSim() {
    const typeEl = document.getElementById("ssd-type");
    const cacheEl = document.getElementById("ssd-cache");
    const workEl = document.getElementById("ssd-workload");
    const coolEl = document.getElementById("ssd-heatsink");

    const coolVal = document.getElementById("ssd-cool-val");
    const metricsEl = document.getElementById("ssd-metrics");
    const diagEl = document.getElementById("ssd-diag");

    const btnGen4 = document.getElementById("ssd-cmd-gen4");
    const btnGen5 = document.getElementById("ssd-cmd-gen5");
    const btnSata = document.getElementById("ssd-cmd-sata");

    if (!typeEl || !metricsEl) return;

    const baseSpeedMap = { sata: 550, gen3: 3400, gen4: 7000, gen5: 12000 };
    const baseTempMap = { sata: 42, gen3: 52, gen4: 62, gen5: 74 };

    function update() {
      const type = typeEl.value;
      const cache = cacheEl.value;
      const workload = workEl.value;
      const coolPct = Number(coolEl.value) / 100;

      coolVal.textContent = coolPct >= 0.75 ? "Alto" : coolPct >= 0.5 ? "Médio" : "Baixo";

      const seqSpeed = baseSpeedMap[type] || 7000;
      const cacheFactor = cache === "dram" ? 1.0 : cache === "hmb" ? 0.92 : 0.78;
      const sustainedWrite = Math.round(seqSpeed * 0.45 * cacheFactor * (workload === "transfer" ? 0.72 : 1.0));

      const workloadHeat = workload === "transfer" ? 12 : 4;
      const controllerTemp = Math.max(
        32,
        Math.round(baseTempMap[type] + workloadHeat - coolPct * 14 + (cache === "nodram" ? 3 : 0))
      );
      const isHot = controllerTemp >= 78;

      // Tempo relativo ilustrativo para carregar um pacote de 60 GB considerando CPU/descompressão
      const rawReadFactor = type === "sata" ? 1.0 : type === "gen3" ? 0.52 : type === "gen4" ? 0.36 : 0.31;
      const loadSeconds =
        workload === "game"
          ? (24 * rawReadFactor * (isHot ? 1.15 : 1.0)).toFixed(1)
          : ((60 * 1024) / Math.max(250, sustainedWrite)).toFixed(1);

      metricsEl.innerHTML = `
        <div class="metric-card">
          <span class="metric-label">Leitura Sequencial (Pico)</span>
          <span class="metric-val">${seqSpeed.toLocaleString("pt-BR")} MB/s</span>
          <span class="metric-sub">Interface: ${type.toUpperCase()}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Escrita Sustentada Est.</span>
          <span class="metric-val">${sustainedWrite.toLocaleString("pt-BR")} MB/s</span>
          <span class="metric-sub">Cache: ${cache.toUpperCase()}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Temp. Controladora</span>
          <span class="metric-val ${isHot ? "is-warn" : ""}">${controllerTemp}°C</span>
          <span class="metric-sub">${isHot ? "Risco de throttling térmico" : "Faixa térmica segura"}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">${workload === "game" ? "Carga de Cena (Est.)" : "Cópia 60 GB (Est.)"}</span>
          <span class="metric-val">${loadSeconds}s</span>
          <span class="metric-sub">${workload === "game" ? "Inclui processamento/descompressão" : "Baseado em escrita sustentada"}</span>
        </div>
      `;

      let note = "Desempenho consistente para o cenário selecionado.";
      if (isHot) {
        note = "Controladora aquecida: adicione ou melhore o dissipador térmico e o fluxo de ar no gabinete.";
      } else if (type === "gen5" && workload === "game") {
        note = "Em jogos, um bom Gen4 costuma ter tempo de carregamento muito próximo ao Gen5 com menor calor.";
      }
      diagEl.innerHTML = `<strong>Leitura prática:</strong> ${note}`;
    }

    [typeEl, cacheEl, workEl, coolEl].forEach((el) => {
      el.addEventListener("input", update);
      el.addEventListener("change", update);
    });

    btnGen4?.addEventListener("click", () => {
      typeEl.value = "gen4";
      cacheEl.value = "dram";
      workEl.value = "game";
      coolEl.value = "50";
      update();
    });

    btnGen5?.addEventListener("click", () => {
      typeEl.value = "gen5";
      cacheEl.value = "dram";
      workEl.value = "transfer";
      coolEl.value = "75";
      update();
    });

    btnSata?.addEventListener("click", () => {
      typeEl.value = "sata";
      cacheEl.value = "dram";
      workEl.value = "game";
      coolEl.value = "50";
      update();
    });

    update();
  }

  function initMatrix() {
    const tabsEl = document.getElementById("matrix-tabs");
    const outEl = document.getElementById("matrix-output");
    if (!tabsEl || !outEl) return;

    function selectProfile(key) {
      const item = data.matrix[key];
      if (!item) return;

      tabsEl.querySelectorAll(".matrix-tab").forEach((t) => {
        t.classList.toggle("is-active", t.dataset.profile === key);
      });

      outEl.innerHTML = `<strong>${item.title}:</strong> ${item.detail}`;
    }

    tabsEl.addEventListener("click", (e) => {
      const tab = e.target.closest(".matrix-tab");
      if (!tab) return;
      selectProfile(tab.dataset.profile);
    });

    selectProfile("gamer-main");
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
    initSsdSim();
    initMatrix();
    renderXRay();
    renderQuiz();
    renderReferences();
    initScrollSpy();
  }

  document.addEventListener("DOMContentLoaded", init);
})();