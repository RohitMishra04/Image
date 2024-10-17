// script.js
const dropArea = document.getElementById('dropArea');
const uploadImage = document.getElementById('uploadImage');
const originalCanvas = document.getElementById('originalCanvas');
const enhancedCanvas = document.getElementById('enhancedCanvas');
const originalCtx = originalCanvas.getContext('2d');
const enhancedCtx = enhancedCanvas.getContext('2d');
const enhanceButton = document.getElementById('enhanceButton');
const downloadButton = document.getElementById('downloadButton');
const buttonContainer = document.querySelector('.button-container');
const spinner = document.getElementById('spinner');
let imageDataOriginal, imageDataEnhanced, image;

// Handle drag-and-drop
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    }
});

// Handle click on drop area to open file dialog
dropArea.addEventListener('click', () => {
    uploadImage.click();
});

// Handle file upload through input
uploadImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loadImage(file);
    }
});

// Function to load and draw image on both canvases
function loadImage(file) {
    image = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
        image.onload = () => {
            originalCanvas.width = enhancedCanvas.width = image.width;
            originalCanvas.height = enhancedCanvas.height = image.height;
            originalCtx.drawImage(image, 0, 0);
            enhancedCtx.drawImage(image, 0, 0);
            imageDataOriginal = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
            imageDataEnhanced = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
            buttonContainer.classList.remove('hidden');  // Show buttons
        };
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Apply sharpen filter on button click
enhanceButton.addEventListener('click', () => {
    enhanceButton.disabled = true;
    downloadButton.disabled = true;
    spinner.classList.remove('hidden'); // Show spinner

    // Simulate processing time with setTimeout
    setTimeout(() => {
        const sections = 4; // Divide image into sections
        const width = enhancedCanvas.width / sections;
        const height = enhancedCanvas.height / sections;

        for (let i = 0; i < sections; i++) {
            for (let j = 0; j < sections; j++) {
                let sectionData = enhancedCtx.getImageData(i * width, j * height, width, height);
                let sharpenedData = applySharpen(sectionData);
                enhancedCtx.putImageData(sharpenedData, i * width, j * height);
            }
        }

        spinner.classList.add('hidden'); // Hide spinner
        downloadButton.classList.remove('hidden');  // Show download button
        enhanceButton.disabled = false;
        downloadButton.disabled = false;
    }, 1000); // Adjust time as needed
});

// Function to apply the sharpen filter using a convolution kernel
function applySharpen(imageData) {
    const sharpenKernel = [
        [ 0, -1,  0],
        [-1,  5, -1],
        [ 0, -1,  0]
    ];

    const { width, height, data } = imageData;
    const result = new Uint8ClampedArray(data);

    for (let x = 1; x < width - 1; x++) {
        for (let y = 1; y < height - 1; y++) {
            let r = 0, g = 0, b = 0;

            for (let kernelX = 0; kernelX < 3; kernelX++) {
                for (let kernelY = 0; kernelY < 3; kernelY++) {
                    const pixelX = x + kernelX - 1;
                    const pixelY = y + kernelY - 1;
                    const idx = (pixelY * width + pixelX) * 4;

                    r += data[idx] * sharpenKernel[kernelX][kernelY];
                    g += data[idx + 1] * sharpenKernel[kernelX][kernelY];
                    b += data[idx + 2] * sharpenKernel[kernelX][kernelY];
                }
            }

            const i = (y * width + x) * 4;
            result[i] = Math.min(Math.max(r, 0), 255);
            result[i + 1] = Math.min(Math.max(g, 0), 255);
            result[i + 2] = Math.min(Math.max(b, 0), 255);
        }
    }

    imageData.data.set(result);
    return imageData;
}

// Download the enhanced image
downloadButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'enhanced_image.png';
    link.href = enhancedCanvas.toDataURL('image/png');
    link.click();
});
