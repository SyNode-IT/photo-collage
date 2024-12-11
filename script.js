const collageContainer = document.getElementById("collage-container");
const photoInput = document.getElementById("photo-input");

let autoFillSettings = {
    margin: 100,
    rotation: 15,
    scale: 0.3,
    shadow: true
};

collageContainer.addEventListener("dragover", (event) => {
    event.preventDefault();
    collageContainer.style.outline = "2px dashed yellow";
});

collageContainer.addEventListener("dragleave", () => {
    collageContainer.style.outline = "none";
});

collageContainer.addEventListener("drop", (event) => {
    event.preventDefault();
    collageContainer.style.outline = "none";
    const files = event.dataTransfer.files;
    handleFiles(files);
});

function addPhoto() {
    photoInput.click();
}

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith("image/")) {
            const img = document.createElement("div");
            img.classList.add("photo-wrapper");

            const image = document.createElement("img");
            image.src = URL.createObjectURL(file);
            image.classList.add("photo");

            img.appendChild(image);

            const resizeHandle = document.createElement("div");
            resizeHandle.classList.add("resize-handle");
            img.appendChild(resizeHandle);

            collageContainer.appendChild(img);

            image.onload = () => {
                const aspectRatio = image.naturalWidth / image.naturalHeight;
                const maxSize = Math.min(collageContainer.offsetWidth, collageContainer.offsetHeight) * 0.5;
                const width = aspectRatio >= 1 ? maxSize : maxSize * aspectRatio;
                const height = aspectRatio >= 1 ? maxSize / aspectRatio : maxSize;
                
                img.style.width = `${width}px`;
                img.style.height = `${height}px`;
                img.style.left = `${(collageContainer.offsetWidth - width) / 2}px`;
                img.style.top = `${(collageContainer.offsetHeight - height) / 2}px`;
                
                applyImageShadow(img);
            };

            enableInteractions(img);
        }
    });
}

function enableInteractions(imgWrapper) {
    let isDragging = false;
    let isResizing = false;
    let isRotating = false;
    let startX, startY, startWidth, startHeight, startAngle;

    imgWrapper.addEventListener("mousedown", (event) => {
        if (event.target.classList.contains("resize-handle")) {
            isResizing = true;
            startX = event.clientX;
            startY = event.clientY;
            startWidth = imgWrapper.offsetWidth;
            startHeight = imgWrapper.offsetHeight;
        } else if (event.altKey) {
            isRotating = true;
            const rect = imgWrapper.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            startAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
        } else {
            isDragging = true;
            startX = event.clientX - imgWrapper.offsetLeft;
            startY = event.clientY - imgWrapper.offsetTop;
        }
        imgWrapper.style.cursor = isResizing ? "nwse-resize" : (isRotating ? "grab" : "move");
    });

    document.addEventListener("mousemove", (event) => {
        if (isDragging) {
            const newX = event.clientX - startX;
            const newY = event.clientY - startY;
            imgWrapper.style.left = `${newX}px`;
            imgWrapper.style.top = `${newY}px`;
        } else if (isResizing) {
            const newWidth = startWidth + (event.clientX - startX);
            const newHeight = startHeight + (event.clientY - startY);
            imgWrapper.style.width = `${newWidth}px`;
            imgWrapper.style.height = `${newHeight}px`;
        } else if (isRotating) {
            const rect = imgWrapper.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
            const rotation = angle - startAngle;
            imgWrapper.style.transform = `rotate(${rotation}rad)`;
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        isResizing = false;
        isRotating = false;
        imgWrapper.style.cursor = "grab";
    });

    imgWrapper.ondragstart = () => false;
}

function autoFill() {
    const images = document.querySelectorAll(".photo-wrapper");
    if (images.length === 0) {
        alert("Aucune image à redisposer.");
        return;
    }

    const containerWidth = collageContainer.offsetWidth;
    const containerHeight = collageContainer.offsetHeight;
    const placedCenters = [];

    images.forEach((imgWrapper) => {
        const img = imgWrapper.querySelector("img");
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const maxSize = Math.min(containerWidth, containerHeight) * autoFillSettings.scale;
        const width = aspectRatio >= 1 ? maxSize : maxSize * aspectRatio;
        const height = aspectRatio >= 1 ? maxSize / aspectRatio : maxSize;
        
        let x, y;
        let attempts = 0;
        const maxAttempts = 50;

        do {
            x = Math.random() * (containerWidth - width);
            y = Math.random() * (containerHeight - height);
            attempts++;
        } while (isTooClose(x + width/2, y + height/2, placedCenters, autoFillSettings.margin) && attempts < maxAttempts);

        imgWrapper.style.left = `${x}px`;
        imgWrapper.style.top = `${y}px`;
        imgWrapper.style.width = `${width}px`;
        imgWrapper.style.height = `${height}px`;

        const rotation = Math.random() * autoFillSettings.rotation * 2 - autoFillSettings.rotation;
        imgWrapper.style.transform = `rotate(${rotation}deg)`;

        placedCenters.push({x: x + width/2, y: y + height/2});
        
        applyImageShadow(imgWrapper);
    });
}

function isTooClose(x, y, centers, minDistance) {
    return centers.some(center => 
        Math.sqrt(Math.pow(center.x - x, 2) + Math.pow(center.y - y, 2)) < minDistance
    );
}

function applyImageShadow(imgWrapper) {
    if (autoFillSettings.shadow) {
        imgWrapper.style.boxShadow = "5px 5px 10px rgba(0,0,0,0.3)";
    } else {
        imgWrapper.style.boxShadow = "none";
    }
}

function applyAutoFillSettings() {
    const marginControl = document.getElementById("margin-control");
    const rotationControl = document.getElementById("rotation-control");
    const scaleControl = document.getElementById("scale-control");
    const shadowControl = document.getElementById("shadow-control");

    autoFillSettings.margin = parseInt(marginControl.value);
    autoFillSettings.rotation = parseInt(rotationControl.value);
    autoFillSettings.scale = parseFloat(scaleControl.value);
    autoFillSettings.shadow = shadowControl.checked;

    document.querySelectorAll(".photo-wrapper").forEach(applyImageShadow);

    autoFill();
}

photoInput.addEventListener("change", (event) => {
    handleFiles(event.target.files);
});

function setFrameSize() {
    const frameSizeSelect = document.getElementById("frame-size");
    const selectedRatio = frameSizeSelect.value;
    const [width, height] = selectedRatio.split(':').map(Number);
    const containerWidth = window.innerWidth * 0.8;
    let containerHeight;

    if (width > height) {
        containerHeight = (containerWidth / width) * height;
    } else {
        containerHeight = (containerWidth / height) * width;
    }

    collageContainer.style.width = `${containerWidth}px`;
    collageContainer.style.height = `${containerHeight}px`;
}

function captureCollage() {
    document.getElementById('menu').classList.add('hide-for-capture');
    document.getElementById('frame-selector').classList.add('hide-for-capture');
    document.getElementById('autofill-controls').classList.add('hide-for-capture');
    document.getElementById('instructions').classList.add('hide-for-capture');
    collageContainer.style.border = 'none';

    document.querySelectorAll('.resize-handle').forEach(handle => {
        handle.classList.add('hide-for-capture');
    });

    html2canvas(collageContainer, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true
    }).then(canvas => {
        document.getElementById('menu').classList.remove('hide-for-capture');
        document.getElementById('frame-selector').classList.remove('hide-for-capture');
        document.getElementById('autofill-controls').classList.remove('hide-for-capture');
        document.getElementById('instructions').classList.remove('hide-for-capture');
        collageContainer.style.border = '2px dashed rgba(255, 255, 255, 0.5)';

        document.querySelectorAll('.resize-handle').forEach(handle => {
            handle.classList.remove('hide-for-capture');
        });

        const link = document.createElement('a');
        link.download = 'collage.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

setFrameSize();
window.addEventListener('resize', setFrameSize);
