export class ImageLibrary {
    constructor(onImageSelect) {
        this.onImageSelect = onImageSelect;
        this.modal = document.getElementById('image-library-modal');
        this.grid = document.getElementById('image-grid');
        this.closeBtn = document.getElementById('close-library-btn');
        this.loadMoreBtn = document.getElementById('load-more-btn');

        this.page = 1;
        this.limit = 20;
        this.isLoading = false;

        this.init();
    }

    init() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => this.loadImages());
        }

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    open() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            if (this.grid.children.length === 0) {
                this.loadImages();
            }
        }
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    async loadImages() {
        if (this.isLoading) return;
        this.isLoading = true;

        if (this.loadMoreBtn) this.loadMoreBtn.textContent = 'Loading...';

        try {
            const response = await fetch(`https://picsum.photos/v2/list?page=${this.page}&limit=${this.limit}`);
            const images = await response.json();

            this.renderImages(images);
            this.page++;
        } catch (error) {
            console.error('Failed to load images:', error);
            alert('Failed to load images. Please check your internet connection.');
        } finally {
            this.isLoading = false;
            if (this.loadMoreBtn) this.loadMoreBtn.textContent = 'Load More';
        }
    }

    renderImages(images) {
        images.forEach(imgData => {
            const item = document.createElement('div');
            item.className = 'image-item';

            // Use lower resolution for thumbnails
            const thumbUrl = `https://picsum.photos/id/${imgData.id}/300/200`;
            const fullUrl = `https://picsum.photos/id/${imgData.id}/${imgData.width}/${imgData.height}`; // Or a reasonable max size

            const img = document.createElement('img');
            img.src = thumbUrl;
            img.alt = imgData.author;
            img.loading = 'lazy';

            const author = document.createElement('div');
            author.className = 'image-author';
            author.textContent = imgData.author;

            item.appendChild(img);
            item.appendChild(author);

            item.addEventListener('click', () => {
                this.selectImage(imgData.download_url); // Use download_url for high quality
            });

            this.grid.appendChild(item);
        });
    }

    selectImage(url) {
        // Show loading state?
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Important for canvas manipulation
        img.onload = () => {
            this.onImageSelect(img);
            this.close();
        };
        img.onerror = () => {
            alert('Failed to load selected image.');
        };
        img.src = url;
    }
}
