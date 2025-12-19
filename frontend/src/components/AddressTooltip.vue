<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="address-tooltip"
      :style="tooltipStyle"
      :class="{ 'is-mobile': isMobile }"
      @mouseenter="emit('mouseenter')"
      @mouseleave="emit('mouseleave')"
    >
      <div class="tooltip-content">
        <!-- Media Gallery -->
        <MediaGallery
          v-if="showMedia && media.length > 0"
          :media="media"
          :autoPlay="true"
          :autoPlayInterval="3000"
          @mouseenter="handleMediaEnter"
          @mouseleave="handleMediaLeave"
        />

        <div class="address-header">
          <span class="location-icon">📍</span>
          <span
            class="location-name"
            @mouseenter="handleNameEnter"
            @mouseleave="handleNameLeave"
          >
            {{ landmark.name }}
          </span>
        </div>
        <div class="address-body">
          <p class="address-line">{{ landmark.fullAddress }}</p>
          <p v-if="landmark.description" class="description">{{ landmark.description }}</p>
          <div class="coordinates">
            <span class="coord-item">🔴 {{ landmark.lat?.toFixed(6) }}</span>
            <span class="coord-item">🔵 {{ landmark.lng?.toFixed(6) }}</span>
          </div>
        </div>
      </div>
      <div class="tooltip-arrow"></div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import MediaGallery from './MediaGallery.vue';

const emit = defineEmits(['mouseenter', 'mouseleave']);

const props = defineProps({
  landmark: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      name: '',
      fullAddress: '',
      description: '',
      lat: 0,
      lng: 0
    })
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  isVisible: {
    type: Boolean,
    default: false
  },
  isMobile: {
    type: Boolean,
    default: false
  }
});

const media = ref([]);
const showMedia = ref(false);
const lastFetchedLandmarkId = ref(null);
const isFetching = ref(false);
let hideMediaTimer = null;

const tooltipStyle = computed(() => {
  const offsetX = 10;
  const offsetY = 10;
  const tooltipWidth = 300;
  const tooltipHeight = 180;

  let left = props.position.x + offsetX;
  let top = props.position.y + offsetY;

  // Keep tooltip within viewport
  if (left + tooltipWidth > window.innerWidth) {
    left = window.innerWidth - tooltipWidth - 10;
  }
  if (top + tooltipHeight > window.innerHeight) {
    top = window.innerHeight - tooltipHeight - 10;
  }

  return {
    left: `${Math.max(0, left)}px`,
    top: `${Math.max(0, top)}px`
  };
});

// Fetch media when visible changes
watch(() => props.isVisible, async (newVal) => {
  if (newVal && props.landmark?.id) {
    showMedia.value = false;
    await fetchMedia(props.landmark.id);
  }
});

// Fetch media when landmark changes
watch(() => props.landmark?.id, async (newId) => {
  if (newId && props.isVisible) {
    showMedia.value = false;
    await fetchMedia(newId);
  }
});

function handleNameEnter() {
  clearTimeout(hideMediaTimer);
  showMedia.value = true;
  if (props.landmark?.id) {
    // Ensure media is loaded even if tooltip became visible without fetch (edge cases)
    fetchMedia(props.landmark.id);
  }
}

function handleNameLeave() {
  // Small delay so the cursor can move from name -> gallery without flicker
  hideMediaTimer = setTimeout(() => {
    showMedia.value = false;
  }, 150);
}

function handleMediaEnter() {
  clearTimeout(hideMediaTimer);
  showMedia.value = true;
}

function handleMediaLeave() {
  hideMediaTimer = setTimeout(() => {
    showMedia.value = false;
  }, 150);
}

async function fetchMedia(landmarkId, { force = false } = {}) {
  try {
    if (!landmarkId) return;
    if (!force && lastFetchedLandmarkId.value === landmarkId && media.value.length > 0) {
      return;
    }
    if (isFetching.value) return;
    isFetching.value = true;
    console.log('[AddressTooltip] fetchMedia for landmark:', landmarkId);
    const response = await fetch(`/api/media/landmark/${landmarkId}`);
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      console.log('[AddressTooltip] media count:', result.data.length);
      media.value = result.data.map(item => ({
        id: item.id,
        type: item.media_type,
        fileName: item.file_name,
        url: `/api/media/serve/${landmarkId}/${item.file_name}`,
        size: item.file_size
      }));
      lastFetchedLandmarkId.value = landmarkId;
    } else {
      media.value = [];
      lastFetchedLandmarkId.value = landmarkId;
    }
  } catch (err) {
    console.error('Error fetching media:', err);
    media.value = [];
  } finally {
    isFetching.value = false;
  }
}
</script>

<style scoped>
.address-tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: auto;
  animation: tooltipFadeIn 0.2s ease-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.tooltip-content {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  max-width: 300px;
  min-width: 250px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
}

.address-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.location-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.location-name {
  font-weight: 600;
  color: #fff;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
  cursor: pointer;
}

.address-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.address-line {
  margin: 0;
  font-size: 12px;
  color: #cbd5e1;
  line-height: 1.5;
  font-family: 'Courier New', monospace;
  word-break: break-word;
}

.description {
  margin: 0;
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.4;
  font-style: italic;
  max-height: 2.4em;
  overflow: hidden;
  text-overflow: ellipsis;
}

.coordinates {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #60a5fa;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.coord-item {
  font-family: 'Courier New', monospace;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tooltip-arrow {
  position: absolute;
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  transform: rotate(45deg) translateY(-50%);
  left: 20px;
  top: -4px;
}

/* Mobile adjustments */
.address-tooltip.is-mobile .tooltip-content {
  min-width: 280px;
  max-width: 90vw;
}

@media (max-width: 480px) {
  .tooltip-content {
    min-width: 200px;
    max-width: 85vw;
    padding: 12px;
  }

  .address-header {
    margin-bottom: 8px;
    padding-bottom: 8px;
  }

  .location-name {
    font-size: 13px;
  }

  .address-line {
    font-size: 11px;
  }

  .description {
    font-size: 10px;
  }

  .coordinates {
    font-size: 10px;
  }
}
</style>
