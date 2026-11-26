(() => {
  // Fallback inline para execução direta via protocolo file:// sem servidor HTTP
  const FALLBACK_TOPICS = [
    {
      id: "01",
      titulo: "Anatomia da Placa-Mãe e Chipsets",
      resumo: "Entenda sockets, VRMs, linhas PCIe e como identificar se uma placa suporta upgrades futuros sem gargalos elétricos.",
      categoria: "Hardware Base",
      status: "Publicada",
      slug: "exemplo-topico",
      tags: ["Placa-Mãe", "VRM", "PCIe", "Socket"]
    },
    {
      id: "02",
      titulo: "Fontes de Alimentação (PSU): Eficiência e Trilhos",
      resumo: "Como dimensionar potência real, interpretar certificações 80 Plus, ATX 3.0 e evitar fontes bomba.",
      categoria: "Energia & Refrigeração",
      status: "Publicada",
      slug: "fontes-alimentacao",
      tags: ["PSU", "80 Plus", "ATX 3.0", "Energia"]
    },
    {
      id: "03",
      titulo: "Memória RAM: Frequência, Latência (CL) e Dual Channel",
      resumo: "A matemática prática entre MHz e nanosegundos reais, ativação de perfis XMP/EXPO e topologia de slots.",
      categoria: "Hardware Base",
      status: "Publicada",
      slug: "memoria-ram",
      tags: ["DDR4", "DDR5", "XMP", "Latência"]
    },
    {
      id: "04",
      titulo: "Armazenamento NVMe, SATA e Controladoras DRAM",
      resumo: "Diferenças reais entre gerações PCIe Gen3/4/5, cache DRAM vs HMB e impacto direto em tempos de carregamento.",
      categoria: "Armazenamento",
      status: "Em breve",
      slug: "armazenamento-nvme",
      tags: ["SSD", "NVMe", "DRAM", "PCIe"]
    },
    {
      id: "05",
      titulo: "Consoles por Dentro: Arquitetura Unificada e Modos Gráficos",
      resumo: "Como funcionam APUs customizadas, memória GDDR6 compartilhada, VRR, HDMI 2.1 e modos Fidelidade vs Desempenho.",
      categoria: "Consoles & Display",
      status: "Em breve",
      slug: "arquitetura-consoles",
      tags: ["Consoles", "HDMI 2.1", "VRR", "APU"]
    },
    {
      id: "06",
      titulo: "Configuração de BIOS/UEFI e Primeiro Boot",
      resumo: "Checklist técnico pós-montagem: ordem de boot, Resizable BAR, curvas de fan e diagnóstico por LEDs/beeps.",
      categoria: "Diagnóstico & Setup",
      status: "Em breve",
      slug: "configuracao-bios",
      tags: ["BIOS", "UEFI", "ReBAR", "Boot"]
    }
  ];

  const state = {
    topics: [],
    search: "",
    category: "Todas",
    status: "Todas"
  };

  // Controle de Tema Compartilhado
  function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("ggr-theme", next);
    });
  }

  // Carregamento do JSON com fallback para file://
  async function loadTopics() {
    try {
      const response = await fetch("./assets/data/topics.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.topics = await response.json();
    } catch {
      state.topics = FALLBACK_TOPICS;
    }
  }

  function normalizeText(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function renderCategoryChips() {
    const container = document.getElementById("category-filters");
    if (!container) return;

    const categories = ["Todas", ...new Set(state.topics.map((t) => t.categoria))];
    container.innerHTML = categories
      .map(
        (cat) => `
        <button 
          type="button" 
          class="filter-chip ${state.category === cat ? "is-active" : ""}" 
          data-category="${cat}">
          ${cat}
        </button>`
      )
      .join("");
  }

  function getFilteredTopics() {
    const query = normalizeText(state.search.trim());

    return state.topics.filter((topic) => {
      const matchesCategory =
        state.category === "Todas" || topic.categoria === state.category;
      const matchesStatus =
        state.status === "Todas" || topic.status === state.status;

      if (!matchesCategory || !matchesStatus) return false;
      if (!query) return true;

      const searchable = normalizeText(
        [topic.titulo, topic.resumo, topic.categoria, ...(topic.tags || [])].join(" ")
      );
      return searchable.includes(query);
    });
  }

  function renderCatalog() {
    const container = document.getElementById("catalog-container");
    const statsEl = document.getElementById("catalog-stats");
    if (!container) return;

    const filtered = getFilteredTopics();
    const publishedCount = state.topics.filter((t) => t.status === "Publicada").length;

    if (statsEl) {
      statsEl.textContent = `${String(publishedCount).padStart(2, "0")}/${String(state.topics.length).padStart(2, "0")} PUBLICADOS`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          Nenhum tópico encontrado para os filtros aplicados.
        </div>`;
      return;
    }

    container.innerHTML = filtered
      .map((topic) => {
        const isPublished = topic.status === "Publicada";
        const tagsHtml = (topic.tags || [])
          .map((tag) => `<span class="tag">#${tag}</span>`)
          .join("");

        const innerContent = `
          <span class="topic-number">${topic.id}</span>
          <div class="topic-body">
            <div class="topic-meta-top">
              <span>${topic.categoria}</span>
            </div>
            <h2 class="topic-title">${topic.titulo}</h2>
            <p class="topic-summary">${topic.resumo}</p>
            <div class="topic-tags">${tagsHtml}</div>
          </div>
          <div class="topic-action">
            ${
              isPublished
                ? `<span class="badge-published">Acessar →</span>`
                : `<span class="badge-upcoming">Em breve</span>`
            }
          </div>
        `;

        if (isPublished) {
          return `<a href="./topics/${topic.slug}/index.html" class="topic-item">${innerContent}</a>`;
        }

        return `<article class="topic-item is-upcoming" aria-disabled="true">${innerContent}</article>`;
      })
      .join("");
  }

  function bindEvents() {
    const searchInput = document.getElementById("search-input");
    const clearBtn = document.getElementById("clear-search");
    const categoryContainer = document.getElementById("category-filters");
    const statusContainer = document.getElementById("status-filters");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.search = e.target.value;
        if (clearBtn) clearBtn.hidden = state.search.length === 0;
        renderCatalog();
      });
    }

    if (clearBtn && searchInput) {
      clearBtn.addEventListener("click", () => {
        state.search = "";
        searchInput.value = "";
        clearBtn.hidden = true;
        searchInput.focus();
        renderCatalog();
      });
    }

    if (categoryContainer) {
      categoryContainer.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-category]");
        if (!btn) return;
        state.category = btn.dataset.category;
        renderCategoryChips();
        renderCatalog();
      });
    }

    if (statusContainer) {
      statusContainer.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-status]");
        if (!btn) return;
        state.status = btn.dataset.status;

        statusContainer.querySelectorAll(".filter-chip").forEach((chip) => {
          chip.classList.toggle("is-active", chip === btn);
        });
        renderCatalog();
      });
    }
  }

  async function init() {
    initThemeToggle();
    await loadTopics();
    renderCategoryChips();
    renderCatalog();
    bindEvents();
  }

  document.addEventListener("DOMContentLoaded", init);
})();