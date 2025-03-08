// Select the gallery container
const galleryGrid = document.getElementById('gallery-grid');

// Populate gallery with images and descriptions
if (galleryGrid) {
    galleryData.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        itemDiv.innerHTML = `
            <a href="#" data-index="${index}">
                <img src="${item.thumbnail}" alt="${item.title}">
            </a>
            <div class="description">
                <p><strong>${item.title}</strong></p>
                <p>${item.description}</p>
            </div>
        `;
        galleryGrid.appendChild(itemDiv);
    });

    // Click event listener for lightbox activation
    galleryGrid.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link) return;
        event.preventDefault();

        const itemIndex = parseInt(link.getAttribute('data-index'));
        openLightbox(itemIndex);
    });
}

// Open lightbox function
function openLightbox(startIndex) {
    const lightbox = document.createElement('div');
    lightbox.classList.add('lightbox');

    // Lightbox content
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close">&times;</button>
            <img id="lightbox-image" src="${galleryData[startIndex].src}" alt="${galleryData[startIndex].title}">
            <div class="lightbox-description">
                <p id="lightbox-title"><strong>${galleryData[startIndex].title}</strong></p>
                <p id="lightbox-material">${galleryData[startIndex].description}</p>
            </div>
            <div class="lightbox-controls">
                <button id="prev-btn">&lt;</button>
                <button id="next-btn">&gt;</button>
            </div>
        </div>
    `;

    document.body.appendChild(lightbox);
    let currentIndex = startIndex;

    function updateLightbox(index) {
        const item = galleryData[index];
        document.getElementById('lightbox-image').src = item.src;
        document.getElementById('lightbox-title').innerText = item.title;
        document.getElementById('lightbox-material').innerText = `${item.description}`;
    }

    document.getElementById('prev-btn').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
        updateLightbox(currentIndex);
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % galleryData.length;
        updateLightbox(currentIndex);
    });

    document.querySelector('.lightbox-close').addEventListener('click', () => lightbox.remove());
}
