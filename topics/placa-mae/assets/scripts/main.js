(() => {
  const FALLBACK_CONTENT = {
    zones: {
      eps: {
        badge: "ALIMENTAÇÃO CPU",
        title: "Conector EPS 8-pin (CPU_PWR)",
        desc: "Fornece a linha dedicada de 12V para os estágios reguladores do processador. CPUs de alto consumo podem utilizar um conector 8-pin adicional ou 4-pin extra.",
        meta: "Não confunda cabo PCIe de GPU (6+2 pin) com EPS de CPU (4+4 pin): o formato e a pinagem são distintos."
      },
      vrm: {
        badge: "REGULAÇÃO DE TENSÃO",
        title: "VRM (Voltage Regulator Module) e Dissipadores",
        desc: "Converte 12V em Vcore estável usando PWM controller, drivers, MOSFETs/DrMOS, chokes e capacitores.",
        meta: "Dissipadores de alumínio em contato térmico com os MOSFETs reduzem thermal throttling sob carga contínua."
      },
      socket: {
        badge: "INTERFACE DO PROCESSADOR",
        title: "Socket da CPU",
        desc: "Conecta fisicamente e eletricamente o processador à placa-mãe, expondo trilhas de memória, PCIe direto e alimentação.",
        meta: "Verifique compatibilidade de geração e versão mínima de BIOS antes de instalar o processador."
      },
      ram: {
        badge: "MEMÓRIA DO SISTEMA",
        title: "Slots DIMM (DDR4 / DDR5)",
        desc: "Conectam os módulos de memória ao controlador integrado na CPU. Em placas de 4 slots, A2 e B2 costumam ser os slots prioritários para 2 pentes.",
        meta: "Ative XMP ou EXPO na BIOS após validar estabilidade; em DDR5, revise também o treinamento de memória."
      },
      atx: {
        badge: "ALIMENTAÇÃO PRINCIPAL",
        title: "Conector ATX 24-pin",
        desc: "Distribui 12V, 5V, 3,3V e sinais de controle de energia da fonte para a placa-mãe e barramentos auxiliares.",
        meta: "Certifique-se de que o conector esteja totalmente travado antes do primeiro boot."
      },
      m2: {
        badge: "ARMAZENAMENTO NVMe",
        title: "Slots M.2 (NVMe / PCIe)",
        desc: "Recebem SSDs NVMe de alta velocidade. O primeiro slot costuma usar pistas diretas do CPU; slots adicionais podem usar o chipset ou dividir pistas.",
        meta: "Em alguns modelos, usar certos slots M.2 desativa portas SATA específicas."
      },
      pcie: {
        badge: "BARRAMENTO DE EXPANSÃO",
        title: "Slots PCIe x16 e Expansão",
        desc: "O slot principal (geralmente mais próximo ao socket) conecta a GPU às pistas PCIe diretas do processador.",
        meta: "Verifique se o slot opera em x16 nativo ou se há divisão de pistas em configurações multi-dispositivo."
      },
      chipset: {
        badge: "HUB DE I/O",
        title: "Chipset (PCH / FCH)",
        desc: "Gerencia conectividade adicional, portas USB, SATA, rede/áudio e slots secundários, comunicando-se com o CPU por link dedicado.",
        meta: "O dissipador do chipset deve permanecer livre de obstruções para manter temperaturas estáveis."
      }
    },
    xrays: [
      {
        question: "Placa-mãe mais cara dá mais FPS automaticamente?",
        answer: "Não. O desempenho bruto de quadros depende principalmente de GPU, CPU, memória e ausência de thermal throttling. Placas mais caras entregam melhor VRM para CPUs pesados, mais fases/portas, melhor rede/áudio e recursos extras, não FPS mágico."
      },
      {
        question: "SSD PCIe 5.0 muda drasticamente o tempo de carregamento em jogos?",
        answer: "Na prática de jogos atuais, a diferença frente a um bom NVMe PCIe 4.0 costuma ser pequena ou marginal, pois descompressão de ativos e processamento da CPU/GPU também pesam. O ganho maior aparece em cargas de trabalho específicas com leitura/escrita sequencial pesada."
      },
      {
        question: "Posso ligar só 1 cabo EPS 8-pin se a placa tem dois conectores?",
        answer: "Em muitos cenários de uso normal ou moderado, um único EPS 8-pin bem dimensionado já atende, mas o segundo conector ajuda na distribuição de corrente em CPUs de alto consumo e overclock. Consulte o manual do fabricante para o seu modelo."
      }
    ],
    quiz: [
      {
        id: "q1",
        prompt: "Em um teste prolongado de renderização/CPU, o clock cai e a temperatura do VRM está muito alta. Qual é o diagnóstico mais provável?",
        options: [
          "Thermal throttling do VRM por dissipação insuficiente ou falta de fluxo de ar na região",
          "Falta de perfil XMP/EXPO na memória RAM",
          "Cabo HDMI do monitor operando em taxa baixa"
        ],
        correct: 0,
        explanation: "Quando o VRM aquece além do limite seguro, o sistema reduz o clock da CPU para diminuir a demanda de corrente e proteger os componentes."
      },
      {
        id: "q2",
        prompt: "Você instala 2 módulos de RAM em uma placa-mãe com 4 slots (A1, A2, B1, B2). Quais slots costumam ser os recomendados pelo manual?",
        options: [
          "A1 e A2 no mesmo canal",
          "A2 e B2 para manter Dual Channel e minimizar reflexão de sinal",
          "B1 e B2 apenas, deixando A2 vazio"
        ],
        correct: 1,
        explanation: "A2 e B2 formam o par Dual Channel recomendado na maioria das placas de 4 slots para melhor integridade de sinal."
      },
      {
        id: "q3",
        prompt: "Ao adicionar vários SSDs M.2 e placas de expansão, o que pode acontecer na placa-mãe?",
        options: [
          "Aumento automático do número de pistas PCIe da CPU",
          "Compartilhamento de pistas (ex.: GPU cair de x16 para x8) ou desativação de portas SATA",
          "Aumento da capacidade de VRAM da placa de vídeo"
        ],
        correct: 1,
        explanation: "A quantidade de pistas PCIe é finita; placas com roteamento compartilhado podem reduzir a largura do slot da GPU ou desativar portas SATA."
      },
      {
        id: "q4",
        prompt: "Qual recurso facilita atualizar a BIOS para suportar um processador mais novo mesmo sem uma CPU antiga compatível?",
        options: [
          "BIOS Flashback / Q-Flash Plus (atualização via USB dedicada)",
          "Trocar a pilha CMOS por uma de maior voltagem",
          "Desativar o barramento PCIe na fonte"
        ],
        correct: 0,
        explanation: "Recursos como BIOS Flashback permitem gravar o firmware a partir de um pendrive na porta específica mesmo sem CPU ou memória instaladas."
      },
      {
        id: "q5",
        prompt: "Qual é o papel central do chipset na arquitetura da placa-mãe?",
        options: [
          "Substituir a unidade aritmética da CPU durante jogos",
          "Atuar como hub de I/O e expansão (USB, SATA, portas/slots adicionais) conectado à CPU",
          "Armazenar permanentemente os arquivos do sistema operacional"
        ],
        correct: 1,
        explanation: "O chipset expande a conectividade de entrada/saída e periféricos, comunicando-se com o processador por um link dedicado."
      }
    ],
    references: [
      {
        category: "Especificações Oficiais",
        items: [
          {
            title: "PCI-SIG — PCI Express Specifications",
            url: "https://pcisig.com/specifications",
            note: "Padrões oficiais das gerações PCIe (3.0, 4.0, 5.0+) e larguras de pista."
          },
          {
            title: "AMD — Socket AM5 Chipsets",
            url: "https://www.amd.com/en/products/processors/chipsets/am5.html",
            note: "Especificações de chipsets e conectividade da plataforma AM5."
          },
          {
            title: "Intel — Intel Core Desktop Processors & Chipsets",
            url: "https://www.intel.com/content/www/us/en/products/details/processors/core.html",
            note: "Documentação de soquetes, controladores e plataformas desktop Intel."
          }
        ]
      },
      {
        category: "Análises de VRM e Hardware",
        items: [
          {
            title: "TechPowerUp — Motherboard Reviews & Databases",
            url: "https://www.techpowerup.com/review/",
            note: "Análises técnicas de componentes, VRM, temperaturas e barramentos."
          },
          {
            title: "Gamers Nexus — Hardware Testing & Engineering",
            url: "https://gamersnexus.net/",
            note: "Testes térmicos, análise de VRM e investigações de engenharia de hardware."
          },
          {
            title: "Hardware Unboxed (YouTube)",
            url: "https://www.youtube.com/@HardwareUnboxed",
            note: "Comparativos térmicos de VRM em placas-mãe e análises de desempenho."
          },
          {
            title: "Actually Hardcore Overclocking — Buildzoid (YouTube)",
            url: "https://www.youtube.com/@ActuallyHardcoreOverclocking",
            note: "Análise detalhada de componentes de VRM, fases e topologia de PCB."
          }
        ]
      },
      {
        category: "Ferramentas de Diagnóstico",
        items: [
          {
            title: "HWiNFO64",
            url: "https://www.hwinfo.com/",
            note: "Observe sensores de VRM/MOS, CPU Package Power, Core Clocks e Thermal Throttling."
          },
          {
            title: "CPU-Z",
            url: "https://www.cpuid.com/softwares/cpu-z.html",
            note: "Confira abas CPU, Mainboard (versão de BIOS) e Memory (canal/frequência)."
          },
          {
            title: "GPU-Z",
            url: "https://www.techpowerup.com/gpuz/",
            note: "Observe o campo 'Bus Interface' (ex.: PCIe x16 4.0 @ x16 4.0) sob carga."
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

  function initMoboMap() {
    const zones = document.querySelectorAll(".mobo-zone");
    const badgeEl = document.getElementById("inspector-badge");
    const titleEl = document.getElementById("inspector-title");
    const descEl = document.getElementById("inspector-desc");
    const metaEl = document.getElementById("inspector-meta");
    if (!zones.length || !titleEl) return;

    function selectZone(key) {
      const info = data.zones[key];
      if (!info) return;

      zones.forEach((el) => {
        el.classList.toggle("is-selected", el.dataset.zone === key);
      });

      badgeEl.textContent = info.badge;
      titleEl.textContent = info.title;
      descEl.textContent = info.desc;
      metaEl.innerHTML = `<strong>Nota técnica:</strong> ${info.meta}`;
    }

    zones.forEach((zone) => {
      const key = zone.dataset.zone;
      zone.addEventListener("mouseenter", () => selectZone(key));
      zone.addEventListener("click", () => selectZone(key));
    });
  }

  function initSimulator() {
    const cpuSelect = document.getElementById("sim-cpu");
    const vrmSelect = document.getElementById("sim-vrm");
    const ioSelect = document.getElementById("sim-io");
    const outputEl = document.getElementById("sim-output");
    if (!cpuSelect || !vrmSelect || !ioSelect || !outputEl) return;

    function updateSim() {
      const cpuTdp = Number(cpuSelect.value);
      const vrmTier = vrmSelect.value;
      const ioMode = ioSelect.value;

      let vrmRisk = "Baixo — folga térmica adequada.";
      let vrmAlert = false;

      if (cpuTdp >= 170 && vrmTier === "basic") {
        vrmRisk = "Crítico — alto risco de thermal throttling severo e instabilidade.";
        vrmAlert = true;
      } else if (cpuTdp >= 170 && vrmTier === "mid") {
        vrmRisk = "Moderado/Alto — exige bom airflow no gabinete e monitoramento de VRM.";
        vrmAlert = true;
      } else if (cpuTdp >= 105 && vrmTier === "basic") {
        vrmRisk = "Alto — placas sem dissipador podem reduzir clock em carga contínua.";
        vrmAlert = true;
      } else if (vrmTier === "pro") {
        vrmRisk = "Baixo — margem térmica sólida para cargas sustentadas.";
      }

      let pcieStatus = "GPU em x16 nativo (sem divisão de pistas detectada).";
      let pcieAlert = false;
      let portsNote = "Sem conflito de portas SATA/M.2 no cenário base.";

      if (ioMode === "multi") {
        pcieStatus = "Atenção: em placas com roteamento compartilhado, múltiplos dispositivos podem dividir pistas (ex.: x16 -> x8).";
        pcieAlert = true;
        portsNote = "Verifique o manual da placa para portas SATA desativadas ou slots M.2 ligados ao chipset.";
      }

      const verdict =
        vrmAlert || pcieAlert
          ? "Configuração exige validação no manual da placa-mãe e monitoramento com HWiNFO64/GPU-Z."
          : "Configuração equilibrada para o perfil selecionado.";

      outputEl.innerHTML = `
        <div class="sim-metric">
          <span>VRM &amp; Térmica</span>
          <strong class="${vrmAlert ? "status-alert" : ""}">${vrmRisk}</strong>
        </div>
        <div class="sim-metric">
          <span>Barramento PCIe</span>
          <strong class="${pcieAlert ? "status-alert" : ""}">${pcieStatus}</strong>
        </div>
        <div class="sim-metric">
          <span>I/O &amp; Armazenamento</span>
          <strong>${portsNote}</strong>
        </div>
        <div class="sim-metric">
          <span>Veredito</span>
          <strong class="${vrmAlert || pcieAlert ? "status-alert" : ""}">${verdict}</strong>
        </div>
      `;
    }

    cpuSelect.addEventListener("change", updateSim);
    vrmSelect.addEventListener("change", updateSim);
    ioSelect.addEventListener("change", updateSim);
    updateSim();
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
    initMoboMap();
    initSimulator();
    renderXRay();
    renderQuiz();
    renderReferences();
    initScrollSpy();
    initMotherboardLab();
  }

  document.addEventListener("DOMContentLoaded", init);
  
  function initMotherboardLab() {
    const cpuEl = document.getElementById("lab-cpu-profile");
    const vrmEl = document.getElementById("lab-vrm-quality");
    const loadEl = document.getElementById("lab-load");
    const airEl = document.getElementById("lab-airflow");
    const vcoreEl = document.getElementById("lab-vcore");
    const slotsEl = document.getElementById("lab-slots");

    const loadVal = document.getElementById("lab-load-val");
    const airVal = document.getElementById("lab-airflow-val");
    const vcoreVal = document.getElementById("lab-vcore-val");
    const telemetryEl = document.getElementById("lab-telemetry");
    const diagLogEl = document.getElementById("lab-diag-log");

    const btnPrime = document.getElementById("lab-cmd-prime");
    const btnEco = document.getElementById("lab-cmd-eco");
    const btnReset = document.getElementById("lab-cmd-reset");

    const svgVrm = document.getElementById("svg-vrm");
    const svgVrmTxt = document.getElementById("svg-vrm-txt");
    const svgCpu = document.getElementById("svg-cpu");
    const svgCpuClk = document.getElementById("svg-cpu-clk");
    const svgCpuTmp = document.getElementById("svg-cpu-tmp");
    const svgPcie = document.getElementById("svg-pcie");
    const svgPcieTxt = document.getElementById("svg-pcie-txt");
    const svgM2Txt = document.getElementById("svg-m2-txt");
    const svgPchTxt = document.getElementById("svg-pch-txt");

    if (!cpuEl || !telemetryEl) return;

    function compute() {
      const baseTdp = Number(cpuEl.value);
      const vrmTier = vrmEl.value;
      const loadPct = Number(loadEl.value) / 100;
      const airflowPct = Number(airEl.value) / 100;
      const vcoreOffset = Number(vcoreEl.value);
      const slotsMode = slotsEl.value;

      const ambientC = Math.round(30 - airflowPct * 11);
      loadVal.textContent = `${Math.round(loadPct * 100)}%`;
      airVal.textContent = `${airflowPct >= 0.7 ? "Alto" : airflowPct >= 0.35 ? "Médio" : "Baixo"} (${ambientC}°C)`;
      vcoreVal.textContent = `${vcoreOffset >= 0 ? "+" : ""}${vcoreOffset.toFixed(2)} V`;

      const vcore = Math.max(0.95, 1.2 + vcoreOffset + loadPct * 0.08);
      const voltageFactor = Math.pow(vcore / 1.2, 2);
      const idleFactor = 0.14 + 0.86 * Math.pow(loadPct, 1.15);
      const packagePowerW = Math.round(baseTdp * idleFactor * voltageFactor);

      // Corrente estimada no Vcore (I = P / V)
      const vcoreCurrentA = Math.round(packagePowerW / vcore);
      // Corrente aproximada no barramento 12V EPS (com eficiência ~88%)
      const eps12vCurrentA = (packagePowerW / (12 * 0.88)).toFixed(1);

      const vrmCap = { basic: 0.65, mid: 1.0, pro: 1.45 }[vrmTier];
      const coolingGain = 14 * airflowPct + (vrmTier === "pro" ? 9 : vrmTier === "mid" ? 4 : 0);
      const vrmHeat = (packagePowerW / (95 * vrmCap)) * 56 - coolingGain;
      const vrmTempC = Math.max(ambientC + 4, Math.round(ambientC + Math.max(4, vrmHeat)));

      const vrmLimitC = vrmTier === "basic" ? 95 : vrmTier === "mid" ? 105 : 112;
      const vrmThrottling = vrmTempC >= vrmLimitC;

      const cpuTempC = Math.max(
        ambientC + 6,
        Math.round(ambientC + 12 + (packagePowerW / Math.max(65, baseTdp)) * 42 - airflowPct * 10)
      );
      const cpuThrottling = cpuTempC >= 95;

      const baseClockGhz = baseTdp === 65 ? 4.6 : baseTdp === 105 ? 5.1 : 5.5;
      const targetClockGhz = baseClockGhz * (0.78 + 0.22 * loadPct + vcoreOffset * 0.5);
      let effectiveClockGhz = targetClockGhz;

      if (vrmThrottling || cpuThrottling) {
        const excess = Math.max(
          vrmThrottling ? (vrmTempC - vrmLimitC) * 0.035 : 0,
          cpuThrottling ? (cpuTempC - 95) * 0.04 : 0
        );
        effectiveClockGhz = Math.max(2.4, targetClockGhz * (1 - Math.min(0.45, excess + 0.12)));
      }

      const isThrottling = vrmThrottling || cpuThrottling;
      const gpuBus = slotsMode === "shared" ? "PCIe 4.0 x8 (Compartilhado)" : "PCIe 4.0 x16 (Dedicado)";
      const m2Bus = slotsMode === "shared" ? "M.2_1 CPU + M.2_2/3 PCH" : "M.2_1 CPU Gen4 x4";
      const ioState = slotsMode === "shared" ? "SATA 5/6 podem desativar" : "Todos os barramentos livres";

      telemetryEl.innerHTML = `
        <div class="telemetry-card">
          <span class="telemetry-label">Corrente Vcore / EPS 12V</span>
          <span class="telemetry-value ${vcoreCurrentA > 150 ? "is-warn" : ""}">${vcoreCurrentA} A / ${eps12vCurrentA} A</span>
          <span class="telemetry-sub">Vcore ~${vcore.toFixed(2)}V · ${packagePowerW}W</span>
        </div>
        <div class="telemetry-card">
          <span class="telemetry-label">Temperatura VRM / CPU</span>
          <span class="telemetry-value ${isThrottling ? "is-warn" : ""}">${vrmTempC}°C / ${cpuTempC}°C</span>
          <span class="telemetry-sub">Limite VRM: ${vrmLimitC}°C</span>
        </div>
        <div class="telemetry-card">
          <span class="telemetry-label">Clock Efetivo CPU</span>
          <span class="telemetry-value ${isThrottling ? "is-warn" : ""}">${effectiveClockGhz.toFixed(2)} GHz</span>
          <span class="telemetry-sub">${isThrottling ? "THROTTLING ATIVO" : "Estável sem queda"}</span>
        </div>
        <div class="telemetry-card">
          <span class="telemetry-label">PCIe GPU &amp; I/O</span>
          <span class="telemetry-value ${slotsMode === "shared" ? "is-warn" : ""}">${slotsMode === "shared" ? "x8 / Compartilhado" : "x16 Nativo"}</span>
          <span class="telemetry-sub">${ioState}</span>
        </div>
      `;

      svgVrmTxt.textContent = `VRM: ${vrmTempC}°C`;
      svgCpuClk.textContent = `${effectiveClockGhz.toFixed(2)} GHz`;
      svgCpuTmp.textContent = `${cpuTempC}°C`;
      svgPcieTxt.textContent = `GPU: ${gpuBus}`;
      svgM2Txt.textContent = m2Bus;
      svgPchTxt.textContent = slotsMode === "shared" ? "CARGA I/O ALTA" : "I/O NORMAL";

      svgVrm.style.stroke = vrmThrottling ? "var(--accent-red)" : "currentColor";
      svgCpu.style.stroke = isThrottling ? "var(--accent-red)" : "currentColor";
      svgPcie.style.stroke = slotsMode === "shared" ? "var(--accent-red)" : "currentColor";

      let diagText = "Sistema operando dentro das margens térmicas e elétricas.";
      if (vrmThrottling) {
        diagText = `Alerta VRM (${vrmTempC}°C >= ${vrmLimitC}°C): corrente de ${vcoreCurrentA}A aqueceu os estágios de potência e reduziu o clock para ${effectiveClockGhz.toFixed(2)} GHz. Melhore o airflow ou use VRM superior.`;
      } else if (cpuThrottling) {
        diagText = `Alerta térmico na CPU (${cpuTempC}°C): clock reduzido para ${effectiveClockGhz.toFixed(2)} GHz para proteger o silício.`;
      } else if (slotsMode === "shared") {
        diagText = `Atenção de barramento: com múltiplas unidades M.2/expansão, confira se a GPU cai de x16 para x8 e se portas SATA são desativadas.`;
      }

      diagLogEl.innerHTML = `<strong>Diagnóstico em tempo real:</strong> ${diagText}`;
    }

    [cpuEl, vrmEl, loadEl, airEl, vcoreEl, slotsEl].forEach((ctrl) => {
      ctrl.addEventListener("input", compute);
      ctrl.addEventListener("change", compute);
    });

    btnPrime?.addEventListener("click", () => {
      cpuEl.value = "170";
      loadEl.value = "100";
      vcoreEl.value = "0.08";
      compute();
    });

    btnEco?.addEventListener("click", () => {
      cpuEl.value = "105";
      loadEl.value = "65";
      vcoreEl.value = "-0.04";
      airEl.value = "70";
      compute();
    });

    btnReset?.addEventListener("click", () => {
      cpuEl.value = "105";
      vrmEl.value = "mid";
      loadEl.value = "85";
      airEl.value = "50";
      vcoreEl.value = "0";
      slotsEl.value = "clean";
      compute();
    });

    compute();
  }

})();
