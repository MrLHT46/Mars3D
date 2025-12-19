<template>
  <div class="stats-panel">
    <div class="stat-item">📍 Markers: {{ markerCount }}</div>
    <div class="stat-item">📏 Đường: {{ polylineCount }}</div>
    <div class="stat-item">🏗️ Models: {{ modelCount }}</div>
    <div class="stat-item">⬟ Polygons: {{ polygonCount }}</div>
  </div>
</template>

<script setup>
import './StatsDisplay.css';

defineProps({
  markerCount: {
    type: Number,
    default: 0
  },
  polylineCount: {
    type: Number,
    default: 0
  },
  modelCount: {
    type: Number,
    default: 0
  },
  polygonCount: {
    type: Number,
    default: 0
  }
});
</script>
