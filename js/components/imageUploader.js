// Image Uploader & Clipboard Paste Component for Multimodal OCR

export class ImageUploader {
  constructor({ dropzoneEl, inputEl, previewContainerEl, previewImageEl, onImageSelected, onImageCleared }) {
    this.dropzoneEl = dropzoneEl;
    this.inputEl = inputEl;
    this.previewContainerEl = previewContainerEl;
    this.previewImageEl = previewImageEl;
    this.onImageSelected = onImageSelected;
    this.onImageCleared = onImageCleared;
    this.currentImageData = null;

    this.init();
  }

  init() {
    if (!this.dropzoneEl || !this.inputEl) return;

    // File input change
    this.inputEl.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) this.processFile(file);
    });

    // Dropzone click
    this.dropzoneEl.addEventListener("click", () => {
      this.inputEl.click();
    });

    // Drag & Drop
    ["dragenter", "dragover"].forEach(eventName => {
      this.dropzoneEl.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropzoneEl.classList.add("border-blue-500", "bg-blue-50/50");
      });
    });

    ["dragleave", "drop"].forEach(eventName => {
      this.dropzoneEl.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropzoneEl.classList.remove("border-blue-500", "bg-blue-50/50");
      });
    });

    this.dropzoneEl.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        this.processFile(file);
      }
    });

    // Global Clipboard Paste (Ctrl+V)
    window.addEventListener("paste", (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            this.processFile(file);
            break;
          }
        }
      }
    });
  }

  processFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64Data = dataUrl.split(",")[1];
      const mimeType = file.type || "image/jpeg";

      this.currentImageData = { mimeType, base64Data, dataUrl };
      
      // Update UI preview
      if (this.previewImageEl) {
        this.previewImageEl.src = dataUrl;
      }
      if (this.previewContainerEl) {
        this.previewContainerEl.classList.remove("hidden");
      }
      if (this.dropzoneEl) {
        this.dropzoneEl.classList.add("hidden");
      }

      if (this.onImageSelected) {
        this.onImageSelected(this.currentImageData);
      }
    };
    reader.readAsDataURL(file);
  }

  clear() {
    this.currentImageData = null;
    if (this.inputEl) this.inputEl.value = "";
    if (this.previewImageEl) this.previewImageEl.src = "";
    if (this.previewContainerEl) this.previewContainerEl.classList.add("hidden");
    if (this.dropzoneEl) this.dropzoneEl.classList.remove("hidden");

    if (this.onImageCleared) {
      this.onImageCleared();
    }
  }

  getImageData() {
    return this.currentImageData;
  }
}
