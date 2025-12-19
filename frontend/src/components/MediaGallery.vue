<template>
  <div v-if="media.length > 0" class="media-gallery-container">
    <!-- Main Media Display -->
    <div class="gallery-main">
      <div class="media-wrapper">
        <!-- Current Image -->
        <img
          v-if="currentMedia.type === 'image'"
          :src="currentMedia.url"
          :alt="currentMedia.fileName"
          class="media-display"
        />
        <!-- Current Video -->
        <video
          v-else-if="currentMedia.type === 'video'"
          :src="currentMedia.url"
          controls
          class="media-display"
        />
      </div>

      <!-- Navigation Buttons -->
      <button
        v-if="media.length > 1"
        @click="previousMedia"
        class="nav-button prev-button"
        title="Previous media"
      >
        ◀
      </button>
      <button
        v-if="media.length > 1"
        @click="nextMedia"
        class="nav-button next-button"
        title="Next media"
      >
        ▶
      </button>

      <!-- Media Counter -->
      <div class="media-counter">{{ currentIndex + 1 }}/{{ media.length }}</div>

      <!-- Media Info -->
      <div class="media-info">
        <span class="media-type">{{ currentMedia.type === 'video' ? '🎬 Video' : '🖼️ Image' }}</span>
        <span class="media-size">{{ formatFileSize(currentMedia.size) }}</span>
      </div>
    </div>

    <!-- Thumbnail Strip -->
    <div class="thumbnail-container">
      <button
        v-if="canScrollLeft"
        @click="scrollThumbnailsLeft"
        class="scroll-button scroll-left"
      >
        ◀
      </button>

      <div class="thumbnails" ref="thumbnailsRef">
        <div
          v-for="(item, index) in media"
          :key="item.id"
          :class="['thumbnail', { active: index === currentIndex }]"
          @click="selectMedia(index)"
        >
          <!-- Image Thumbnail -->
          <img
            v-if="item.type === 'image'"
            :src="item.url"
            :alt="`Thumbnail ${index + 1}`"
            class="thumbnail-image"
          />
          <!-- Video Thumbnail -->
          <div v-else class="video-thumbnail">
            <div class="video-play-icon">▶</div>
            <span class="video-label">Video</span>
          </div>
        </div>
      </div>

      <button
        v-if="canScrollRight"
        @click="scrollThumbnailsRight"
        class="scroll-button scroll-right"
      >
        ▶
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  media: {
    type: Array,
    required: true,
    default: () => []
  },
  autoPlay: {
    type: Boolean,
    default: false
  },
  autoPlayInterval: {
    type: Number,
    default: 3000
  }
});

const currentIndex = ref(0);
const thumbnailsRef = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
let autoPlayTimer = null;

const currentMedia = computed(() => {
  if (props.media.length > 0) {
    return props.media[currentIndex.value];
  }
  return null;
});

// Format file size for display
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Navigation functions
function nextMedia() {
  currentIndex.value = (currentIndex.value + 1) % props.media.length;
  scrollThumbnailToView();
  resetAutoPlay();
}

function previousMedia() {
  currentIndex.value = (currentIndex.value - 1 + props.media.length) % props.media.length;
  scrollThumbnailToView();
  resetAutoPlay();
}

function selectMedia(index) {
  currentIndex.value = index;
  scrollThumbnailToView();
  resetAutoPlay();
}

// Thumbnail scroll functions
function scrollThumbnailsLeft() {
  if (thumbnailsRef.value) {
    thumbnailsRef.value.scrollBy({ left: -150, behavior: 'smooth' });
    updateScrollButtons();
  }
}

function scrollThumbnailsRight() {
  if (thumbnailsRef.value) {
    thumbnailsRef.value.scrollBy({ left: 150, behavior: 'smooth' });
    updateScrollButtons();
  }
}

function scrollThumbnailToView() {
  nextTick(() => {
    if (thumbnailsRef.value) {
      const thumbnail = thumbnailsRef.value.children[currentIndex.value];
      if (thumbnail) {
        thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
      updateScrollButtons();
    }
  });
}

function updateScrollButtons() {
  if (thumbnailsRef.value) {
    const { scrollLeft, scrollWidth, clientWidth } = thumbnailsRef.value;
    canScrollLeft.value = scrollLeft > 0;
    canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10;
  }
}

// Auto-play functions
function startAutoPlay() {
  if (props.autoPlay && props.media.length > 1) {
    autoPlayTimer = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % props.media.length;
      updateScrollButtons();
    }, props.autoPlayInterval);
  }
}

function stopAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
}

function resetAutoPlay() {
  stopAutoPlay();
  startAutoPlay();
}

// Watchers
watch(() => props.autoPlay, (newVal) => {
  if (newVal) {
    startAutoPlay();
  } else {
    stopAutoPlay();
  }
});

watch(() => props.media, () => {
  currentIndex.value = 0;
  nextTick(() => {
    updateScrollButtons();
  });
});

// Lifecycle
watch(() => thumbnailsRef.value, () => {
  nextTick(() => {
    updateScrollButtons();
  });
});
</script>

<style scoped>
.media-gallery-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 0.5rem;
  padding: 1rem;
}

/* Main Gallery */
.gallery-main {
  position: relative;
  width: 100%;
  background: #0f172a;
  border-radius: 0.5rem;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.media-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.media-display {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Navigation Buttons */
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s;
  z-index: 10;
}

.nav-button:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-50%) scale(1.1);
}

.prev-button {
  left: 0.5rem;
}

.next-button {
  right: 0.5rem;
}

/* Media Counter & Info */
.media-counter {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  background: rgba(0, 0, 0, 0.7);
  color: #cbd5e1;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.media-info {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #cbd5e1;
}

.media-type {
  background: rgba(0, 0, 0, 0.7);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.media-size {
  background: rgba(0, 0, 0, 0.7);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

/* Thumbnail Strip */
.thumbnail-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #1e293b;
  padding: 0.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
}

.thumbnails {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 0.25rem;
}

.thumbnails::-webkit-scrollbar {
  height: 4px;
}

.thumbnails::-webkit-scrollbar-track {
  background: #0f172a;
  border-radius: 2px;
}

.thumbnails::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 2px;
}

.thumbnails::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

.thumbnail {
  flex-shrink: 0;
  width: 80px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 0.25rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;
  background: #0f172a;
}

.thumbnail.active {
  border-color: #fbbf24;
  box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.3);
}

.thumbnail:hover {
  border-color: #60a5fa;
  opacity: 0.8;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-thumbnail {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.25rem;
}

.video-play-icon {
  font-size: 1.5rem;
  color: #60a5fa;
}

.video-label {
  font-size: 0.625rem;
  color: #94a3b8;
  font-weight: 500;
}

/* Scroll Buttons */
.scroll-button {
  background: #475569;
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.scroll-button:hover {
  background: #64748b;
}

.scroll-button:active {
  transform: scale(0.95);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .media-gallery-container {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .gallery-main {
    aspect-ratio: 4 / 3;
  }

  .nav-button {
    padding: 0.5rem 0.75rem;
    font-size: 1.25rem;
  }

  .thumbnail {
    width: 60px;
    height: 45px;
  }

  .media-counter,
  .media-type,
  .media-size {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .media-gallery-container {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .gallery-main {
    aspect-ratio: 1 / 1;
  }

  .nav-button {
    padding: 0.375rem 0.5rem;
    font-size: 1rem;
  }

  .thumbnail {
    width: 50px;
    height: 50px;
  }

  .scroll-button {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
