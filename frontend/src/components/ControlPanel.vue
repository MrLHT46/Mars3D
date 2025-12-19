<template>
  <div class="control-panel" :class="{ collapsed, hidden }">
    <div class="panel-header" :class="{ collapsed }">
      <h3 :class="{ 'title-collapsed': collapsed }">🎮 Điều khiển</h3>
      <div class="header-buttons">
        <button @click="toggleCollapse" class="collapse-btn" :title="collapsed ? 'Mở rộng' : 'Thu gọn'">
          {{ collapsed ? '◀' : '▶' }}
        </button>
        <button v-show="!collapsed" @click="hidePanel" class="hide-btn" title="Ẩn panel">
          ✕
        </button>
      </div>
    </div>

    <div class="panel-content" :class="{ 'panel-content-collapsed': collapsed }">
      <div class="control-section">
        <h4>🗺️ Bản đồ nền</h4>
        <select v-model="selectedBasemapModel" @change="handleBasemapChange" class="select-input">
          <option value="google_satellite">Google Satellite</option>
          <option value="osm">OpenStreetMap</option>
          <option value="arcgis_imagery">ArcGIS Imagery</option>
          <option value="bing_maps">Bing Maps</option>
          <option value="gaode">Gaode Image</option>
          <option value="gaode_vec">Gaode Vector</option>
        </select>
      </div>

      <div class="control-section">
        <h4>📐 Công cụ đo</h4>
        <button @click="emit('measure-distance')" class="btn btn-tool">📏 Đo khoảng cách</button>
        <button @click="emit('measure-area')" class="btn btn-tool">📊 Đo diện tích</button>
        <button @click="emit('measure-height')" class="btn btn-tool">📈 Đo độ cao</button>
        <button @click="emit('clear-measurements')" class="btn btn-danger-sm">Xóa đo đạc</button>
      </div>

      <div class="control-section">
        <h4>✏️ Vẽ hình</h4>
        <button @click="emit('draw-polygon')" class="btn btn-tool">⬟ Vẽ Polygon</button>
        <button @click="emit('draw-circle')" class="btn btn-tool">⭕ Vẽ Circle</button>
        <button @click="emit('draw-rectangle')" class="btn btn-tool">▭ Vẽ Rectangle</button>
      </div>

      <div class="control-section">
        <h4>📍 Markers</h4>
        <button
          @click="emit('add-marker')"
          class="btn btn-primary"
          :disabled="!mapReady"
          :title="mapReady ? 'Thêm Marker' : 'Bản đồ đang khởi tạo, vui lòng chờ'"
        >
          ➕ Thêm Marker
        </button>
        <button @click="emit('delete-marker')" class="btn btn-danger-sm">
          🗑️ Xóa Marker
        </button>
        <button @click="emit('toggle-markers')" class="btn btn-secondary">
          {{ showMarkers ? '👁️ Ẩn' : '👁️ Hiện' }} Markers
        </button>
      </div>

      <div class="control-section">
        <h4>📏 Đường vẽ</h4>
        <button @click="emit('draw-polyline')" class="btn btn-primary">Vẽ đường</button>
        <button @click="emit('toggle-polylines')" class="btn btn-secondary">
          {{ showPolylines ? 'Ẩn' : 'Hiện' }} Đường
        </button>
      </div>

      <div class="control-section">
        <h4>🏗️ 3D Models</h4>
        <select v-model="selectedModelTypeModel" class="select-input">
          <option value="box">📦 Hộp 3D</option>
          <option value="cylinder">🛢️ Trụ tròn</option>
          <option value="cone">🔺 Hình nón</option>
          <option value="ellipsoid">⚪ Hình cầu</option>
        </select>
        <button @click="emit('add-3d-model', selectedModelTypeModel)" class="btn btn-primary">➕ Thêm Model</button>
        <button @click="emit('toggle-3d-models')" class="btn btn-secondary">
          {{ show3DModels ? '👁️ Ẩn' : '👁️ Hiện' }} Models
        </button>
      </div>

      <div class="control-section">
        <h4>🎬 Animation</h4>
        <button @click="emit('start-camera-animation')" class="btn btn-tool">
          {{ isAnimating ? '⏸ Dừng' : '▶ Bắt đầu' }} Tour
        </button>
        <button @click="emit('rotate-camera')" class="btn btn-tool">🔄 Xoay 360°</button>
      </div>

      <div class="control-section">
        <h4>🎚️ Layer</h4>
        <div class="layer-item">
          <label>
            <input type="checkbox" v-model="showTerrainModel" @change="handleTerrainChange" />
            Địa hình 3D
          </label>
        </div>
        <div class="layer-item">
          <label>
            <input type="checkbox" v-model="showLabelsModel" @change="handleLabelsChange" />
            Nhãn địa danh
          </label>
        </div>
        <div class="layer-item">
          <label>
            <input type="checkbox" v-model="showGridModel" @change="handleGridChange" />
            Lưới tọa độ
          </label>
        </div>
      </div>

      <div class="control-section">
        <h4>⚙️ Cài đặt</h4>
        <div class="setting-item">
          <label>Độ mờ Vietnam: {{ vietnamOpacity }}</label>
          <input
            type="range"
            v-model="vietnamOpacityModel"
            @input="handleVietnamOpacityChange"
            min="0"
            max="1"
            step="0.1"
            class="slider"
          />
        </div>
      </div>

      <div class="control-section">
        <button @click="emit('clear-all')" class="btn btn-danger">🗑️ Xóa tất cả</button>
        <button @click="emit('export-data')" class="btn btn-success">💾 Export JSON</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import './ControlPanel.css';

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  },
  hidden: {
    type: Boolean,
    default: false
  },
  selectedBasemap: {
    type: String,
    default: 'gaode'
  },
  selectedModelType: {
    type: String,
    default: 'box'
  },
  showMarkers: {
    type: Boolean,
    default: true
  },
  showPolylines: {
    type: Boolean,
    default: true
  },
  show3DModels: {
    type: Boolean,
    default: true
  },
  showTerrain: {
    type: Boolean,
    default: false
  },
  showLabels: {
    type: Boolean,
    default: true
  },
  showGrid: {
    type: Boolean,
    default: false
  },
  vietnamOpacity: {
    type: Number,
    default: 0.3
  },
  isAnimating: {
    type: Boolean,
    default: false
  },
  mapReady: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits([
  'update:collapsed',
  'update:hidden',
  'update:selectedBasemap',
  'update:selectedModelType',
  'update:showTerrain',
  'update:showLabels',
  'update:showGrid',
  'update:vietnamOpacity',
  'measure-distance',
  'measure-area',
  'measure-height',
  'clear-measurements',
  'draw-polygon',
  'draw-circle',
  'draw-rectangle',
  'add-marker',
  'delete-marker',
  'toggle-markers',
  'draw-polyline',
  'toggle-polylines',
  'add-3d-model',
  'toggle-3d-models',
  'start-camera-animation',
  'rotate-camera',
  'toggle-terrain',
  'toggle-labels',
  'toggle-grid',
  'update-vietnam-opacity',
  'clear-all',
  'export-data',
  'change-basemap'
]);

const selectedBasemapModel = computed({
  get: () => props.selectedBasemap,
  set: value => emit('update:selectedBasemap', value)
});

const selectedModelTypeModel = computed({
  get: () => props.selectedModelType,
  set: value => emit('update:selectedModelType', value)
});

const showTerrainModel = computed({
  get: () => props.showTerrain,
  set: value => emit('update:showTerrain', value)
});

const showLabelsModel = computed({
  get: () => props.showLabels,
  set: value => emit('update:showLabels', value)
});

const showGridModel = computed({
  get: () => props.showGrid,
  set: value => emit('update:showGrid', value)
});

const vietnamOpacityModel = computed({
  get: () => props.vietnamOpacity,
  set: value => emit('update:vietnamOpacity', Number(value))
});

function toggleCollapse() {
  emit('update:collapsed', !props.collapsed);
}

function hidePanel() {
  emit('update:hidden', true);
}

function handleBasemapChange() {
  emit('change-basemap');
}

function handleTerrainChange(event) {
  emit('toggle-terrain', event.target.checked);
}

function handleLabelsChange(event) {
  emit('toggle-labels', event.target.checked);
}

function handleGridChange(event) {
  emit('toggle-grid', event.target.checked);
}

function handleVietnamOpacityChange(event) {
  emit('update-vietnam-opacity', Number(event.target.value));
}
</script>
