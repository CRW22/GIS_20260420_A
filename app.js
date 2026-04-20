const STATION_CENTER = [25.13242, 121.7394];
const QUERY_RADIUS_METERS = 100;
const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const HISTORY_TILE_URL_TEMPLATE =
  "https://gis.sinica.edu.tw/tileserver/file-exists.php?img={layerId}-jpg-{z}-{x}-{y}";
const TILE_REFERRER_POLICY = "strict-origin-when-cross-origin";
const HISTORY_LAYERS = [
  {
    id: "JM20K_1904",
    title: "1904-日治臺灣堡圖(明治版)-1:20,000",
  },
  {
    id: "JM20K_1921",
    title: "1921-日治臺灣堡圖(大正版)-1:20,000",
  },
  {
    id: "JM25K_1942",
    title: "1942-日治二萬五千分之一地形圖(昭和修正版)",
  },
  {
    id: "AMCityPlan_1945",
    title: "1945-美軍繪製臺灣城市地圖",
  },
  {
    id: "TM25K_1989",
    title: "1989-臺灣經建1版地形圖-1:25,000",
  },
  {
    id: "TM25K_1950",
    title: "1950-臺灣地形圖-1:25,000",
  },
  {
    id: "TM25K_1993",
    title: "1993-臺灣經建2版地形圖-1:25,000",
  },
  {
    id: "TM25K_2001",
    title: "2001-臺灣經建3版地形圖-1:25,000",
  },
  {
    id: "TM25K_2003",
    title: "2003-臺灣經建4版地形圖-1:25,000",
  },
];

const map = L.map("map", {
  zoomControl: false,
  minZoom: 13,
}).setView(STATION_CENTER, 16);

L.control.zoom({ position: "bottomright" }).addTo(map);

map.createPane("historyPane");
map.getPane("historyPane").style.zIndex = "280";

const baseLayer = L.tileLayer(OSM_TILE_URL, {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
  referrerPolicy: TILE_REFERRER_POLICY,
});

baseLayer.addTo(map);

const siteLayer = L.layerGroup().addTo(map);
const queryCircle = L.circle(STATION_CENTER, {
  radius: QUERY_RADIUS_METERS,
  color: "#b56d3a",
  weight: 1.5,
  fillColor: "#d98c52",
  fillOpacity: 0.14,
  dashArray: "6 6",
}).addTo(map);

const queryMarker = L.marker(STATION_CENTER, {
  draggable: true,
  title: "查詢圖釘",
  zIndexOffset: 1200,
}).addTo(map);

const historyToggle = document.getElementById("history-toggle");
const historySelect = document.getElementById("history-select");
const historyOpacity = document.getElementById("history-opacity");
const historyStatus = document.getElementById("history-status");
const hitCount = document.getElementById("hit-count");
const querySummary = document.getElementById("query-summary");
const resultList = document.getElementById("result-list");
const resetViewButton = document.getElementById("reset-view");

let historyErrorShown = false;
let selectedHistoryLayerId = HISTORY_LAYERS[0].id;
let historyLayer = null;
let siteRecords = [];

function getHistoryLayerConfig(layerId) {
  return HISTORY_LAYERS.find((layer) => layer.id === layerId) ?? HISTORY_LAYERS[0];
}

function getHistoryTileUrl(layerId) {
  return HISTORY_TILE_URL_TEMPLATE.replace("{layerId}", layerId);
}

function populateHistorySelect() {
  const options = HISTORY_LAYERS.map((layer) => {
    const option = document.createElement("option");
    option.value = layer.id;
    option.textContent = layer.title;
    return option;
  });

  historySelect.replaceChildren(...options);
  historySelect.value = selectedHistoryLayerId;
}

function updateHistoryStatus(text, isWarn = false) {
  historyStatus.textContent = text;
  historyStatus.classList.toggle("warn", isWarn);
}

function updateSelectedLayerLabel() {
  const selectedLayer = getHistoryLayerConfig(selectedHistoryLayerId);
  updateHistoryStatus(`${selectedLayer.id} 已選取`);
}

function createHistoryLayer(layerId) {
  const tileLayer = L.tileLayer(getHistoryTileUrl(layerId), {
    pane: "historyPane",
    maxZoom: 19,
    opacity: Number(historyOpacity.value),
    attribution:
      '歷史圖層：<a href="https://gis.sinica.edu.tw/tileserver/" target="_blank" rel="noreferrer">中央研究院臺灣百年歷史地圖圖磚服務</a>',
    referrerPolicy: TILE_REFERRER_POLICY,
  });

  tileLayer.on("loading", () => {
    if (!historyToggle.checked) {
      return;
    }

    updateHistoryStatus(`${layerId} 載入中`);
  });

  tileLayer.on("load", () => {
    historyErrorShown = false;
    updateHistoryStatus(`${layerId} 正常`);
    refreshOverlayStack();
  });

  tileLayer.on("tileerror", () => {
    if (historyErrorShown || layerId !== selectedHistoryLayerId) {
      return;
    }

    historyErrorShown = true;
    updateHistoryStatus(`${layerId} 暫時不可用`, true);
    querySummary.textContent =
      "這個歷史圖層目前暫時無法載入，已退回 OSM 現代底圖與本地歷史景點查詢。";

    if (historyLayer && map.hasLayer(historyLayer)) {
      map.removeLayer(historyLayer);
    }

    historyToggle.checked = false;
  });

  return tileLayer;
}

function setHistoryLayer(layerId) {
  selectedHistoryLayerId = layerId;
  historyErrorShown = false;

  if (historyLayer && map.hasLayer(historyLayer)) {
    map.removeLayer(historyLayer);
  }

  historyLayer = createHistoryLayer(layerId);

  if (historyToggle.checked) {
    updateHistoryStatus(`${layerId} 載入中`);
    historyLayer.addTo(map);
    refreshOverlayStack();
    return;
  }

  updateSelectedLayerLabel();
}

function refreshOverlayStack() {
  queryCircle.bringToFront();
  siteLayer.eachLayer((layer) => {
    if (typeof layer.bringToFront === "function") {
      layer.bringToFront();
    }
  });
}

historyToggle.addEventListener("change", (event) => {
  if (event.target.checked) {
    historyErrorShown = false;
    updateHistoryStatus(`${selectedHistoryLayerId} 載入中`);
    historyLayer.addTo(map);
    historyLayer.redraw();
    refreshOverlayStack();
    return;
  }

  map.removeLayer(historyLayer);
  updateHistoryStatus("歷史圖層已關閉");
});

historySelect.addEventListener("change", (event) => {
  setHistoryLayer(event.target.value);
});

historyOpacity.addEventListener("input", (event) => {
  historyLayer.setOpacity(Number(event.target.value));
});

resetViewButton.addEventListener("click", () => {
  setQueryLocation(L.latLng(...STATION_CENTER));
  map.flyTo(STATION_CENTER, 16, { duration: 0.7 });
});

queryMarker.on("dragend", () => {
  setQueryLocation(queryMarker.getLatLng());
});

map.on("click", (event) => {
  setQueryLocation(event.latlng);
});

async function loadSites() {
  const response = await fetch("./data/processed/keelung_history_sites.geojson");
  if (!response.ok) {
    throw new Error(`GeoJSON 載入失敗：${response.status}`);
  }

  const geojson = await response.json();
  siteRecords = geojson.features.map((feature) => {
    const marker = L.circleMarker([feature.properties.lat, feature.properties.lng], {
      radius: 7,
      color: "#234b46",
      weight: 1,
      fillColor: "#6d8f96",
      fillOpacity: 0.92,
    });

    marker.bindPopup(renderPopup(feature.properties), {
      maxWidth: 320,
    });

    marker.addTo(siteLayer);

    return {
      feature,
      marker,
    };
  });

  setQueryLocation(L.latLng(...STATION_CENTER));
  refreshOverlayStack();
}

function renderPopup(properties) {
  return `
    <article class="popup">
      <h3>${properties.name}</h3>
      <p><strong>${properties.category}</strong> · ${properties.era}</p>
      <p>${properties.summary_zh}</p>
      <p><strong>地址：</strong>${properties.address}</p>
      <p><a href="${properties.source_url}" target="_blank" rel="noreferrer">${properties.source_title}</a></p>
    </article>
  `;
}

function setQueryLocation(latlng) {
  queryMarker.setLatLng(latlng);
  queryCircle.setLatLng(latlng);
  refreshHits(latlng);
}

function refreshHits(latlng) {
  const hits = siteRecords
    .map((record) => {
      const { properties } = record.feature;
      const siteLatLng = L.latLng(properties.lat, properties.lng);
      const distance = map.distance(latlng, siteLatLng);

      const isHit = distance <= QUERY_RADIUS_METERS;
      record.marker.setStyle({
        color: isHit ? "#9b4d20" : "#234b46",
        fillColor: isHit ? "#d47e45" : "#6d8f96",
        radius: isHit ? 8 : 7,
      });

      return {
        ...record,
        distance,
        isHit,
      };
    })
    .filter((record) => record.isHit)
    .sort((left, right) => left.distance - right.distance);

  hitCount.textContent = `${hits.length} 筆`;
  querySummary.textContent = `查詢中心：${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(
    5,
  )} · 半徑 ${QUERY_RADIUS_METERS} 公尺`;

  if (!hits.length) {
    resultList.innerHTML = `
      <article class="empty-card">
        <strong>這 100 公尺內沒有收錄中的歷史景點</strong>
        <p class="muted">請沿著車站、港口、廟口或山城方向移動圖釘，再試一次。</p>
      </article>
    `;
    return;
  }

  resultList.innerHTML = "";

  hits.forEach((hit, index) => {
    const card = document.createElement("article");
    card.className = "result-card";
    card.innerHTML = `
      <button type="button" data-id="${hit.feature.properties.id}">
        <h3>${index + 1}. ${hit.feature.properties.name}</h3>
        <div class="meta">
          <span class="chip">${Math.round(hit.distance)} 公尺</span>
          <span class="chip">${hit.feature.properties.category}</span>
          <span class="chip">${hit.feature.properties.era}</span>
        </div>
        <p class="summary">${hit.feature.properties.summary_zh}</p>
        <div class="source-link">
          <a href="${hit.feature.properties.source_url}" target="_blank" rel="noreferrer">
            ${hit.feature.properties.source_title}
          </a>
        </div>
      </button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      hit.marker.openPopup();
      map.flyTo([hit.feature.properties.lat, hit.feature.properties.lng], 17, {
        duration: 0.7,
      });
    });

    resultList.appendChild(card);
  });
}

populateHistorySelect();
setHistoryLayer(selectedHistoryLayerId);

loadSites().catch((error) => {
  hitCount.textContent = "讀取失敗";
  querySummary.textContent = "無法讀取本地景點資料。";
  resultList.innerHTML = `
    <article class="empty-card">
      <strong>資料載入失敗</strong>
      <p class="muted">${error.message}</p>
    </article>
  `;
});
