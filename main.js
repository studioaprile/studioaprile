// Dynamically Render the Gallery
const galleryGrid = document.getElementById('gallery-grid');

if (galleryGrid) {
    galleryData.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        itemDiv.innerHTML = `
            <a href="?item=${index}" 
               data-carousel='${JSON.stringify(item.carouselImages)}' 
               data-title="${item.title}" 
               data-material="${item.material}" 
               data-size="${item.size}" 
               data-year="${item.year}">
                <img src="${item.thumbnail}" alt="${item.title}">
            </a>
            <div class="description">
                <p><strong>${item.title}</strong></p>
                <p>Material: ${item.material}</p>
                <p>Size: ${item.size}</p>
                <p>Year: ${item.year}</p>
            </div>
        `;
        galleryGrid.appendChild(itemDiv);
    });

    // Handle Gallery Item Clicks
    galleryGrid.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link) return;
        event.preventDefault();

        const queryParams = new URLSearchParams(window.location.search);
        const isMobile = window.matchMedia('(max-width: 600px)').matches;
        const images = JSON.parse(link.getAttribute('data-carousel')) || [link.href];
        const title = link.getAttribute('data-title') || 'Untitled';
        const material = link.getAttribute('data-material') || 'Unknown Material';
        const size = link.getAttribute('data-size') || 'Unknown Size';
        const year = link.getAttribute('data-year') || 'Unknown Year';

        if (isMobile) {
            queryParams.set('item', link.href.split('item=')[1]);
            window.location.search = queryParams.toString();
        } else {
            // Desktop Lightbox Logic
            openLightbox({ images, title, material, size, year });
        }
    });

    // Check URL Query Parameters for Item
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('item');
    if (itemId) {
        const item = galleryData[itemId];
        if (item) {
            renderMobilePage(item);
        }
    }
} else {
    console.error('Gallery grid container not found!');
}

// Helper Functions
function renderMobilePage(item) {
    // Create Mobile Page
    const mobilePage = document.createElement('div');
    mobilePage.classList.add('mobile-page');
    mobilePage.innerHTML = `
        <header>
            <button class="back-button">Back</button>
        </header>
        <main>
            <h1>${item.title}</h1>
            <p><strong>Material:</strong> ${item.material}</p>
            <p><strong>Size:</strong> ${item.size}</p>
            <p><strong>Year:</strong> ${item.year}</p>
            <div class="mobile-images">
                ${item.carouselImages
                    .map((img) => `<img src="${img}" alt="${item.title}">`)
                    .join('')}
            </div>
        </main>
    `;
    document.body.innerHTML = ''; // Clear existing content
    document.body.appendChild(mobilePage);

    // Add functionality to the Back button
    const backButton = document.querySelector('.back-button');
    backButton.addEventListener('click', () => {
        window.location.search = ''; // Reset to gallery
    });
}

function openLightbox({ images, title, material, size, year }) {
    const lightbox = document.createElement('div');
    lightbox.classList.add('lightbox', 'carousel-lightbox');
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close">&times;</button>
            <img src="${images[0]}" alt="${title}">
            <div class="carousel-controls">
                <button class="prev-btn">&lt;</button>
                <button class="next-btn">&gt;</button>
            </div>
            <div class="lightbox-description">
                <p><strong>${title}</strong></p>
                <p>Material: ${material}</p>
                <p>Size: ${size}</p>
                <p>Year: ${year}</p>
            </div>
        </div>
    `;
    document.body.appendChild(lightbox);

    // Carousel Logic
    const imgElement = lightbox.querySelector('img');
    const prevBtn = lightbox.querySelector('.prev-btn');
    const nextBtn = lightbox.querySelector('.next-btn');
    let currentIndex = 0;

    const updateImage = (index) => {
        imgElement.src = images[index];
    };

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImage(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % images.length;
        updateImage(currentIndex);
    });

    const closeBtn = lightbox.querySelector('.lightbox-close');
    closeBtn.addEventListener('click', () => lightbox.remove());
}
