const collageContainer = document.getElementById("collage-container");
const frameSizeSelect = document.getElementById("frame-size");
const backgroundColorInput = document.getElementById("background-color");

let autoFillSettings = {
    margin: 50,
    rotation: 30,
    scale: 1,
    shadow: true,
    shadowIntensity: 30
};

document.addEventListener('DOMContentLoaded', function() {
    initializeRangeInputs();
    setFrameSize();
    initializeEventListeners();
});

function initializeEventListeners() {
    frameSizeSelect.addEventListener('change', setFrameSize);
    backgroundColorInput.addEventListener('input', (e) => {
        collageContainer.style.backgroundColor = e.target.value;
    });

    collageContainer.addEventListener("dragover", handleDragOver);
    collageContainer.addEventListener("dragleave", handleDragLeave);
    collageContainer.addEventListener("drop", handleDrop);
}

function initializeRangeInputs() {
    document.getElementById("margin-control").addEventListener('input', (e) => {
        autoFillSettings.margin = parseInt(e.target.value);
        applySpacingToAll(autoFillSettings.margin);
    });

    document.getElementById("rotation-control").addEventListener('input', (e) => {
        autoFillSettings.rotation = parseInt(e.target.value);
        applyRotationToAll(autoFillSettings.rotation);
    });

    document.getElementById("scale-control").addEventListener('input', (e) => {
        autoFillSettings.scale = parseInt(e.target.value) / 100;
        applyScaleToAll(autoFillSettings.scale);
    });

    document.getElementById("shadow-control").addEventListener('change', (e) => {
        autoFillSettings.shadow = e.target.checked;
        document.querySelectorAll(".photo-wrapper").forEach(applyImageShadow);
    });

    document.getElementById("shadow-intensity-control").addEventListener('input', (e) => {
        autoFillSettings.shadowIntensity = parseInt(e.target.value);
        document.querySelectorAll(".photo-wrapper").forEach(applyImageShadow);
    });
}

function setFrameSize() {
    const selectedRatio = frameSizeSelect.value;
    const [width, height] = selectedRatio.split(':').map(Number);
    
    const containerWidth = Math.min(window.innerWidth * 0.6, 800);
    const containerHeight = (containerWidth * height) / width;

    collageContainer.style.width = `${containerWidth}px`;
    collageContainer.style.height = `${containerHeight}px`;
}

function handleDragOver(event) {
    event.preventDefault();
    collageContainer.style.borderColor = "#4169E1";
    collageContainer.style.backgroundColor = "rgba(65, 105, 225, 0.1)";
}

function handleDragLeave(event) {
    event.preventDefault();
    collageContainer.style.borderColor = "#ddd";
    collageContainer.style.backgroundColor = backgroundColorInput.value;
}

function handleDrop(event) {
    event.preventDefault();
    collageContainer.style.borderColor = "#ddd";
    collageContainer.style.backgroundColor = backgroundColorInput.value;

    const files = [...event.dataTransfer.files].filter(file => file.type.startsWith('image/'));
    handleFiles(files);
}

function applyImageShadow(imgWrapper) {
    const intensity = autoFillSettings.shadow ? autoFillSettings.shadowIntensity / 100 : 0;
    imgWrapper.style.boxShadow = `0 4px 8px rgba(0, 0, 0, ${intensity})`;
}

function handleFiles(files) {
    if (!files.length) return;

    files.forEach(file => {
        const imgWrapper = createPhotoWrapper(file);
        collageContainer.appendChild(imgWrapper);
        const dropMessage = collageContainer.querySelector('.drop-message');
        if (dropMessage) dropMessage.style.display = 'none';
    });
}

function createPhotoWrapper(file) {
    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("photo-wrapper");

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.classList.add("photo");

    const resizeHandle = document.createElement("div");
    resizeHandle.classList.add("resize-handle");

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.innerHTML = "×";
    deleteButton.onclick = (e) => {
        e.stopPropagation();
        imgWrapper.remove();
        if (!collageContainer.querySelectorAll(".photo-wrapper").length) {
            const dropMessage = collageContainer.querySelector('.drop-message');
            if (dropMessage) dropMessage.style.display = 'flex';
        }
    };

    imgWrapper.appendChild(img);
    imgWrapper.appendChild(resizeHandle);
    imgWrapper.appendChild(deleteButton);

    enableInteractions(imgWrapper);

    img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const maxSize = Math.min(collageContainer.offsetWidth, collageContainer.offsetHeight) * 0.3;
        const width = aspectRatio >= 1 ? maxSize : maxSize * aspectRatio;
        const height = aspectRatio >= 1 ? maxSize / aspectRatio : maxSize;
        
        imgWrapper.style.width = `${width}px`;
        imgWrapper.style.height = `${height}px`;
        imgWrapper.style.left = `${(collageContainer.offsetWidth - width) / 2}px`;
        imgWrapper.style.top = `${(collageContainer.offsetHeight - height) / 2}px`;

        applyImageShadow(imgWrapper);
    };

    return imgWrapper;
}

function enableInteractions(imgWrapper) {
    let isDragging = false, isResizing = false, isRotating = false;
    let startX, startY, startWidth, startHeight, startAngle, currentRotation = 0;
    let aspectRatio;

    const img = imgWrapper.querySelector('img');
    img.onload = () => {
        aspectRatio = img.naturalWidth / img.naturalHeight;
    };

    imgWrapper.addEventListener("mousedown", (event) => {
        if (event.target.classList.contains("resize-handle")) {
            isResizing = true;
            startX = event.clientX;
            startY = event.clientY;
            startWidth = imgWrapper.offsetWidth;
            startHeight = imgWrapper.offsetHeight;
            aspectRatio = startWidth / startHeight;
        } else if (event.altKey) {
            isRotating = true;
            const rect = imgWrapper.getBoundingClientRect();
            startAngle = Math.atan2(event.clientY - rect.top, event.clientX - rect.left);
        } else if (!event.target.classList.contains("delete-button")) {
            isDragging = true;
            startX = event.clientX - imgWrapper.offsetLeft;
            startY = event.clientY - imgWrapper.offsetTop;
        }
    });

    document.addEventListener("mousemove", (event) => {
        if (isDragging) {
            imgWrapper.style.left = `${Math.max(0, Math.min(collageContainer.offsetWidth - imgWrapper.offsetWidth, event.clientX - startX))}px`;
            imgWrapper.style.top = `${Math.max(0, Math.min(collageContainer.offsetHeight - imgWrapper.offsetHeight, event.clientY - startY))}px`;
        } else if (isResizing) {
            imgWrapper.style.width = `${Math.max(50, startWidth + (event.clientX - startX))}px`;
            imgWrapper.style.height = `${Math.max(50, startHeight + (event.clientY - startY))}px`;
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = isResizing = isRotating = false;
    });
}

function applySpacingToAll(spacing) {
    const photos = document.querySelectorAll('.photo-wrapper');
    if (photos.length < 2) return;

    const containerRect = collageContainer.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    if (spacing === 0) {
        photos.forEach(photo => {
            photo.style.left = `${centerX - photo.offsetWidth / 2}px`;
            photo.style.top = `${centerY - photo.offsetHeight / 2}px`;
        });
        return;
    }

    const minDistance = (spacing / 100) * Math.min(containerRect.width, containerRect.height) * 0.5;

    photos.forEach((photo, index) => {
        const angle = (index / photos.length) * 2 * Math.PI;
        const x = centerX + minDistance * Math.cos(angle);
        const y = centerY + minDistance * Math.sin(angle);
        photo.style.left = `${x - photo.offsetWidth / 2}px`;
        photo.style.top = `${y - photo.offsetHeight / 2}px`;
    });
}

function applyRotationToAll(maxRotation) {
    document.querySelectorAll('.photo-wrapper').forEach(photo => {
        photo.style.transform = `rotate(${(Math.random() - 0.5) * 2 * maxRotation}deg)`;
    });
}

function applyScaleToAll(scale) {
    document.querySelectorAll('.photo-wrapper').forEach(photo => {
        const width = parseFloat(photo.style.width) || 100;
        const height = parseFloat(photo.style.height) || 100;
        photo.style.width = `${width * scale}px`;
        photo.style.height = `${height * scale}px`;
    });
}

function autoFill() {
    const photos = Array.from(document.querySelectorAll('.photo-wrapper'));
    if (photos.length === 0) return;

    const containerWidth = collageContainer.offsetWidth;
    const containerHeight = collageContainer.offsetHeight;

    const columns = Math.ceil(Math.sqrt(photos.length));
    const rows = Math.ceil(photos.length / columns);

    const cellWidth = containerWidth / columns;
    const cellHeight = containerHeight / rows;

    photos.forEach((photo, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);

        const x = col * cellWidth + (cellWidth - photo.offsetWidth) / 2;
        const y = row * cellHeight + (cellHeight - photo.offsetHeight) / 2;

        photo.style.left = `${x}px`;
        photo.style.top = `${y}px`;

        const randomRotation = (Math.random() - 0.5) * 2 * autoFillSettings.rotation;
        photo.style.transform = `rotate(${randomRotation}deg)`;
    });
}

function clearCollage() {
    document.querySelectorAll('.photo-wrapper').forEach(photo => photo.remove());
    const dropMessage = collageContainer.querySelector('.drop-message');
    if (dropMessage) dropMessage.style.display = 'flex';
}

async function captureCollage() {
    const resizeHandles = document.querySelectorAll('.resize-handle');
    const deleteButtons = document.querySelectorAll('.delete-button');

    // Temporarily hide resize handles and delete buttons for clean export
    resizeHandles.forEach(handle => handle.classList.add('hide-for-capture'));
    deleteButtons.forEach(button => button.classList.add('hide-for-capture'));

    try {
        const canvas = await html2canvas(collageContainer, {
            backgroundColor: backgroundColorInput.value,
            scale: 2, // Higher quality
            logging: false
        });

        // Create download link
        const link = document.createElement('a');
        link.download = 'collage.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
    } catch (error) {
        console.error('Error capturing collage:', error);
        alert('Une erreur est survenue lors de l\'exportation du collage.');
    }

    // Restore visibility of resize handles and delete buttons
    resizeHandles.forEach(handle => handle.classList.remove('hide-for-capture'));
    deleteButtons.forEach(button => button.classList.remove('hide-for-capture'));
}

window.addEventListener('resize', setFrameSize);