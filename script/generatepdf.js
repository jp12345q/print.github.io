// This script is a picture tranfer into pdf file
// Like generate for layout, paper, picture, sizing.
fetch('form/imageform.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('inputform').innerHTML = data;

        let uploadedImages = [];

        // Get id from imageform.html
        const imageUploadInput = document.getElementById('imageUpload');
        const imageUrlInput = document.getElementById('imageUrl');
        const imageCountMessage = document.getElementById('imageCountMessage');
        
        // Function to update the image count message
        function updateImageCount() {
            imageCountMessage.textContent = `${uploadedImages.length} image(s) added.`;
        }
        
    // Handle file input uploads (allow duplicates)
    imageUploadInput.addEventListener('change', function() {
        const newFiles = Array.from(imageUploadInput.files);

        newFiles.forEach(file => {
            uploadedImages.push(file);
        });

        imageUploadInput.value = '';
        updateImageCount();
    });

    // Handle image URL input when pressing Enter
    imageUrlInput.addEventListener('keydown', async function(event) {
        if (event.key === 'Enter') {  // Trigger when Enter key is pressed
            const url = imageUrlInput.value;
            if (url) {
                try {
                    const response = await fetch(url);
                    const blob = await response.blob();

                    // Convert blob to file-like object and store it
                    const file = new File([blob], 'uploaded_image', { type: blob.type });
                    uploadedImages.push(file);
                    updateImageCount();
                    imageUrlInput.value = '';  // Clear the URL input field
                } catch (error) {
                    alert('Failed to load image from URL.');
                }
            }
        }
    });

    // Clear Button
    document.getElementById('clearButton').addEventListener('click', function() {
        // Clear image upload input
        document.getElementById('imageUpload').value = '';
        document.getElementById('imageUrl').value = '';  
        imageCountMessage.textContent = 'No images added.'; // Reset message
        uploadedImages = [];  // Clear image array

        // Reset form fields (paper size, orientation, picture size, and layout)
        document.getElementById('paper_size').selectedIndex = 0;
        document.getElementById('orientation').selectedIndex = 0;
        document.getElementById('picture_size').selectedIndex = 0;
        document.getElementById('layout').selectedIndex = 0;

        // Clear the PDF preview iframe
        document.getElementById('pdfPreview').src = '';

        // Clear the canvas (optional, depending on your layout)
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Paste from clipboard functionality
    window.addEventListener('paste', (event) => {
        const clipboardItems = event.clipboardData.items;
        for (let item of clipboardItems) {
            if (item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                const file = new File([blob], 'pasted_image', { type: blob.type });
                uploadedImages.push(file);
                updateImageCount();
            }
        }
    });

    // Function for tranfer picture to pdf file
    window.generatePDF = async function() { 
        const { jsPDF } = window.jspdf;

        const paperSize = document.getElementById('paper_size').value;
        const orientation = document.getElementById('orientation').value;
        const pictureSize = document.getElementById('picture_size').value;
        const layout = document.getElementById('layout').value;
        const paperType = document.getElementById('paperType').value;

        // Determine the page size and orientation
        let doc;
        if (paperSize === 'A4') {
            doc = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: 'a4' // A4 size in mm
            });
        } else if (paperSize === 'Legal') {
            doc = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: [216, 356]  // Legal size in mm
            });
        } else if (paperSize === 'Letter') {
            doc = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: 'letter' // letter aka short bond paper size in mm
            });
        }

        // Picture size in mm
        let imgWidth, imgHeight;
        if (pictureSize === '1x1') {
            imgWidth = 25.4;
            imgHeight = 25.4;
        } else if (pictureSize === '2x2') {
            imgWidth = 50.8;
            imgHeight = 50.8;
        } else if (pictureSize === 'wallet') {
            imgWidth = 50.8;
            imgHeight = 76.2;
        } else if (pictureSize === '2r') {
            imgWidth = 63.5;
            imgHeight = 88.9;
        } else if (pictureSize === '3r') {
            imgWidth = 88.9;
            imgHeight = 127;
        } else if (pictureSize === '4r') {
            imgWidth = 101.6;
            imgHeight = 152.4;
        } else if (pictureSize === '5r') {
            imgWidth = 127;
            imgHeight = 177.8;
        } else if (pictureSize === '6r') {
            imgWidth = 152.4;
            imgHeight = 203.2;
        } else if (pictureSize === '8r') {
            imgWidth = 203.2;
            imgHeight = 254;
        } else if (pictureSize === 'A4') {
            imgWidth = 200;
            imgHeight = 290;
        } else if (pictureSize === 'Legal') {
            imgWidth = 210;
            imgHeight = 328;
        }

        // show output using canvas
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        // Determine the layout (rows and columns)
        let cols, rows;
        if (layout === '1x1') {
            rows = 1; cols = 1;
        } else if (layout === '1x2') {
            rows = 2; cols = 1;
        } else if (layout === '1x3') {
            rows = 3; cols = 1;
        } else if (layout === '2x1') {
            rows = 1; cols = 2;
        } else if (layout === '2x2') {
            rows = 2; cols = 2;
        } else if (layout === '2x3') {
            rows = 3; cols = 2;
        } else if (layout === '3x2') {
            rows = 2; cols = 3;
        } else if (layout === '3x3') {
            rows = 3; cols = 3;
        } else if (layout === '3x4') {
            rows = 3; cols = 4;
        }

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const cellWidth = pageWidth / cols;
        const cellHeight = pageHeight / rows;

        // Plain paper logic
        if (paperType === 'plain') {
            for (let i = 0; i < uploadedImages.length; i++) {
                const image = uploadedImages[i];
                const img = new Image();
                const url = URL.createObjectURL(image);

                img.src = url;

                await new Promise((resolve) => {
                    img.onload = () => {
                        // Higher resolution factor for better image quality
                        const higherResolutionFactor = 4;
                        const enhancedImgWidth = imgWidth * higherResolutionFactor;
                        const enhancedImgHeight = imgHeight * higherResolutionFactor;

                        // Set canvas to higher resolution
                        canvas.width = enhancedImgWidth;
                        canvas.height = enhancedImgHeight;

                        // Draw the image onto the canvas at enhanced resolution
                        ctx.drawImage(img, 0, 0, enhancedImgWidth, enhancedImgHeight);

                        // Convert to PNG for maximum quality
                        const imgData = canvas.toDataURL('image/png', 1.0);

                        // Calculate image position
                        const col = i % cols;
                        const row = Math.floor((i % (cols * rows)) / cols);

                        const xOffset = (cellWidth - imgWidth) / 2;
                        const yOffset = (cellHeight - imgHeight) / 2;

                        const x = col * cellWidth + xOffset;
                        const y = row * cellHeight + yOffset;

                        // Add image to the PDF
                        doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'NONE');
                        resolve();
                    };
                });

                // Add new page if the current page is full
                if ((i + 1) % (cols * rows) === 0 && i < uploadedImages.length - 1) {
                    doc.addPage();
                }
            }
        }

        // Glossy paper logic (different handling)
        if (paperType === 'glossy') {
            for (let i = 0; i < uploadedImages.length; i++) {
                const image = uploadedImages[i];
                const img = new Image();
                const url = URL.createObjectURL(image);

                img.src = url;

                await new Promise((resolve) => {
                    img.onload = () => {
                        // Adjust resolution differently for glossy paper
                        const glossyResolutionFactor = 9;  // Higher quality for glossy
                        const enhancedImgWidth = imgWidth * glossyResolutionFactor;
                        const enhancedImgHeight = imgHeight * glossyResolutionFactor;

                        // Set canvas to glossy resolution
                        canvas.width = enhancedImgWidth;
                        canvas.height = enhancedImgHeight;

                        // Draw the image onto the canvas at enhanced resolution
                        ctx.drawImage(img, 0, 0, enhancedImgWidth, enhancedImgHeight);

                        // Convert to PNG for maximum quality
                        const imgData = canvas.toDataURL('image/png', 1.0);

                        // Calculate image position for glossy paper
                        const col = i % cols;
                        const row = Math.floor((i % (cols * rows)) / cols);

                        const xOffset = 0;
                        const yOffset = 0;

                        const x = col * cellWidth + xOffset;
                        const y = row * cellHeight + yOffset;

                        // Add image to the PDF for glossy paper
                        doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'NONE');
                        resolve();
                    };
                });

                // Add new page after each page is filled for glossy
                if ((i + 1) % (cols * rows) === 0 && i < uploadedImages.length - 1) {
                    doc.addPage();
                }
            }
        }

        // Preview the generated PDF in the iframe
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        document.getElementById('pdfPreview').src = pdfUrl;
    }
});