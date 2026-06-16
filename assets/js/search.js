// ===== price-compare – search.js =====

document.addEventListener("DOMContentLoaded", () => {
  const queryInput  = document.getElementById("queryInput");
  const searchBtn   = document.getElementById("searchBtn");
  const clearBtn    = document.getElementById("clearBtn");
  const resultsBody = document.getElementById("resultsBody");
  const resultsCount = document.getElementById("resultsCount");
  const emptyHint   = document.getElementById("emptyHint");

  // Vsechny znamy shopy a jejich URL sablony
  const SHOPS = {
    alza:    (q) => `https://www.alza.cz/search.htm?exps=${q}`,
    datart:  (q) => `https://www.datart.cz/vyhledavani.html?query=${q}`,
    czc:     (q) => `https://www.czc.cz/search.html?q=${q}`,
    bazos:   (q) => `https://www.bazos.cz/search.php?hledat=${q}&hlokalita=&humkreis=`,
    heureka: (q) => `https://www.heureka.cz/?h%5Bfraze%5D=${q}`,
    mall:    (q) => `https://www.mall.cz/search?q=${q}`,
  };

  let rows = [];
  let sortCol  = null;
  let sortDir  = "asc";

  // ---- Helpers ----

  function encQ(str) {
    return encodeURIComponent(str.trim());
  }

  function getSelectedShops() {
    return Array.from(
      document.querySelectorAll(".shops input[type=checkbox]:checked")
    ).map((cb) => cb.value);
  }

  function openTabs(shops, query) {
    const q = encQ(query);
    shops.forEach((shop) => {
      const fn = SHOPS[shop];
      if (fn) window.open(fn(q), "_blank", "noopener");
    });
  }

  function shopBadge(shop) {
    return `<span class="badge badge-${shop}">${shop.toUpperCase()}</span>`;
  }

  function renderRows() {
    resultsBody.innerHTML = "";

    let data = [...rows];

    if (sortCol) {
      data.sort((a, b) => {
        let av = a[sortCol] ?? "";
        let bv = b[sortCol] ?? "";

        // Cena – zkus parsovat cislo
        if (sortCol === "price") {
          av = parseFloat(av.replace(/[^0-9,.]/g, "").replace(",", ".")) || 0;
          bv = parseFloat(bv.replace(/[^0-9,.]/g, "").replace(",", ".")) || 0;
          return sortDir === "asc" ? av - bv : bv - av;
        }

        return sortDir === "asc"
          ? String(av).localeCompare(String(bv), "cs")
          : String(bv).localeCompare(String(av), "cs");
      });
    }

    if (data.length === 0) {
      emptyHint.style.display = "block";
      resultsCount.textContent = "Zadne vysledky";
      return;
    }

    emptyHint.style.display = "none";
    resultsCount.textContent = `${data.length} polozek`;

    data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${shopBadge(row.shop)}</td>
        <td>${escHTML(row.name)}</td>
        <td>${escHTML(row.price)}</td>
        <td><a href="${escHTML(row.url)}" target="_blank" rel="noopener noreferrer">Otevrit &rarr;</a></td>
      `;
      resultsBody.appendChild(tr);
    });
  }

  function escHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function addDemoRows(query, shops) {
    // Demo radky – az budes mit backend, nahrad je realem
    shops.forEach((shop) => {
      const fn = SHOPS[shop];
      rows.push({
        shop,
        name: `${query} (otevre vyhledavani)`,
        price: "viz odkaz",
        url: fn ? fn(encQ(query)) : "#",
      });
    });
  }

  // ---- Events ----

  searchBtn.addEventListener("click", () => {
    const query = queryInput.value.trim();
    if (!query) return;

    const shops = getSelectedShops();
    if (!shops.length) { alert("Vyber alespon jeden shop."); return; }

    // Otevri taby
    openTabs(shops, query);

    // Pridej demo radky do tabulky
    addDemoRows(query, shops);
    renderRows();
  });

  queryInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchBtn.click();
  });

  clearBtn.addEventListener("click", () => {
    rows = [];
    renderRows();
    queryInput.value = "";
  });

  // Sorting po kliknuti na header
  document.querySelectorAll("th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const col = th.dataset.sort;
      if (sortCol === col) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
      } else {
        sortCol = col;
        sortDir = "asc";
      }

      document.querySelectorAll("th[data-sort]").forEach((h) => {
        h.classList.remove("sort-asc", "sort-desc");
      });
      th.classList.add(sortDir === "asc" ? "sort-asc" : "sort-desc");

      renderRows();
    });
  });

  // Init
  renderRows();
});
