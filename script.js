document.getElementById('imageUpload').addEventListener('change', function(event) {
      const files = event.target.files;
      const collageContainer = document.getElementById('collage');
      collageContainer.innerHTML = '';

      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          const img = document.createElement('img');
          img.src = URL.createObjectURL(files[i]);
          img.classList.add('photo');
          collageContainer.appendChild(img);
        }
      }
    });
