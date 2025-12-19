<template>
  <div class="top-toolbar">
    <div class="toolbar-group">
      <button @click="emit('take-screenshot')" class="toolbar-btn" title="Chụp màn hình">
        📸
      </button>
      <button @click="emit('toggle-fullscreen')" class="toolbar-btn" title="Toàn màn hình">
        {{ isFullscreen ? '🗗' : '⛶' }}
      </button>
      <button @click="emit('reset-camera')" class="toolbar-btn" title="Reset camera">
        🏠
      </button>
    </div>

    <div class="search-box">
      <input
        v-model="searchValue"
        @keyup.enter="handleSearch"
        placeholder="Tìm kiếm địa điểm..."
        class="search-input"
      />
      <button @click="handleSearch" class="search-btn">🔍</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import './TopToolbar.css';

const props = defineProps({
  isFullscreen: {
    type: Boolean,
    default: false
  },
  searchQuery: {
    type: String,
    default: ''
  }
});

const emit = defineEmits([
  'update:searchQuery',
  'take-screenshot',
  'toggle-fullscreen',
  'reset-camera',
  'search-location'
]);

const searchValue = computed({
  get: () => props.searchQuery,
  set: value => emit('update:searchQuery', value)
});

function handleSearch() {
  emit('search-location');
}
</script>
