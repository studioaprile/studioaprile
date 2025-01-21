// Gallery Data: Contains the main image and additional carousel images
const galleryData = [
    {
        src: './images/DSC06565.jpg', // Fullscreen image for lightbox
        thumbnail: './thumbnails/DSC06565.jpg', // Thumbnail for the grid
        title: 'DSC06565',
        material: 'Oak Wood from Scotland',
        size: '25 cm x 35 cm',
        year: '2025',
        carouselImages: ['./images/DSC06565.jpg', './images/DSC06565b.jpg', './images/DSC06565c.jpg', './images/DSC06565d.jpg']
    },
    {
        src: './images/DSC06571.jpg',
        thumbnail: './thumbnails/DSC06571.jpg', 
        title: 'DSC06571',
        material: 'Oak Wood',
        size: '30 cm x 20 cm',
        year: '2024',
        carouselImages: ['./images/DSC06571.jpg', './images/DSC06571b.jpg', './images/DSC06571c.jpg', './images/DSC06571d.jpg']
    },
    {
        src: './images/DSC06574.jpg',
        thumbnail: './thumbnails/DSC06574.jpg', 
        title: 'DSC06574',
        material: 'Oak Wood',
        size: '25 cm x 30 cm',
        year: '2024',
        carouselImages: ['./images/DSC06574.jpg', './images/DSC06574b.jpg', './images/DSC06574c.jpg', './images/DSC06574d.jpg']
    },
    {
        src: './images/DSC06580.jpg',
        thumbnail: './thumbnails/DSC06580.jpg', 
        title: 'DSC06580',
        material: 'Oak Wood',
        size: '25 cm x 30 cm',
        year: '2024',
        carouselImages: ['./images/DSC06580.jpg', './images/DSC06580b.jpg', './images/DSC06580c.jpg', './images/DSC06580d.jpg']
    },
    {
        src: './images/DSC06588.jpg',
        thumbnail: './thumbnails/DSC06588.jpg', 
        title: 'DSC06588',
        material: 'Oak Wood',
        size: '25 cm x 30 cm',
        year: '2024',
        carouselImages: ['./images/DSC06588.jpg', './images/DSC06588b.jpg', './images/DSC06588c.jpg', './images/DSC06588d.jpg']
    },
    {
        src: './images/DSC06590.jpg',
        thumbnail: './thumbnails/DSC06590.jpg', 
        title: 'DSC06590',
        material: 'Oak Wood',
        size: '25 cm x 30 cm',
        year: '2024',
        carouselImages: ['./images/DSC06590.jpg', './images/DSC06590b.jpg', './images/DSC06590c.jpg', './images/DSC06590d.jpg']
    },
    {
        src: './images/DSC06594.jpg',
        thumbnail: './thumbnails/DSC06594.jpg', 
        title: 'DSC06594',
        material: 'Oak Wood',
        size: '25 cm x 30 cm',
        year: '2024',
        carouselImages: ['./images/DSC06594.jpg', './images/DSC06594b.jpg', './images/DSC06594c.jpg', './images/DSC06594d.jpg']
    },
    {
        src: './images/DSC06597.jpg',
        thumbnail: './thumbnails/DSC06598.jpg', 
        title: 'DSC06597',
        material: 'Oak Wood',
        size: '25 cm x 30 cm',
        year: '2024',
        carouselImages: ['./images/DSC06597.jpg', './images/DSC06597b.jpg', './images/DSC06597c.jpg', './images/DSC06597d.jpg']
    }

    // Add more gallery items as needed
];

// Step 1: Get the gallery grid container from the HTML
const galleryGrid = document.getElementById('gallery-grid');

// Step 2: Check if the gallery grid exists
if (galleryGrid) {
    // Step 3: Dynamically render gallery items into the grid
    galleryData.forEach(item => {
        const itemDiv = document.createElement('div'); // Create a container for the grid item
        itemDiv.classList.add('item'); // Add a CSS class for styling

        // Add HTML for the grid item
        itemDiv.innerHTML = `
            <a href="${item.src}" 
               data-carousel='${JSON.stringify(item.carouselImages)}' 
               data-title="${item.title}" 
               data-material="${item.material}" 
               data-size="${item.size}" 
               data-year="${item.year}">
                <img src="${item.thumbnail}" alt="${item.title}"> <!-- Use thumbnail for the grid -->
            </a>
            <div class="description">
                <p><strong>${item.title}</strong></p>
                <p>Material: ${item.material}</p>
                <p>Size: ${item.size}</p>
                <p>Year: ${item.year}</p>
            </div>
        `;

        galleryGrid.appendChild(itemDiv); // Append the grid item to the container
    });

    // Step 4: Add an event listener to open the lightbox
    galleryGrid.addEventListener('click', event => {
        const link = event.target.closest('a'); // Ensure the clicked element is a valid link
        if (!link) return; // Exit if not a link
        event.preventDefault(); // Prevent default behavior

        // Step 5: Safely parse `data-carousel` or handle errors
        let carouselImages;
        try {
            carouselImages = JSON.parse(link.getAttribute('data-carousel'));
            if (!Array.isArray(carouselImages) || carouselImages.length === 0) {
                throw new Error('Invalid or empty carousel data');
            }
        } catch (error) {
            console.error('Failed to parse carousel data:', error);
            alert('An error occurred while loading the carousel.');
            return; // Exit if data is invalid
        }

        // Retrieve other data attributes
        const title = link.getAttribute('data-title') || 'Untitled';
        const material = link.getAttribute('data-material') || 'Unknown Material';
        const size = link.getAttribute('data-size') || 'Unknown Size';
        const year = link.getAttribute('data-year') || 'Unknown Year';

        let currentIndex = 0; // Track the current image index

        // Step 6: Create the lightbox
        const lightbox = document.createElement('div');
        lightbox.classList.add('lightbox');
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <img src="${carouselImages[currentIndex]}" alt="${title}" loading="lazy">
                <div class="lightbox-description">
                    <p><strong>${title}</strong></p>
                    <p>Material: ${material}</p>
                    <p>Size: ${size}</p>
                    <p>Year: ${year}</p>
                </div>
                <div class="carousel-controls">
                    <button class="prev-btn">&lt;</button> <!-- Previous button -->
                    <button class="next-btn">&gt;</button> <!-- Next button -->
                </div>
                <button class="lightbox-close">&times;</button> <!-- Close button -->
            </div>
        `;

        document.body.appendChild(lightbox); // Append the lightbox to the body

        // Get references to the lightbox elements
        const imgElement = lightbox.querySelector('img'); // Lightbox image
        const prevBtn = lightbox.querySelector('.prev-btn'); // Previous button
        const nextBtn = lightbox.querySelector('.next-btn'); // Next button

        // Function to update the image in the lightbox
        const updateImage = (index) => {
            imgElement.src = carouselImages[index];
        };

        // Step 7: Add event listeners for carousel navigation
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + carouselImages.length) % carouselImages.length;
            updateImage(currentIndex);
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % carouselImages.length;
            updateImage(currentIndex);
        });

        // Step 8: Add functionality to close the lightbox
        const closeLightbox = () => {
            lightbox.remove(); // Remove the lightbox from the DOM
        };

        // Close when clicking the close button
        lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);

        // Close when clicking outside the lightbox content
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        // Close when pressing the Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        }, { once: true }); // Ensure the event listener runs only once
    });
} else {
    console.error('Gallery grid container not found!'); // Log an error if the gallery grid is missing
}
