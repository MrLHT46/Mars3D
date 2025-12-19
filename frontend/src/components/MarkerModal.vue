<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button @click="handleClose" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <!-- Basic Information -->
          <div class="section-header">📍 Thông tin cơ bản</div>
          
          <div class="form-group">
            <label for="marker-name">Tên địa điểm *</label>
            <input
              id="marker-name"
              v-model="localData.name"
              type="text"
              placeholder="VD: Hồ Hoàn Kiếm"
              class="form-input"
              @keyup.enter="handleSave"
            />
          </div>

          <div class="form-group">
            <label for="marker-description">Mô tả</label>
            <textarea
              id="marker-description"
              v-model="localData.description"
              placeholder="Mô tả chi tiết về địa điểm..."
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>

          <!-- Address Information -->
          <div class="section-header">🏠 Địa chỉ</div>

          <div class="form-group">
            <label for="house-number">Số nhà / Tên văn phòng (tùy chọn)</label>
            <input
              id="house-number"
              v-model="localData.houseNumberOrOfficeName"
              type="text"
              placeholder="VD: 12A, Tòa nhà ABC"
              class="form-input"
              @keyup.enter="handleSave"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="ward">Phường/Xã *</label>
              <input
                id="ward"
                v-model="localData.ward"
                type="text"
                placeholder="VD: Phường Hoàn Kiếm"
                class="form-input"
                @keyup.enter="handleSave"
              />
            </div>
            <div class="form-group">
              <label for="district">Quận/Huyện *</label>
              <input
                id="district"
                v-model="localData.district"
                type="text"
                placeholder="VD: Quận Hoàn Kiếm"
                class="form-input"
                @keyup.enter="handleSave"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="province">Tỉnh/Thành phố *</label>
              <input
                id="province"
                v-model="localData.province"
                type="text"
                placeholder="VD: Thành phố Hà Nội"
                class="form-input"
                @keyup.enter="handleSave"
              />
            </div>
            <div class="form-group">
              <label for="country">Quốc gia</label>
              <input
                id="country"
                v-model="localData.country"
                type="text"
                placeholder="VD: Vietnam"
                class="form-input"
                @keyup.enter="handleSave"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="city">Thành phố (legacy)</label>
            <input
              id="city"
              v-model="localData.city"
              type="text"
              placeholder="VD: Hà Nội"
              class="form-input"
              @keyup.enter="handleSave"
            />
          </div>

          <!-- Full Address Preview -->
          <div class="full-address-section">
            <label>📋 Địa chỉ đầy đủ</label>
            <div class="full-address-display">{{ fullAddress }}</div>
          </div>

          <!-- Coordinates -->
          <div class="section-header">🗺️ Tọa độ</div>
          <div class="coords-display">
            <span>📍 Lat: {{ localData.lat?.toFixed(6) || 'N/A' }}</span>
            <span>📍 Lng: {{ localData.lng?.toFixed(6) || 'N/A' }}</span>
          </div>

          <!-- Media Upload -->
          <div class="section-header">📸 Thư viện Media</div>
          <div class="media-upload-section">
            <div class="upload-info">
              <p>Tối đa: 5 ảnh, 1 video (&lt; 50MB)</p>
              <p v-if="localData.id">{{ mediaCount.images }}/5 ảnh · {{ mediaCount.videos }}/1 video</p>
            </div>

            <div class="upload-controls">
              <!-- Image Upload -->
              <label class="upload-button image-upload">
                <span>🖼️ Tải ảnh</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  @change="handleImageUpload"
                  style="display: none"
                />
              </label>

              <!-- Video Upload -->
              <label class="upload-button video-upload">
                <span>🎬 Tải video</span>
                <input
                  type="file"
                  accept="video/*"
                  @change="handleVideoUpload"
                  style="display: none"
                />
              </label>
            </div>

            <!-- Drag & Drop Zone -->
            <div
              class="upload-dropzone"
              :class="{ dragging: isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <p>🖱️ Kéo & thả ảnh/video vào đây</p>
              <p class="hint">Ảnh: JPG/PNG/GIF/WebP (tối đa 5) · Video: MP4/WebM/AVI/MOV/MKV (&lt;50MB)</p>
            </div>

            <!-- Upload Progress -->
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
              <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
              <span>{{ uploadProgress }}%</span>
            </div>

            <!-- Error Message -->
            <div v-if="uploadError" class="upload-error">
              ❌ {{ uploadError }}
            </div>

            <!-- Success Message -->
            <div v-if="uploadSuccess" class="upload-success">
              ✅ {{ uploadSuccess }}
            </div>

            <!-- Preview List -->
            <div v-if="mediaList.length" class="media-preview-grid">
              <div v-for="item in mediaList" :key="item.id || item.fileName" class="preview-card">
                <button
                  class="preview-remove"
                  type="button"
                  title="Xóa media"
                  @click.stop="removeMedia(item)"
                >
                  ✕
                </button>
                <img
                  v-if="item.type === 'image'"
                  :src="item.url"
                  :alt="item.fileName"
                  class="preview-image"
                />
                <div v-else class="preview-video">
                  <div class="video-icon">🎬</div>
                  <div class="video-label">Video</div>
                </div>
                <div class="preview-meta">
                  <div class="preview-name" :title="item.fileName">{{ item.fileName }}</div>
                  <div class="preview-size">{{ formatFileSize(item.size) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="handleClose" class="btn btn-secondary">
            ❌ Hủy
          </button>
          <button @click="handleSave" class="btn btn-primary">
            ✅ Lưu
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Chỉnh sửa Marker'
  },
  markerData: {
    type: Object,
    default: () => ({
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
    })
  }
});

const emit = defineEmits(['close', 'save']);

const localData = ref({ ...props.markerData });
const uploadProgress = ref(0);
const uploadError = ref('');
const uploadSuccess = ref('');
const mediaCount = ref({ images: 0, videos: 0 });
const mediaList = ref([]);
const pendingUploads = ref([]);
const isDragging = ref(false);

const fullAddress = computed(() => {
  const parts = [];
  if (localData.value.houseNumberOrOfficeName?.trim()) {
    parts.push(localData.value.houseNumberOrOfficeName);
  }
  if (localData.value.ward?.trim()) parts.push(localData.value.ward);
  if (localData.value.district?.trim()) parts.push(localData.value.district);
  if (localData.value.province?.trim()) parts.push(localData.value.province);
  if (localData.value.country?.trim()) parts.push(localData.value.country);
  return parts.length > 0 ? parts.join(', ') : 'Chưa có địa chỉ';
});

watch(() => props.markerData, (newData) => {
  localData.value = { ...newData };
  resetMediaState();
  if (newData.id) {
    fetchMedia(newData.id);
  }
}, { deep: true });

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    localData.value = { ...props.markerData };
    uploadProgress.value = 0;
    uploadError.value = '';
    uploadSuccess.value = '';
    resetMediaState();
    if (props.markerData.id) {
      fetchMedia(props.markerData.id);
    }
  } else {
    // Clear everything when modal closes
    resetMediaState();
    uploadProgress.value = 0;
    uploadError.value = '';
    uploadSuccess.value = '';
  }
});

function resetMediaState() {
  mediaCount.value = { images: 0, videos: 0 };
  mediaList.value = [];
  clearPendingUploads();
}

function clearPendingUploads() {
  pendingUploads.value.forEach(item => {
    if (item.objectUrl) {
      URL.revokeObjectURL(item.objectUrl);
    }
  });
  pendingUploads.value = [];
}

function refreshMediaCounts(list) {
  mediaCount.value.images = list.filter(m => m.type === 'image').length;
  mediaCount.value.videos = list.filter(m => m.type === 'video').length;
}

async function removeMedia(item) {
  uploadError.value = '';
  uploadSuccess.value = '';

  // Pending/staged file (not yet uploaded)
  if (!item?.id || item?.isPending) {
    pendingUploads.value = pendingUploads.value.filter(p => p.id !== item.id);
    if (item?.objectUrl) {
      URL.revokeObjectURL(item.objectUrl);
    }
    mediaList.value = mediaList.value.filter(m => m.id !== item.id);
    refreshMediaCounts(mediaList.value);
    uploadSuccess.value = 'Đã bỏ media khỏi danh sách';
    setTimeout(() => (uploadSuccess.value = ''), 2000);
    return;
  }

  // Persisted media on server
  try {
    const response = await fetch(`/api/media/${item.id}`, { method: 'DELETE' });
    const result = await response.json().catch(() => ({ success: false }));
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Xóa media thất bại');
    }

    mediaList.value = mediaList.value.filter(m => m.id !== item.id);
    refreshMediaCounts(mediaList.value);
    uploadSuccess.value = 'Đã xóa media';
    setTimeout(() => (uploadSuccess.value = ''), 2000);
  } catch (err) {
    uploadError.value = err.message || 'Xóa media thất bại';
  }
}

async function fetchMedia(landmarkId) {
  try {
    const response = await fetch(`/api/media/landmark/${landmarkId}`);
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      mediaList.value = result.data.map(item => ({
        id: item.id,
        type: item.media_type,
        fileName: item.file_name,
        url: `/api/media/serve/${landmarkId}/${item.file_name}`,
        size: item.file_size
      }));
      refreshMediaCounts(mediaList.value);
    }
  } catch (err) {
    console.error('Error fetching media count:', err);
  }
}

async function handleImageUpload(event) {
  const files = Array.from(event.target.files || []);
  if (files.length > 0) {
    await uploadMedia(files, 'images', 'landmark ' + localData.value.name);
  }
  event.target.value = '';
}

async function handleVideoUpload(event) {
  const files = Array.from(event.target.files || []);
  if (files.length > 0) {
    await uploadMedia(files, 'video', 'landmark ' + localData.value.name);
  }
  event.target.value = '';
}

async function handleDrop(event) {
  isDragging.value = false;
  const files = Array.from(event.dataTransfer?.files || []);
  if (!files.length) return;

  const images = files.filter(f => f.type.startsWith('image/'));
  const videos = files.filter(f => f.type.startsWith('video/'));

  if (images.length) {
    await uploadMedia(images, 'images', 'landmark ' + localData.value.name);
  }
  if (videos.length) {
    // Only take the first video to respect the 1-video rule
    await uploadMedia([videos[0]], 'video', 'landmark ' + localData.value.name);
  }
}

function stageMediaFiles(files, normalizedType) {
  const additions = [];
  const currentImages = mediaCount.value.images;
  const currentVideos = mediaCount.value.videos;

  if (normalizedType === 'image' && currentImages + files.length > 5) {
    uploadError.value = 'Tối đa 5 ảnh cho mỗi địa điểm';
    return;
  }
  if (normalizedType === 'video') {
    if (currentVideos >= 1) {
      uploadError.value = 'Chỉ được 1 video cho mỗi địa điểm';
      return;
    }
    files = files.slice(0, 1);
  }

  files.forEach((file) => {
    const objectUrl = URL.createObjectURL(file);
    const staged = {
      id: `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: normalizedType,
      fileName: file.name,
      url: objectUrl,
      size: file.size,
      file,
      objectUrl,
      isPending: true
    };
    pendingUploads.value.push(staged);
    additions.push(staged);
  });

  mediaList.value = [...mediaList.value, ...additions];
  refreshMediaCounts(mediaList.value);
  uploadSuccess.value = 'Đã thêm media (sẽ tải lên khi lưu)';
  setTimeout(() => (uploadSuccess.value = ''), 3000);
}

async function uploadMedia(files, fieldName, markerName) {
  uploadError.value = '';
  uploadSuccess.value = '';
  uploadProgress.value = 0;

  const normalizedType = fieldName === 'video' ? 'video' : 'image';

  if (!localData.value.id) {
    // Marker chưa lưu: chỉ stage tại FE, sẽ upload sau khi lưu marker
    stageMediaFiles(Array.from(files || []), normalizedType);
    return;
  }

  try {
    const formData = new FormData();
    for (const file of files) {
      formData.append(fieldName, file);
    }

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        uploadProgress.value = Math.round((e.loaded / e.total) * 100);
      }
    });

    const uploadPromise = new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => {
        uploadProgress.value = 0;
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            uploadSuccess.value = response.message;
            setTimeout(() => (uploadSuccess.value = ''), 3000);
            const newFiles = (response.files || []).map(f => ({
              id: f.id,
              type: f.type,
              fileName: f.fileName,
              url: f.url,
              size: f.size
            }));
            mediaList.value = [...mediaList.value, ...newFiles];
            refreshMediaCounts(mediaList.value);
            resolve();
          } else {
            uploadError.value = response.error || 'Lỗi khi tải lên';
            reject(new Error(response.error));
          }
        } else {
          const errorResponse = JSON.parse(xhr.responseText);
          uploadError.value = errorResponse.error || 'Lỗi khi tải lên';
          reject(new Error(errorResponse.error));
        }
      });

      xhr.addEventListener('error', () => {
        uploadProgress.value = 0;
        uploadError.value = 'Lỗi mạng khi tải lên';
        reject(new Error('Network error'));
      });

      xhr.open('POST', `/api/media/upload/${localData.value.id}`);
      xhr.send(formData);
    });

    await uploadPromise;
  } catch (err) {
    uploadProgress.value = 0;
    uploadError.value = err.message || 'Lỗi khi tải lên';
  }
}

function handleClose() {
  emit('close');
}

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function handleSave() {
  if (!localData.value.name?.trim()) {
    alert('⚠️ Vui lòng nhập tên địa điểm');
    return;
  }
  if (!localData.value.ward?.trim()) {
    alert('⚠️ Vui lòng nhập Phường/Xã');
    return;
  }
  if (!localData.value.district?.trim()) {
    alert('⚠️ Vui lòng nhập Quận/Huyện');
    return;
  }
  if (!localData.value.province?.trim()) {
    alert('⚠️ Vui lòng nhập Tỉnh/Thành phố');
    return;
  }
  const pending = pendingUploads.value.map(item => ({
    type: item.type,
    file: item.file,
    fileName: item.fileName,
    size: item.size
  }));
  emit('save', { ...localData.value, pendingUploads: pending });
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.section-header {
  font-weight: 600;
  color: #93c5fd;
  font-size: 14px;
  margin: 16px 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-header:first-child {
  margin-top: 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.form-row .form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #e2e8f0;
  font-size: 14px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 14px;
  transition: all 0.2s;
  font-family: inherit;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #64748b;
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.full-address-section {
  margin: 16px 0;
  padding: 12px 16px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 8px;
}

.full-address-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #86efac;
  font-size: 13px;
}

.full-address-display {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #bbf7d0;
  line-height: 1.5;
  word-break: break-word;
}

.coords-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #93c5fd;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Scrollbar styling */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Media Upload Section */
.media-upload-section {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.upload-info {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.upload-info p {
  margin: 4px 0;
}

.upload-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.upload-button {
  flex: 1;
  padding: 10px 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.upload-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.upload-button:active {
  transform: translateY(0);
}

.video-upload {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
}

.video-upload:hover {
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.upload-progress {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 4px;
  height: 24px;
  overflow: hidden;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 12px;
  color: #60a5fa;
  font-weight: 500;
}

.progress-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.upload-error {
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid #dc2626;
  color: #fca5a5;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 8px;
}

.upload-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid #22c55e;
  color: #86efac;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 8px;
}

.upload-dropzone {
  margin-top: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  background: rgba(15, 23, 42, 0.4);
  padding: 14px;
  border-radius: 8px;
  text-align: center;
  color: #cbd5e1;
  transition: all 0.2s;
}

.upload-dropzone.dragging {
  border-color: #60a5fa;
  background: rgba(59, 130, 246, 0.08);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.upload-dropzone .hint {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
}

.media-preview-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.preview-card {
  position: relative;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 140px;
}

.preview-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.preview-remove:hover {
  background: rgba(0, 0, 0, 0.85);
}

.preview-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  background: #0f172a;
}

.preview-video {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #cbd5e1;
}

.video-icon {
  font-size: 22px;
}

.video-label {
  font-size: 12px;
  color: #94a3b8;
}

.preview-meta {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-name {
  font-size: 12px;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-size {
  font-size: 11px;
  color: #94a3b8;
}

@media (max-width: 600px) {
  .modal-container {
    max-width: 95%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .upload-controls {
    flex-direction: column;
  }
}
</style>
