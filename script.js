// 1. Define the gallery data array
const galleryData = [
    {
        src: './images/image1.jpg',
        title: 'Wooden Bowl',
        material: 'Oak Wood',
        size: '25 cm x 15 cm',
        year: '2023',
    },
    {
        src: './images/image2.jpg',
        title: 'Vase',
        material: 'Maple Wood',
        size: '30 cm x 20 cm',
        year: '2022',
    },
    {
        src: './images/image3.jpg',
        title: 'Sculpture',
        material: 'Walnut Wood',
        size: '50 cm x 25 cm',
        year: '2021',
    },
    // Add more items as needed
];

// 2. Dynamically render the gallery on the homepage
const galleryGrid = document.getElementById('gallery-grid'); // Reference the container

galleryData.forEach(item => {
    const itemDiv = document.createElement('div'); // Create the grid item
    itemDiv.classList.add('item');

    // Add HTML for the image and description
     itemDiv.innerHTML = `
        <a href="${item.src}" 
           data-title="${item.title}" 
           data-material="${item.material}" 
           data-size="${item.size}" 
           data-year="${item.year}">
            <img src="${item.src}" alt="${item.title}">
        </a>
        <div class="description">
            <p><strong>${item.title}</strong></p>
            <p>Material: ${item.material}</p>
            <p>Size: ${item.size}</p>
            <p>Year: ${item.year}</p>
        </div>
    `;

    galleryGrid.appendChild(itemDiv); // Append the item to the grid
});

// 3. Add lightbox functionality for image click
galleryGrid.addEventListener('click', event => {
    const link = event.target.closest('a'); // Ensure the clicked element is a link
    if (!link) return; // Exit if not clicking on an image link
    event.preventDefault();

    // Get the data attributes
    const imgSrc = link.getAttribute('href');
    const title = link.getAttribute('data-title') || 'Untitled';
    const material = link.getAttribute('data-material') || 'Unknown Material';
    const size = link.getAttribute('data-size') || 'Unknown Size';
    const year = link.getAttribute('data-year') || 'Unknown Year';

     // Debugging: Log the fetched values
    console.log('Image Source:', imgSrc);
    console.log('Title:', title);
    console.log('Material:', material);
    console.log('Size:', size);
    console.log('Year:', year);

    // Create and show the lightbox
    const lightbox = document.createElement('div');
    lightbox.classList.add('lightbox');
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="${imgSrc}" alt="${title}">
            <div class="lightbox-description">
                <p><strong>${title}</strong></p>
                <p>Material: ${material}</p>
                <p>Size: ${size}</p>
                <p>Year: ${year}</p>
            </div>
            <span class="lightbox-close">&times;</span>
        </div>
    `;
    document.body.appendChild(lightbox);

    // Close the lightbox when the close button is clicked
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
        lightbox.remove();
    });

    // Close the lightbox when clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.remove();
    });
});
