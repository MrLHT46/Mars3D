<template>
  <div class="mars3d-wrapper">
    <div id="mars3dContainer" class="map-container"></div>

    <TopToolbar
      :is-fullscreen="isFullscreen"
      :search-query="searchQuery"
      @update:search-query="searchQuery = $event"
      @take-screenshot="takeScreenshot"
      @toggle-fullscreen="toggleFullscreen"
      @reset-camera="resetCamera"
      @search-location="searchLocation"
    />

    <ControlPanel
      :collapsed="isPanelCollapsed"
      @update:collapsed="isPanelCollapsed = $event"
      :hidden="isPanelHidden"
      @update:hidden="isPanelHidden = $event"
      :selected-basemap="selectedBasemap"
      @update:selected-basemap="selectedBasemap = $event"
      :selected-model-type="selectedModelType"
      @update:selected-model-type="selectedModelType = $event"
      :show-markers="showMarkers"
      :show-polylines="showPolylines"
      :show-3d-models="show3DModels"
      :show-terrain="showTerrain"
      @update:show-terrain="showTerrain = $event"
      :show-labels="showLabels"
      @update:show-labels="showLabels = $event"
      :show-grid="showGrid"
      @update:show-grid="showGrid = $event"
      :vietnam-opacity="vietnamOpacity"
      @update:vietnam-opacity="vietnamOpacity = $event"
      :map-ready="isMapReady"
      :is-animating="isAnimating"
      @change-basemap="changeBasemap"
      @measure-distance="measureDistance"
      @measure-area="measureArea"
      @measure-height="measureHeight"
      @clear-measurements="clearMeasurements"
      @draw-polygon="drawPolygon"
      @draw-circle="drawCircle"
      @draw-rectangle="drawRectangle"
      @add-marker="addMarker"
      @delete-marker="startDeleteMarker"
      @toggle-markers="toggleMarkers"
      @draw-polyline="drawPolyline"
      @toggle-polylines="togglePolylines"
      @add-3d-model="add3DModel"
      @toggle-3d-models="toggle3DModels"
      @start-camera-animation="startCameraAnimation"
      @rotate-camera="rotateCamera"
      @toggle-terrain="toggleTerrain"
      @toggle-labels="toggleLabels"
      @toggle-grid="toggleGrid"
      @update-vietnam-opacity="updateVietnamOpacity"
      @clear-all="clearAll"
      @export-data="exportData"
    />

    <button v-if="isPanelHidden" @click="isPanelHidden = false" class="show-panel-btn" title="Hiện panel điều khiển">
      🎮
    </button>

    <div class="info-panel" v-if="currentInfo">
      <button @click="currentInfo = null" class="close-info">✕</button>
      <div v-html="currentInfo"></div>
    </div>

    <StatsDisplay
      :marker-count="markerCount"
      :polyline-count="polylineCount"
      :model-count="modelCount"
      :polygon-count="polygonCount"
    />

    <!-- Label-hover media overlay (no tooltip) -->
    <Teleport to="body">
      <div
        v-if="labelMediaVisible"
        class="label-media-overlay"
        :style="{ left: labelMediaPosition.x + 'px', top: labelMediaPosition.y + 'px' }"
        @mouseenter="() => { clearTimeout(labelMediaHideTimer); }"
        @mouseleave="() => scheduleHideLabelMediaOverlay(200)"
      >
        <MediaGallery
          v-if="labelMedia.length > 0"
          :media="labelMedia"
          :autoPlay="true"
          :autoPlayInterval="3000"
        />
        <div v-else class="label-media-empty">(Không có media)</div>
      </div>
    </Teleport>

    <MarkerModal
      :is-open="isModalOpen"
      :marker-data="modalMarkerData"
      :title="currentEditingMarker ? '✏️ Chỉnh sửa Marker' : '➕ Thêm Marker Mới'"
      @close="closeModal"
      @save="saveMarkerFromModal"
    />

    <AddressTooltip
      :is-visible="tooltipVisible"
      :landmark="tooltipLandmark"
      :position="tooltipPosition"
      :is-mobile="isMobileBrowser"
      @mouseenter="handleTooltipEnter"
      @mouseleave="handleTooltipLeave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import * as mars3d from "mars3d";
import TopToolbar from "./TopToolbar.vue";
import ControlPanel from "./ControlPanel.vue";
import StatsDisplay from "./StatsDisplay.vue";
import MarkerModal from "./MarkerModal.vue";
import AddressTooltip from "./AddressTooltip.vue";
import MediaGallery from "./MediaGallery.vue";
import landmarksDataset from "../data/landmarks.json";
import "./Mars3DMap.css";

const BACKEND_URL = 'http://localhost:5000/api/landmarks';

let map;
const markerLayer = ref(null);
const polylineLayer = ref(null);
const modelLayer = ref(null);
const polygonLayer = ref(null);
const measureLayer = ref(null);
const vietnamLayer = ref(null);

let gridImageryLayer = null;

// State
const showMarkers = ref(true);
const showPolylines = ref(true);
const show3DModels = ref(true);
const showTerrain = ref(false);
const showLabels = ref(true);
const showGrid = ref(false);
const vietnamOpacity = ref(0.3);
const isPanelCollapsed = ref(false);
const isPanelHidden = ref(false);
const isFullscreen = ref(false);
const isAnimating = ref(false);
const searchQuery = ref('');
const currentInfo = ref(null);
const selectedBasemap = ref('google_satellite');
const selectedModelType = ref('box');
const isMapReady = ref(false);
let pendingAddMarker = false;

// Modal state
const isModalOpen = ref(false);
const modalMarkerData = ref({ 
  id: null,
  name: '', 
  city: '', 
  description: '', 
  lat: 0, 
  lng: 0,
  houseNumberOrOfficeName: '',
  ward: '',
  district: '',
  province: '',
  country: 'Vietnam'
});
let currentEditingMarker = null;

// Tooltip state
const tooltipVisible = ref(false);
const tooltipPosition = ref({ x: 0, y: 0 });
const tooltipLandmark = ref({});
let tooltipTimeout = null;
let currentHighlightedMarker = null;
const isTooltipHovered = ref(false);
const isMobileBrowser = ref(/iPhone|iPad|Android|webOS/i.test(navigator.userAgent));

// Label-hover media overlay (no tooltip)
const labelMediaVisible = ref(false);
const labelMediaPosition = ref({ x: 0, y: 0 });
const labelMedia = ref([]);
const labelMediaLandmarkId = ref(null);
let labelMediaHideTimer = null;
const mediaCache = new Map(); // landmarkId -> media[]

// Robust label picking
let labelPickHandler = null;
const entityToLandmarkId = new WeakMap();
const entityIdToLandmarkId = new Map();
let lastMouseMovePos = null;
let mouseMoveRaf = 0;
const textMeasureCanvas = document.createElement('canvas');
const textMeasureCtx = textMeasureCanvas.getContext('2d');

const markers = ref([]);
const polylines = ref([]);
const models = ref([]);
const polygons = ref([]);

// Backend marker count (canonical when backend load succeeds)
// null => not using backend (fallback to local dataset)
const backendMarkerCount = ref(null);

// Measurement state
let measureTool = null;
let animationInterval = null;
let currentModelType = 'box'; // Loại model mặc định

// Danh sách các địa điểm nổi tiếng ở Việt Nam
const landmarks = landmarksDataset;

function getLayerGraphicCount(layer, fallback = 0) {
  if (!layer) return fallback;
  if (Array.isArray(layer.graphics)) return layer.graphics.length;
  if (Array.isArray(layer._graphics)) return layer._graphics.length;
  if (typeof layer.length === 'number') return layer.length;
  if (typeof layer.getGraphics === 'function') {
    try {
      const list = layer.getGraphics();
      if (Array.isArray(list)) return list.length;
    } catch (e) {
      // ignore
    }
  }
  return fallback;
}

// Computed properties
const markerCount = computed(() => {
  if (typeof backendMarkerCount.value === 'number') return backendMarkerCount.value;
  return getLayerGraphicCount(markerLayer.value, markers.value.length);
});

const polylineCount = computed(() => getLayerGraphicCount(polylineLayer.value, polylines.value.length));
const modelCount = computed(() => getLayerGraphicCount(modelLayer.value, models.value.length));
const polygonCount = computed(() => getLayerGraphicCount(polygonLayer.value, polygons.value.length));

watch(showMarkers, visible => {
  if (markerLayer.value) {
    markerLayer.value.show = visible;
  }
});

watch(showPolylines, visible => {
  if (polylineLayer.value) {
    polylineLayer.value.show = visible;
  }
});

watch(show3DModels, visible => {
  if (modelLayer.value) {
    modelLayer.value.show = visible;
  }
});

watch(showTerrain, visible => {
  if (map?.terrain) {
    map.terrain.show = visible;
  }
});

watch(vietnamOpacity, value => {
  updateVietnamOpacity(value);
});

watch(selectedModelType, value => {
  currentModelType = value;
});

onMounted(() => {
  initMap();
});

function initMap() {
  map = new mars3d.Map("mars3dContainer", {
    scene: {
      center: { lat: 21.028511, lng: 105.804817, alt: 3200, heading: 15, pitch: -42 },
      globe: {
        depthTestAgainstTerrain: true,
        enableLighting: true
      },
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
      fxaa: true
    },
    basemaps: [
      { id: "google_satellite", name: "Google Satellite", type: "google", layer: "img_d", show: true },
      { id: "osm", name: "OpenStreetMap", type: "osm", layer: "vec", show: false },
      { id: "arcgis_imagery", name: "ArcGIS Imagery", type: "arcgis", layer: "img_d", show: false },
      { id: "bing_maps", name: "Bing Maps", type: "bing", layer: "img_d", show: false },
      { id: "gaode", name: "Gaode Image", type: "gaode", layer: "img_d", show: false },
      { id: "gaode_vec", name: "Gaode Vector", type: "gaode", layer: "vec", show: false }
    ],
    terrain: {
      show: false
    }
  });

  enhanceScene();
  initLayers();
  initMeasurementTools();
  initLabelHoverMedia();
  scheduleStaticContent();
  loadMarkersFromBackend();
  // lắng nghe click map để đặt marker khi người dùng bấm nút "Thêm Marker"
  map.on('click', handleMapClickForMarker);
  isMapReady.value = true;
}

function initLabelHoverMedia() {
  try {
    if (isMobileBrowser.value) return;
    if (!map?.scene?.canvas) return;

    labelPickHandler?.destroy?.();
    labelPickHandler = new mars3d.Cesium.ScreenSpaceEventHandler(map.scene.canvas);

    labelPickHandler.setInputAction((movement) => {
      const pos = movement?.endPosition;
      if (!pos || !map?.scene) return;
      lastMouseMovePos = pos;

      if (mouseMoveRaf) return;
      mouseMoveRaf = window.requestAnimationFrame(() => {
        mouseMoveRaf = 0;
        handleLabelHoverAt(lastMouseMovePos);
      });
    }, mars3d.Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  } catch (e) {
    console.warn('initLabelHoverMedia failed', e);
  }
}

function handleLabelHoverAt(pos) {
  try {
    if (!pos || !map?.scene) return;

    const landmarkId = detectLabelHoverLandmarkId(pos);
    if (!landmarkId) {
      scheduleHideLabelMediaOverlay(120);
      return;
    }

    tooltipVisible.value = false;
    showLabelMediaOverlay(landmarkId, { x: pos.x, y: pos.y });

    if (labelMediaLandmarkId.value !== landmarkId) {
      labelMedia.value = [];
    }

    fetchLandmarkMedia(landmarkId)
      .then((list) => {
        if (labelMediaLandmarkId.value === landmarkId) {
          labelMedia.value = list;
        }
      })
      .catch(() => {
        if (labelMediaLandmarkId.value === landmarkId) {
          labelMedia.value = [];
        }
      });
  } catch (e) {
    // ignore
  }
}

function detectLabelHoverLandmarkId(pos) {
  // 1) Best-effort: drillPick to see if Cesium exposes a Label primitive
  try {
    const picks = typeof map?.scene?.drillPick === 'function' ? map.scene.drillPick(pos, 10) : [];
    if (Array.isArray(picks) && picks.length) {
      for (const picked of picks) {
        if (!isPickedLabel(picked)) continue;
        const id = getLandmarkIdFromPick(picked);
        if (id) return id;
      }
    }
  } catch (e) {
    // ignore
  }

  // 2) Deterministic fallback: manual screen-rect hit-test against marker labels
  return hitTestMarkerLabels(pos);
}

function hitTestMarkerLabels(pos) {
  if (!Array.isArray(markers.value) || markers.value.length === 0) return null;
  const scene = map?.scene;
  if (!scene) return null;

  for (let i = markers.value.length - 1; i >= 0; i -= 1) {
    const marker = markers.value[i];
    if (!marker?.show) continue;
    const landmarkId = marker?.attr?.id;
    if (!landmarkId) continue;

    const rect = getMarkerLabelScreenRect(marker);
    if (rect && isPointInRect(pos, rect)) {
      return landmarkId;
    }
  }

  return null;
}

function getMarkerLabelScreenRect(marker) {
  try {
    const lat = Number(marker?.attr?.lat);
    const lng = Number(marker?.attr?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    const label = marker?.style?.label;
    const text = label?.text ?? marker?.attr?.name;
    if (!text) return null;

    const fontSize = Number(label?.font_size || 14);
    const padding = Array.isArray(label?.padding) ? label.padding : [4, 8];
    const padY = Number(padding[0] ?? 4);
    const padX = Number(padding[1] ?? 8);
    const offsetY = Number(label?.pixelOffsetY ?? -40);

    // Project marker position to window coordinates
    const cart = mars3d.Cesium.Cartesian3.fromDegrees(lng, lat, 0);
    const win = mars3d.Cesium.SceneTransforms.wgs84ToWindowCoordinates(map.scene, cart);
    if (!win) return null;

    const textWidth = measureTextWidth(text, fontSize);
    const width = textWidth + padX * 2 + 12; // generous hit area
    const height = fontSize + padY * 2 + 10;

    const centerX = win.x;
    const centerY = win.y + offsetY;

    return {
      left: centerX - width / 2,
      right: centerX + width / 2,
      top: centerY - height / 2,
      bottom: centerY + height / 2
    };
  } catch (e) {
    return null;
  }
}

function measureTextWidth(text, fontSize) {
  try {
    if (!textMeasureCtx) return String(text).length * fontSize * 0.6;
    textMeasureCtx.font = `${fontSize}px sans-serif`;
    const metrics = textMeasureCtx.measureText(String(text));
    return metrics?.width ?? String(text).length * fontSize * 0.6;
  } catch (e) {
    return String(text).length * fontSize * 0.6;
  }
}

function isPointInRect(pos, rect) {
  const x = pos?.x;
  const y = pos?.y;
  if (x == null || y == null) return false;
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function initLayers() {
  markerLayer.value = new mars3d.layer.GraphicLayer({ name: "Điểm đánh dấu", show: showMarkers.value });
  polylineLayer.value = new mars3d.layer.GraphicLayer({ name: "Đường liên kết", show: showPolylines.value });
  modelLayer.value = new mars3d.layer.GraphicLayer({ name: "Mô hình 3D", show: show3DModels.value });
  polygonLayer.value = new mars3d.layer.GraphicLayer({ name: "Hình vẽ", show: true });
  measureLayer.value = new mars3d.layer.GraphicLayer({ name: "Đo đạc" });

  map.addLayer(markerLayer.value);
  map.addLayer(polylineLayer.value);
  map.addLayer(modelLayer.value);
  map.addLayer(polygonLayer.value);
  map.addLayer(measureLayer.value);

  vietnamLayer.value = new mars3d.layer.GeoJsonLayer({
    name: "Vietnam",
    url: "https://geojson-maps.ash.ms/vietnam.json",
    symbol: {
      styleOptions: {
        color: "#00FF75",
        opacity: vietnamOpacity.value,
        outline: true,
        outlineColor: "#1EFFA5",
        outlineWidth: 1.5
      }
    }
  });
  map.addLayer(vietnamLayer.value);

  if (map.terrain) {
    map.terrain.show = showTerrain.value;
  }
}

function scheduleStaticContent() {
  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 0));
  schedule(() => {
    // Không cần addDefaultMarkers nữa - đã load từ backend trong loadMarkersFromBackend()
    addSamplePolylines();
    addSample3DModels();
  });
}

// ============== API Functions ==============
async function loadMarkersFromBackend() {
  try {
    console.log('Loading markers from backend...');
    const response = await fetch(BACKEND_URL);
    if (!response.ok) throw new Error('Failed to fetch markers');
    
    const data = await response.json();
    backendMarkerCount.value = Array.isArray(data) ? data.length : 0;
    console.log('Loaded markers from backend:', data.length);
    
    // Xóa markers cũ
    markers.value.forEach(m => markerLayer.value.removeGraphic(m));
    markers.value = [];
    
    // Thêm markers từ backend
    data.forEach((landmark) => {
      const lat = Number(landmark?.lat);
      const lng = Number(landmark?.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        createMarkerGraphic({ ...landmark, lat, lng });
      } else {
        console.warn('Skipping landmark with invalid lat/lng:', landmark);
      }
    });
    
    showInfo(`✅ Đã tải ${data.length} địa điểm từ server`);
  } catch (err) {
    console.error('Error loading markers:', err);
    showInfo('⚠️ Không thể tải dữ liệu từ server - dùng dữ liệu mặc định');
    backendMarkerCount.value = null;
    // Fallback: load từ file JSON
    addDefaultMarkers();
  }
}

async function saveMarkerToBackend(markerData) {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(markerData)
    });
    
    if (!response.ok) throw new Error('Failed to save marker');
    const saved = await response.json();
    console.log('Marker saved to backend:', saved);
    return saved;
  } catch (err) {
    console.error('Error saving marker:', err);
    showInfo('❌ Lỗi lưu lên server: ' + err.message);
    throw err;
  }
}

async function uploadPendingMedia(landmarkId, pendingUploads = []) {
  if (!landmarkId || !pendingUploads || pendingUploads.length === 0) {
    return;
  }

  console.log('📤 uploadPendingMedia - Processing', pendingUploads.length, 'items for landmark', landmarkId);

  // Deduplicate files by creating a map with file name + size as key
  const seenFiles = new Map();
  const uniqueImages = [];
  let uniqueVideo = null;

  for (const item of pendingUploads) {
    console.log('  - Item:', { type: item.type, fileName: item.fileName, hasFile: !!item.file });
    
    if (!item.type || !item.file) {
      console.warn('  ⚠️ Skipping invalid item (missing type or file object)');
      continue;
    }

    const fileKey = `${item.file.name}:${item.file.size}`;
    if (seenFiles.has(fileKey)) {
      console.log(`  ↩️ Skipping duplicate file: ${item.file.name}`);
      continue;
    }

    seenFiles.set(fileKey, true);

    if (item.type === 'image') {
      uniqueImages.push(item);
      console.log(`  ✓ Image queued: ${item.file.name}`);
    } else if (item.type === 'video' && !uniqueVideo) {
      uniqueVideo = item;
      console.log(`  ✓ Video queued: ${item.file.name}`);
    }
  }

  console.log(`📋 Final: ${uniqueImages.length} images, ${uniqueVideo ? 1 : 0} video`);

  if (uniqueImages.length === 0 && !uniqueVideo) {
    console.log('ℹ️ No files to upload after deduplication');
    return;
  }

  const formData = new FormData();
  uniqueImages.forEach((item, idx) => {
    formData.append('images', item.file);
    console.log(`  + Image ${idx + 1}: ${item.file.name}`);
  });
  if (uniqueVideo) {
    formData.append('video', uniqueVideo.file);
    console.log(`  + Video: ${uniqueVideo.file.name}`);
  }

  try {
    console.log(`🚀 Sending upload request to /api/media/upload/${landmarkId}`);
    const response = await fetch(`/api/media/upload/${landmarkId}`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json().catch(() => ({ success: false }));
    console.log(`📥 Response status: ${response.status}`, result);
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Upload media thất bại');
    }

    const uploadedCount = (result.files?.length) ?? (uniqueImages.length + (uniqueVideo ? 1 : 0));
    showInfo(`📤 Đã tải lên ${uploadedCount} media cho địa điểm`);
  } catch (err) {
    console.error('❌ Error uploading pending media:', err);
    showInfo('⚠️ Tải media sau khi lưu thất bại: ' + err.message);
  }
}

async function deleteMarkerFromBackend(markerId) {
  try {
    const response = await fetch(`${BACKEND_URL}/${markerId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete marker');
    console.log('Marker deleted from backend:', markerId);
    return true;
  } catch (err) {
    console.error('Error deleting marker:', err);
    showInfo('❌ Lỗi xóa từ server: ' + err.message);
    throw err;
  }
}

// Initialize measurement tools
function initMeasurementTools() {
  measureTool = new mars3d.thing.Measure({
    label: {
      color: "#ffffff",
      font_family: "楷体",
      font_size: 20,
      background: true,
      backgroundColor: "#000000",
      backgroundOpacity: 0.7
    }
  });
  map.addThing(measureTool);
}

function enhanceScene() {
  const scene = map?.scene;
  if (!scene) {
    return;
  }

  scene.globe.enableLighting = true;
  scene.globe.showGroundAtmosphere = true;
  scene.globe.preloadSiblings = true;

  scene.shadowMap.enabled = true;
  scene.shadowMap.size = 2048;
  scene.shadowMap.darkness = 0.35;
  scene.shadows = true;

  scene.sun.show = true;
  scene.sunBloom = true;
  scene.moon.show = false;

  scene.fog.enabled = true;
  scene.fog.density = 0.00015;
  scene.fog.minimumBrightness = 0.05;

  if (scene.skyAtmosphere) {
    scene.skyAtmosphere.hueShift = 0.0;
    scene.skyAtmosphere.saturationShift = -0.08;
    scene.skyAtmosphere.brightnessShift = 0.15;
  }

  if (scene.postProcessStages?.bloom) {
    const bloom = scene.postProcessStages.bloom;
    bloom.enabled = true;
    bloom.uniforms.glowOnly = false;
    bloom.uniforms.contrast = 128;
    bloom.uniforms.brightness = -0.3;
    bloom.uniforms.delta = 0.9;
    bloom.uniforms.sigma = 3.5;
    bloom.uniforms.stepSize = 1.0;
  }

  if (map?.viewer) {
    map.viewer.targetFrameRate = 60;
    map.viewer.resolutionScale = Math.min(window.devicePixelRatio, 1.5);
    map.viewer.useBrowserRecommendedResolution = true;
  }
}

// Measurement functions
function measureDistance() {
  if (!measureTool) {
    return;
  }

  measureTool.distance({
    success: (e) => {
      showInfo(`Khoảng cách: ${e.distance.toFixed(2)} m (${(e.distance / 1000).toFixed(2)} km)`);
    }
  });
}

function measureArea() {
  if (!measureTool) {
    return;
  }

  measureTool.area({
    success: (e) => {
      showInfo(`Diện tích: ${e.area.toFixed(2)} m² (${(e.area / 1000000).toFixed(4)} km²)`);
    }
  });
}

function measureHeight() {
  if (!measureTool) {
    return;
  }

  measureTool.height({
    success: (e) => {
      showInfo(`Độ cao: ${e.height.toFixed(2)} m`);
    }
  });
}

function clearMeasurements() {
  if (measureTool) {
    measureTool.clear();
  }
  showInfo('Đã xóa tất cả đo đạc');
}

// Drawing functions
function drawPolygon() {
  polygonLayer.value?.startDraw({
    type: "polygon",
    style: {
      color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
      outline: true,
      outlineColor: "#ffffff",
      outlineWidth: 2,
      clampToGround: true
    },
    success: (graphic) => {
      graphic.attr = { type: "polygon", name: "Polygon" };
      polygons.value.push(graphic);
      
      const area = graphic.area;
      if (area) {
        showInfo(`Polygon đã tạo - Diện tích: ${area.toFixed(2)} m²`);
      }
    }
  });
}

function drawCircle() {
  polygonLayer.value?.startDraw({
    type: "circle",
    style: {
      color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
      outline: true,
      outlineColor: "#ffffff",
      outlineWidth: 2,
      clampToGround: true
    },
    success: (graphic) => {
      graphic.attr = { type: "polygon", name: "Circle" };
      polygons.value.push(graphic);
      showInfo('Circle đã tạo');
    }
  });
}

function drawRectangle() {
  polygonLayer.value?.startDraw({
    type: "rectangle",
    style: {
      color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
      outline: true,
      outlineColor: "#ffffff",
      outlineWidth: 2,
      clampToGround: true
    },
    success: (graphic) => {
      graphic.attr = { type: "polygon", name: "Rectangle" };
      polygons.value.push(graphic);
      showInfo('Rectangle đã tạo');
    }
  });
}

// Camera animations
function startCameraAnimation() {
  if (isAnimating.value) {
    stopCameraAnimation();
    return;
  }
  
  isAnimating.value = true;
  let index = 0;
  
  animationInterval = setInterval(() => {
    const landmark = landmarks[index];
    map.flyToPoint([landmark.lng, landmark.lat], {
      radius: 2000,
      duration: 3,
      pitch: -45
    });
    
  const detail = landmark.description ? `<br/>${landmark.description}` : "";
  showInfo(`🗺️ ${landmark.name} - ${landmark.city}${detail}`);
    
    index = (index + 1) % landmarks.length;
  }, 4000);
}

function stopCameraAnimation() {
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
  isAnimating.value = false;
}

function rotateCamera() {
  const center = map.getCenter();
  const heading = map.getHeading();
  
  map.flyTo({
    lat: center.lat,
    lng: center.lng,
    alt: center.alt,
    heading: heading + 360,
    pitch: center.pitch,
    duration: 10,
    easingFunction: mars3d.Cesium.EasingFunction.LINEAR_NONE
  });
}

function resetCamera() {
  map.flyToPoint([105.804817, 21.028511], {
    radius: 3000,
    duration: 2,
    pitch: -45,
    heading: 0
  });
}

// Basemap functions
function changeBasemap() {
  const basemapId = selectedBasemap.value;
  map.basemap = basemapId;
  const basemap = map.getBasemap(basemapId);
  if (basemap) {
    showInfo(`Đã chuyển sang ${basemap.name}`);
  }
}

// Layer control functions
function toggleTerrain(nextState) {
  const resolved = typeof nextState === "boolean" ? nextState : !showTerrain.value;
  showTerrain.value = resolved;
}

function toggleLabels() {
  // Toggle labels visibility (implementation depends on specific label layer)
  showInfo(`Nhãn ${showLabels.value ? 'hiển thị' : 'ẩn'}`);
}

function toggleGrid(nextState) {
  const resolved = typeof nextState === "boolean" ? nextState : !showGrid.value;
  showGrid.value = resolved;

  if (!map) {
    return;
  }

  const imageryLayers = map.scene?.imageryLayers;
  if (!imageryLayers) {
    return;
  }

  if (resolved) {
    if (!gridImageryLayer) {
      gridImageryLayer = imageryLayers.addImageryProvider(new mars3d.Cesium.GridImageryProvider({
        cells: 12,
        color: mars3d.Cesium.Color.fromCssColorString("rgba(0, 255, 255, 0.55)"),
        glowColor: mars3d.Cesium.Color.fromCssColorString("rgba(0, 128, 255, 0.35)"),
        backgroundColor: mars3d.Cesium.Color.TRANSPARENT
      }));
      gridImageryLayer.alpha = 0.6;
    } else {
      gridImageryLayer.show = true;
    }
    showInfo('Lưới tọa độ đã bật');
  } else if (gridImageryLayer) {
    gridImageryLayer.show = false;
    showInfo('Lưới tọa độ đã tắt');
  }
}

function updateVietnamOpacity(value = vietnamOpacity.value) {
  if (vietnamLayer.value) {
    vietnamLayer.value.setOpacity(value);
  }
}

// Search function
function searchLocation() {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return;
  
  const found = landmarks.find(l => 
    l.name.toLowerCase().includes(query) || 
    l.city.toLowerCase().includes(query)
  );
  
  if (found) {
    map.flyToPoint([found.lng, found.lat], {
      radius: 1000,
      duration: 2
    });
  const detail = found.description ? `<br/>${found.description}` : "";
  showInfo(`📍 ${found.name}, ${found.city}${detail}`);
  } else {
    showInfo('❌ Không tìm thấy địa điểm');
  }
}

// Screenshot function
function takeScreenshot() {
  map.expImage({
    download: true
  });
  showInfo('📸 Đang chụp màn hình...');
}

// Fullscreen function
function toggleFullscreen() {
  const elem = document.querySelector('.mars3d-wrapper');
  
  if (!document.fullscreenElement) {
    elem.requestFullscreen().then(() => {
      isFullscreen.value = true;
    });
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false;
    });
  }
}

// Export function
function exportData() {
  const data = {
    markers: markers.value.map(g => ({
      type: "marker",
      name: g.attr?.name ?? "Marker",
      city: g.attr?.city,
      position: g.position
    })),
    polylines: polylines.value.map(g => ({
      type: g.attr?.type ?? "polyline",
      name: g.attr?.name,
      positions: g.positions ?? (g.getPositions ? g.getPositions() : [])
    })),
    models: models.value.map(g => ({
      type: g.attr?.type ?? "3dmodel",
      name: g.attr?.name ?? "Model",
      position: g.position
    })),
    polygons: polygons.value.map(g => ({
      type: g.attr?.type ?? "polygon",
      name: g.attr?.name ?? "Polygon",
      positions: g.positions
    }))
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mars3d-data.json';
  a.click();
  URL.revokeObjectURL(url);
  
  showInfo('💾 Đã export dữ liệu');
}

// Bắt đầu chế độ xóa marker - click vào marker để xóa
let pendingDeleteMarker = false;
function startDeleteMarker() {
  if (markers.value.length === 0) {
    showInfo('⚠️ Không có marker nào để xóa');
    return;
  }
  
  pendingDeleteMarker = true;
  const container = document.getElementById('mars3dContainer');
  if (container) container.style.cursor = 'not-allowed';
  showInfo('🗑️ Click vào marker để xóa (ESC để hủy)');
  
  // Lắng nghe ESC để hủy
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      pendingDeleteMarker = false;
      resetMapCursor();
      showInfo('❌ Đã hủy xóa marker');
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

// Info display
function showInfo(message) {
  currentInfo.value = `<div style="padding: 10px;">${message}</div>`;
  setTimeout(() => {
    currentInfo.value = null;
  }, 3000);
}

// Thêm markers mặc định cho các địa điểm
function addDefaultMarkers() {
  if (!markerLayer.value) return;

  // Fallback mode => counts come from local markers
  backendMarkerCount.value = null;

  markerLayer.value.clear();
  markers.value.length = 0;

  landmarksDataset.forEach((landmark, index) => {
    createMarkerGraphic(landmark, index);
  });
  
  console.log('Added default markers from landmarks.json');
}

// Yêu cầu đặt marker bằng click tiếp theo
function addMarker() {
  console.log('addMarker requested - map:', !!map, 'markerLayer:', !!markerLayer.value);
  if (!map || !markerLayer.value) {
    console.error('addMarker failed: map or markerLayer not initialized');
    showInfo('❌ Lỗi: Bản đồ chưa sẵn sàng');
    return;
  }
  pendingAddMarker = true;
  const container = document.getElementById('mars3dContainer');
  if (container) container.style.cursor = 'crosshair';
  showInfo('🖊️ Click lên bản đồ để đặt marker');
}

// Tạo marker tại tọa độ cụ thể - mở modal để nhập thông tin
function addMarkerAt(lng, lat) {
  console.log('Opening modal for new marker at:', lat, lng);
  
  currentEditingMarker = null;
  modalMarkerData.value = {
    name: 'Điểm mới',
    city: '',
    description: '',
    lat: lat,
    lng: lng
  };
  isModalOpen.value = true;
}

// Tạo marker graphic (dùng chung cho load backend và tạo mới)
function createMarkerGraphic(landmark, index = 0) {
  const dataUriRedPin = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Cpath fill='%23e63946' d='M12 2C8.14 2 5 5.14 5 9c0 5.25 5.63 11.25 6.05 11.69a1 1 0 0 0 1.42 0C13.37 20.25 19 14.25 19 9c0-3.86-3.14-7-7-7m0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5'/%3E%3Ccircle cx='12' cy='9' r='1.2' fill='%23fff'/%3E%3C/svg%3E";
  const dataUriHighlightPin = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 24 24'%3E%3Cpath fill='%23fbbf24' d='M12 2C8.14 2 5 5.14 5 9c0 5.25 5.63 11.25 6.05 11.69a1 1 0 0 0 1.42 0C13.37 20.25 19 14.25 19 9c0-3.86-3.14-7-7-7m0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5'/%3E%3Ccircle cx='12' cy='9' r='1.2' fill='%23fff'/%3E%3C/svg%3E";

  const graphic = new mars3d.graphic.BillboardEntity({
    position: [landmark.lng, landmark.lat, 0],
    style: {
      image: dataUriRedPin,
      scale: 1,
      horizontalOrigin: mars3d.Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: mars3d.Cesium.VerticalOrigin.BOTTOM,
      label: {
        text: landmark.name,
        font_size: 14,
        color: "#ffffff",
        pixelOffsetY: -40,
        background: true,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: [4, 8]
      }
    },
    attr: { 
      type: "marker", 
      name: landmark.name, 
      city: landmark.city || '', 
      description: landmark.description || '',
      id: landmark.id,
      lat: landmark.lat,
      lng: landmark.lng,
      houseNumberOrOfficeName: landmark.houseNumberOrOfficeName || '',
      ward: landmark.ward || '',
      district: landmark.district || '',
      province: landmark.province || '',
      country: landmark.country || 'Vietnam',
      fullAddress: landmark.fullAddress || '',
      originalScale: 1,
      originalImage: dataUriRedPin,
      highlightImage: dataUriHighlightPin
    }
  });

  graphic.show = showMarkers.value;

  // Map Cesium entity -> landmarkId for reliable label picking
  try {
    const landmarkId = graphic.attr?.id;
    const entity = graphic?.entity || graphic?._entity || graphic?.graphic?.entity || graphic?.graphic?._entity;
    if (landmarkId && entity) {
      entityToLandmarkId.set(entity, landmarkId);
      if (typeof entity.id === 'string') {
        entityIdToLandmarkId.set(entity.id, landmarkId);
      }
    }
  } catch (e) {
    // ignore
  }
  
  // Hover event để hiển thị tooltip (desktop)
  if (!isMobileBrowser.value) {
    graphic.on('mouseover', (event) => {
      const hoverLandmark = {
        ...graphic.attr,
        lat: graphic.attr?.lat ?? landmark?.lat,
        lng: graphic.attr?.lng ?? landmark?.lng,
        fullAddress: graphic.attr?.fullAddress ?? landmark?.fullAddress ?? ''
      };

      // Normal hover: show tooltip (label hover is handled by scene.pick mousemove)
      if (labelMediaVisible.value) {
        hideLabelMediaOverlay();
        labelMedia.value = [];
      }

      // If cursor is on label area, don't show tooltip
      try {
        const pos = event?.windowPosition;
        const rect = getMarkerLabelScreenRect(graphic);
        if (pos && rect && isPointInRect(pos, rect)) {
          tooltipVisible.value = false;
          highlightMarker(graphic);
          return;
        }
      } catch (e) {
        // ignore
      }

      showMarkerTooltip(hoverLandmark, event.windowPosition);
      highlightMarker(graphic);
    });

    graphic.on('mouseout', () => {
      hideMarkerTooltip();
      scheduleHideLabelMediaOverlay(150);
      dehighlightMarker(graphic);
    });
  }
  
  // Long press event để hiển thị tooltip (mobile)
  let pressTimer = null;
  graphic.on('pointerdown', () => {
    pressTimer = setTimeout(() => {
      const hoverLandmark = {
        ...graphic.attr,
        lat: graphic.attr?.lat ?? landmark?.lat,
        lng: graphic.attr?.lng ?? landmark?.lng,
        fullAddress: graphic.attr?.fullAddress ?? landmark?.fullAddress ?? ''
      };
      showMarkerTooltip(hoverLandmark, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
      highlightMarker(graphic);
    }, 500);
  });

  graphic.on('pointerup', () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
    }
  });

  graphic.on('pointercancel', () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
    }
    hideMarkerTooltip();
    dehighlightMarker(graphic);
  });
  
  // Click event để chỉnh sửa hoặc xóa
  graphic.on('click', () => {
    console.log('Marker clicked:', landmark.name);
    
    if (pendingDeleteMarker) {
      // Chế độ xóa
      deleteMarker(graphic);
      pendingDeleteMarker = false;
      resetMapCursor();
    } else {
      // Chế độ chỉnh sửa
      openEditModal(graphic);
    }
  });
  
  markerLayer.value.addGraphic(graphic);
  markers.value.push(graphic);
  
  return graphic;
}

// Tooltip helper functions
function showMarkerTooltip(landmark, position) {
  clearTimeout(tooltipTimeout);
  tooltipPosition.value = position;
  tooltipLandmark.value = landmark;
  tooltipVisible.value = true;
}

function computeFloatingBoxPosition(position, { width = 320, height = 210, offsetX = 12, offsetY = 12 } = {}) {
  let left = (position?.x ?? 0) + offsetX;
  let top = (position?.y ?? 0) + offsetY;

  if (left + width > window.innerWidth) {
    left = window.innerWidth - width - 10;
  }
  if (top + height > window.innerHeight) {
    top = window.innerHeight - height - 10;
  }

  return {
    x: Math.max(0, left),
    y: Math.max(0, top)
  };
}

async function fetchLandmarkMedia(landmarkId) {
  if (!landmarkId) return [];
  if (mediaCache.has(landmarkId)) return mediaCache.get(landmarkId);

  const response = await fetch(`/api/media/landmark/${landmarkId}`);
  const result = await response.json();
  const mediaList = (result?.success && Array.isArray(result.data))
    ? result.data.map((item) => ({
        id: item.id,
        type: item.media_type,
        fileName: item.file_name,
        url: `/api/media/serve/${landmarkId}/${item.file_name}`,
        size: item.file_size
      }))
    : [];

  mediaCache.set(landmarkId, mediaList);
  return mediaList;
}

function showLabelMediaOverlay(landmarkId, position) {
  clearTimeout(labelMediaHideTimer);
  labelMediaVisible.value = true;
  labelMediaLandmarkId.value = landmarkId;
  labelMediaPosition.value = computeFloatingBoxPosition(position);
}

function hideLabelMediaOverlay() {
  clearTimeout(labelMediaHideTimer);
  labelMediaVisible.value = false;
  labelMediaLandmarkId.value = null;
}

function scheduleHideLabelMediaOverlay(delay = 200) {
  clearTimeout(labelMediaHideTimer);
  labelMediaHideTimer = setTimeout(() => {
    labelMediaVisible.value = false;
    labelMediaLandmarkId.value = null;
  }, delay);
}

function isLikelyLabelHoverEvent(event) {
  const picked = event?.pickedObject || event?.pick || event?.picking || event?.object || event?.sourceEvent?.pickedObject;
  const prim = picked?.primitive || picked?.prim || picked?.cesiumObject;
  const name = prim?.constructor?.name?.toLowerCase?.() || '';

  // Cesium label primitives commonly include "Label" in constructor name
  if (name.includes('label')) return true;

  // Some builds expose label-like props
  if (prim && (typeof prim.text !== 'undefined' || typeof prim._text !== 'undefined')) return true;

  return false;
}

function isPickedLabel(picked) {
  const prim = picked?.primitive;
  const ctorName = prim?.constructor?.name?.toLowerCase?.() || '';
  if (ctorName.includes('label')) return true;
  if (prim && (typeof prim.text !== 'undefined' || typeof prim._text !== 'undefined')) return true;

  // Some Cesium picks put label on pickedObject itself
  const alt = picked?.id;
  const altName = alt?.constructor?.name?.toLowerCase?.() || '';
  if (altName.includes('label')) return true;
  return false;
}

function getLandmarkIdFromPick(picked) {
  const candidateEntities = [
    picked?.id,
    picked?.primitive?.id,
    picked?.primitive?._id,
    picked?.primitive?._entity,
    picked?.primitive?.entity
  ].filter(Boolean);

  for (const ent of candidateEntities) {
    if (typeof ent === 'number') return ent;
    if (typeof ent === 'string') {
      const mapped = entityIdToLandmarkId.get(ent);
      if (mapped) return mapped;
      continue;
    }

    const mapped = entityToLandmarkId.get(ent);
    if (mapped) return mapped;

    // Sometimes picked.id is a Cesium Entity; its .id can be string
    const entId = ent?.id;
    if (typeof entId === 'number') return entId;
    if (typeof entId === 'string') {
      const mapped2 = entityIdToLandmarkId.get(entId);
      if (mapped2) return mapped2;
    }

    // As a last resort, try mars3d-style attr attachment
    const attrId = ent?.attr?.id ?? ent?._attr?.id;
    if (attrId) return attrId;
  }

  return null;
}

function hideMarkerTooltip() {
  tooltipTimeout = setTimeout(() => {
    if (isTooltipHovered.value) return;
    tooltipVisible.value = false;
  }, 600);
}

function handleTooltipEnter() {
  isTooltipHovered.value = true;
  clearTimeout(tooltipTimeout);
  tooltipVisible.value = true;
}

function handleTooltipLeave() {
  isTooltipHovered.value = false;
  hideMarkerTooltip();
}

// Highlight marker with visual distinction
function highlightMarker(marker) {
  // Remove previous highlight
  if (currentHighlightedMarker && currentHighlightedMarker !== marker) {
    dehighlightMarker(currentHighlightedMarker);
  }

  currentHighlightedMarker = marker;
  
  // Update marker appearance
  const attr = marker.attr;
  marker.style.image = attr.highlightImage;
  marker.style.scale = 1.3; // Scale up on highlight
  marker.style.opacity = 1;
  
  // Update label appearance
  if (marker.style.label) {
    marker.style.label.color = '#fbbf24';
    marker.style.label.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  }
}

// Restore marker to original state
function dehighlightMarker(marker) {
  if (!marker) return;
  
  const attr = marker.attr;
  marker.style.image = attr.originalImage;
  marker.style.scale = attr.originalScale;
  marker.style.opacity = 1;
  
  // Restore label appearance
  if (marker.style.label) {
    marker.style.label.color = '#ffffff';
    marker.style.label.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  }
  
  if (currentHighlightedMarker === marker) {
    currentHighlightedMarker = null;
  }
}

// Mở modal chỉnh sửa marker
function openEditModal(marker) {
  if (!marker) {
    console.error('openEditModal: marker is null/undefined');
    return;
  }

  console.log('openEditModal called for:', marker.attr?.name);

  const lat = marker.attr?.lat ?? 0;
  const lng = marker.attr?.lng ?? 0;

  currentEditingMarker = marker;
  modalMarkerData.value = {
    id: marker.attr?.id ?? null,
    name: marker.attr?.name || 'Marker',
    city: marker.attr?.city || '',
    description: marker.attr?.description || '',
    lat: lat,
    lng: lng,
    houseNumberOrOfficeName: marker.attr?.houseNumberOrOfficeName || '',
    ward: marker.attr?.ward || '',
    district: marker.attr?.district || '',
    province: marker.attr?.province || '',
    country: marker.attr?.country || 'Vietnam'
  };
  isModalOpen.value = true;
}

// Đóng modal
function closeModal() {
  isModalOpen.value = false;
  currentEditingMarker = null;
  hideMarkerTooltip();
  if (currentHighlightedMarker) {
    dehighlightMarker(currentHighlightedMarker);
  }
  resetMapCursor();
}

// Lưu marker từ modal (thêm mới hoặc cập nhật)
async function saveMarkerFromModal(payload) {
  const { pendingUploads = [], ...data } = payload || {};
  console.log('saveMarkerFromModal:', data, `with ${pendingUploads.length} pending media`);
  
  try {
    if (currentEditingMarker) {
      // Cập nhật marker hiện tại
      await updateMarker(currentEditingMarker, data, pendingUploads);
    } else {
      // Tạo marker mới
      await createNewMarker(data, pendingUploads);
    }
  } finally {
    closeModal();
  }
}

// Tạo marker mới và lưu lên backend
async function createNewMarker(data, pendingUploads = []) {
  try {
    // Lưu lên backend trước
    const saved = await saveMarkerToBackend({
      name: data.name,
      lat: data.lat,
      lng: data.lng,
      city: data.city || '',
      description: data.description || '',
      houseNumberOrOfficeName: data.houseNumberOrOfficeName || '',
      ward: data.ward || '',
      district: data.district || '',
      province: data.province || '',
      country: data.country || 'Vietnam'
    });
    
    if (pendingUploads.length && saved?.id) {
      await uploadPendingMedia(saved.id, pendingUploads);
    }

    if (typeof backendMarkerCount.value === 'number') {
      backendMarkerCount.value += 1;
    }
    
    // Tạo graphic với ID từ backend
    const graphic = createMarkerGraphic({
      ...saved,
      lat: data.lat,
      lng: data.lng
    });
    
    map.flyToPoint([data.lng, data.lat], {
      radius: 500,
      duration: 2
    });
    
    showInfo(`✅ Đã thêm marker "${data.name}"`);
  } catch (err) {
    console.error('Error creating marker:', err);
  }
}

// Cập nhật marker và lưu lên backend
async function updateMarker(marker, data, pendingUploads = []) {
  try {
    const markerId = marker.attr?.id;
    
    // Cập nhật attributes
    marker.attr = {
      ...marker.attr,
      name: data.name,
      city: data.city,
      description: data.description,
      houseNumberOrOfficeName: data.houseNumberOrOfficeName || '',
      ward: data.ward || '',
      district: data.district || '',
      province: data.province || '',
      country: data.country || 'Vietnam'
    };
    
    // Cập nhật label
    if (marker.style?.label) {
      marker.style.label.text = data.name;
    }
    
    // Lưu lên backend nếu có ID
    if (markerId) {
      await fetch(`${BACKEND_URL}/${markerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          lat: data.lat,
          lng: data.lng,
          city: data.city || '',
          description: data.description || '',
          houseNumberOrOfficeName: data.houseNumberOrOfficeName || '',
          ward: data.ward || '',
          district: data.district || '',
          province: data.province || '',
          country: data.country || 'Vietnam'
        })
      });

      if (pendingUploads.length) {
        await uploadPendingMedia(markerId, pendingUploads);
      }
    }
    
    showInfo(`✅ Đã cập nhật marker "${data.name}"`);
  } catch (err) {
    console.error('Error updating marker:', err);
    showInfo('❌ Lỗi cập nhật marker');
  }
}

// Xóa marker
async function deleteMarker(marker) {
  if (!marker) return;
  
  const markerName = marker.attr?.name || 'marker';
  const markerId = marker.attr?.id;
  
  if (!confirm(`Xóa marker "${markerName}"?`)) return;
  
  try {
    // Xóa từ backend nếu có ID
    if (markerId) {
      await deleteMarkerFromBackend(markerId);
      if (typeof backendMarkerCount.value === 'number') {
        backendMarkerCount.value = Math.max(0, backendMarkerCount.value - 1);
      }
    }
    
    // Xóa khỏi map
    const markerIndex = markers.value.indexOf(marker);
    if (markerIndex !== -1) {
      markerLayer.value.removeGraphic(marker);
      markers.value.splice(markerIndex, 1);
    }
    
    showInfo(`🗑️ Đã xóa marker "${markerName}"`);
  } catch (err) {
    console.error('Error deleting marker:', err);
    showInfo('❌ Lỗi khi xóa marker');
  }
}

// Toggle hiển thị markers
function toggleMarkers() {
  showMarkers.value = !showMarkers.value;
  markers.value.forEach(marker => {
    marker.show = showMarkers.value;
  });
}

// Thêm đường vẽ mẫu
function addSamplePolylines() {
  if (!polylineLayer.value) return;

  const center = landmarks[0];

  landmarks.slice(1).forEach((landmark, index) => {
    const polyline = new mars3d.graphic.PolylineEntity({
      positions: [
        [center.lng, center.lat, 50],
        [landmark.lng, landmark.lat, 50]
      ],
      style: {
        width: 3,
        color: `rgba(${100 + index * 30}, ${150 - index * 20}, 255, 0.8)`,
        clampToGround: false
      },
      attr: { type: "polyline", name: `Đường đến ${landmark.name}` }
    });

    polyline.bindPopup(`
      <div style="padding: 10px;">
        <h4>Đường đến ${landmark.name}</h4>
        <p>Khoảng cách: ~${calculateDistance(center, landmark).toFixed(2)} km</p>
      </div>
    `);

    polyline.show = showPolylines.value;
    polylineLayer.value.addGraphic(polyline);
    polylines.value.push(polyline);
  });

  const curvePolyline = new mars3d.graphic.PolylinePrimitive({
    positions: [
      [105.82, 21.02, 200],
      [105.83, 21.03, 300],
      [105.84, 21.035, 250],
      [105.85, 21.04, 200]
    ],
    style: {
      width: 5,
      color: "#FF00FF",
      clampToGround: false
    },
    attr: { type: "polyline", name: "Đường cong mẫu" }
  });

  curvePolyline.show = showPolylines.value;
  polylineLayer.value.addGraphic(curvePolyline);
  polylines.value.push(curvePolyline);
}

// Vẽ đường mới - Cho phép người dùng vẽ tương tác
function drawPolyline() {
  if (!map || !polylineLayer.value) return;

  showInfo('🖊️ Click trên bản đồ để vẽ đường. Click đúp để hoàn thành.');

  polylineLayer.value.startDraw({
    type: "polyline",
    style: {
      width: 4,
      color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.9)`,
      clampToGround: false,
      label: {
        text: "Đường vẽ",
        font_size: 14,
        color: "#ffffff",
        outline: true,
        outlineColor: "#000000",
        outlineWidth: 2,
        pixelOffsetY: -20
      }
    },
    success: (graphic) => {
      graphic.attr = { type: "polyline", name: "Đường vẽ" };
      graphic.show = showPolylines.value;
      
      // Tính độ dài đường
      const distance = graphic.distance;
      if (distance) {
        showInfo(`✅ Đường đã vẽ - Độ dài: ${distance.toFixed(2)} m (${(distance / 1000).toFixed(2)} km)`);
      } else {
        showInfo('✅ Đường đã vẽ thành công');
      }
      
      // Thêm popup hiển thị thông tin
      graphic.bindPopup(`
        <div style="padding: 10px;">
          <h4>Đường vẽ</h4>
          <p>Độ dài: ${distance ? (distance / 1000).toFixed(2) + ' km' : 'N/A'}</p>
          <p>Số điểm: ${graphic.positions ? graphic.positions.length : 'N/A'}</p>
        </div>
      `);
      
      polylines.value.push(graphic);
    }
  });
}

// Toggle hiển thị đường vẽ
function togglePolylines() {
  showPolylines.value = !showPolylines.value;
  polylines.value.forEach(polyline => {
    polyline.show = showPolylines.value;
  });
}

// Thêm 3D models mẫu
function addSample3DModels() {
  if (!modelLayer.value) return;

  const safeAdd = (createFn) => {
    try {
      const graphic = createFn();
      if (!graphic) return;
      graphic.show = show3DModels.value;
      modelLayer.value.addGraphic(graphic);
      models.value.push(graphic);
    } catch (e) {
      console.warn('addSample3DModels: failed to create a sample model', e);
    }
  };

  safeAdd(() => new mars3d.graphic.BoxEntity({
    position: [105.852183, 21.028511, 100],
    style: {
      dimensions: new mars3d.Cesium.Cartesian3(50, 50, 100),
      fill: true,
      color: "rgba(255, 0, 0, 0.7)",
      outline: true,
      outlineColor: "#ffffff",
      outlineWidth: 2,
      label: {
        text: "3D Box",
        font_size: 14,
        color: "#ffffff",
        pixelOffsetY: -80
      }
    },
    attr: { type: "3dmodel", name: "Box" }
  }));

  safeAdd(() => new mars3d.graphic.CylinderEntity({
    position: [105.857391, 21.023890, 80],
    style: {
      length: 150,
      topRadius: 30,
      bottomRadius: 50,
      color: "rgba(0, 255, 0, 0.7)",
      outline: true,
      outlineColor: "#ffffff",
      label: {
        text: "Cylinder",
        font_size: 14,
        color: "#ffffff",
        pixelOffsetY: -100
      }
    },
    attr: { type: "3dmodel", name: "Cylinder" }
  }));

  safeAdd(() => new mars3d.graphic.ConeEntity({
    position: [105.835342, 21.027764, 80],
    style: {
      length: 120,
      topRadius: 0,
      bottomRadius: 40,
      color: "rgba(255, 255, 0, 0.7)",
      outline: true,
      outlineColor: "#ffffff",
      label: {
        text: "Cone",
        font_size: 14,
        color: "#ffffff",
        pixelOffsetY: -90
      }
    },
    attr: { type: "3dmodel", name: "Cone" }
  }));

  safeAdd(() => new mars3d.graphic.EllipsoidEntity({
    position: [105.834160, 21.037544, 100],
    style: {
      radii: new mars3d.Cesium.Cartesian3(40, 40, 80),
      color: "rgba(0, 255, 255, 0.7)",
      outline: true,
      outlineColor: "#ffffff",
      label: {
        text: "Ellipsoid",
        font_size: 14,
        color: "#ffffff",
        pixelOffsetY: -100
      }
    },
    attr: { type: "3dmodel", name: "Ellipsoid" }
  }));
}

// Thêm 3D model mới - Cho phép người dùng click để đặt vị trí
function add3DModel(modelType = currentModelType) {
  if (!map || !modelLayer.value) return;

  const modelNames = {
    box: "Hộp 3D",
    cylinder: "Trụ tròn",
    cone: "Hình nón",
    ellipsoid: "Hình cầu"
  };

  showInfo(`🏗️ Click trên bản đồ để đặt ${modelNames[modelType] || 'Model 3D'}`);

  // Tạo màu ngẫu nhiên
  const randomColor = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.7)`;

  // Cấu hình style cho từng loại model
  const modelConfigs = {
    box: {
      type: "box",
      style: {
        dimensions: new mars3d.Cesium.Cartesian3(50, 50, 100),
        color: randomColor,
        outline: true,
        outlineColor: "#ffffff",
        outlineWidth: 2
      }
    },
    cylinder: {
      type: "cylinder",
      style: {
        length: 150,
        topRadius: 30,
        bottomRadius: 40,
        color: randomColor,
        outline: true,
        outlineColor: "#ffffff",
        outlineWidth: 2
      }
    },
    cone: {
      type: "cone",
      style: {
        length: 120,
        topRadius: 0,
        bottomRadius: 35,
        color: randomColor,
        outline: true,
        outlineColor: "#ffffff",
        outlineWidth: 2
      }
    },
    ellipsoid: {
      type: "ellipsoid",
      style: {
        radii: new mars3d.Cesium.Cartesian3(40, 40, 70),
        color: randomColor,
        outline: true,
        outlineColor: "#ffffff",
        outlineWidth: 2
      }
    }
  };

  const config = modelConfigs[modelType] || modelConfigs.box;

  // Bắt đầu vẽ model tại vị trí click
  modelLayer.value.startDraw({
    type: config.type,
    style: {
      ...config.style,
      label: {
        text: modelNames[modelType],
        font_size: 14,
        color: "#ffffff",
        outline: true,
        outlineColor: "#000000",
        outlineWidth: 2,
        pixelOffsetY: -80,
        background: true,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: [5, 10]
      }
    },
    success: (graphic) => {
      graphic.attr = { 
        type: "3dmodel", 
        name: modelNames[modelType],
        modelType: modelType
      };
      graphic.show = show3DModels.value;
      
      // Thêm popup
      graphic.bindPopup(`
        <div style="padding: 10px;">
          <h4>${modelNames[modelType]}</h4>
          <p>Loại: ${modelType}</p>
          <p>Vị trí: ${graphic.position ? 
            `${graphic.position[1].toFixed(6)}, ${graphic.position[0].toFixed(6)}` : 
            'N/A'}</p>
        </div>
      `);
      
      models.value.push(graphic);
      showInfo(`✅ Đã thêm ${modelNames[modelType]}`);
    }
  });
}

// Toggle hiển thị 3D models
function toggle3DModels() {
  show3DModels.value = !show3DModels.value;
  models.value.forEach(model => {
    model.show = show3DModels.value;
  });
}

// Xóa tất cả
function clearAll() {
  if (!confirm("Bạn có chắc muốn xóa tất cả không?")) {
    return;
  }

  markerLayer.value?.clear();
  polylineLayer.value?.clear();
  modelLayer.value?.clear();
  polygonLayer.value?.clear();
  measureLayer.value?.clear();

  markers.value.length = 0;
  polylines.value.length = 0;
  models.value.length = 0;
  polygons.value.length = 0;

  scheduleStaticContent();
}

// Tính khoảng cách giữa 2 điểm (đơn giản)
function calculateDistance(point1, point2) {
  const R = 6371; // Bán kính Trái đất (km)
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

onUnmounted(() => {
  if (map) {
    map.off('click', handleMapClickForMarker);
    map.destroy();
    map = null;
  }
  try {
    labelPickHandler?.destroy?.();
  } catch (e) {
    // ignore
  }
  labelPickHandler = null;
  isMapReady.value = false;
});

// Handler click map khi đang chờ đặt marker
function handleMapClickForMarker(event) {
  if (!pendingAddMarker) return;
  pendingAddMarker = false;

  // mars3d click event thường có event.latlng; fallback từ cartesian
  let latlng = event?.latlng || event?.point || null;
  if (!latlng && event?.cartesian) {
    const point = mars3d.LngLatPoint.fromCartesian(event.cartesian);
    if (point) latlng = { lat: point.lat, lng: point.lng };
  }

  const lat = latlng?.lat ?? latlng?.y ?? event?.latitude ?? event?.lat;
  const lng = latlng?.lng ?? latlng?.x ?? event?.longitude ?? event?.lng;

  if (lat == null || lng == null) {
    console.error('Không lấy được tọa độ click', event);
    showInfo('❌ Không lấy được tọa độ, thử lại');
    resetMapCursor();
    return;
  }

  addMarkerAt(lng, lat);
  resetMapCursor();
}

function resetMapCursor() {
  const container = document.getElementById('mars3dContainer');
  if (container) container.style.cursor = 'default';
}
</script>

