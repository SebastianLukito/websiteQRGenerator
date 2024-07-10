document.addEventListener('DOMContentLoaded', function () {
    const generateBtn = document.getElementById('generate-btn');
    const saveBtn = document.getElementById('save-btn');
    const newBtn = document.getElementById('new-btn');
    const qrDisplay = document.getElementById('qr-display');
    const bgColorBtn = document.getElementById('bg-color-btn');
    const qrColorBtn = document.getElementById('qr-color-btn');
    let qrCodeData = null;
    let canvas = null;
    let backgroundColor = '#ffffff'; // default background color
    let qrCodeColor = '#000000'; // default QR code color

    generateBtn.addEventListener('click', function() {
        console.log("Generate QR Code button clicked");
        try {
            generateQRCode();
        } catch (error) {
            console.error("Error generating QR code:", error);
            alert('Error generating QR code. Please check the console for more details.');
        }
    });

    saveBtn.addEventListener('click', function() {
        console.log("Save QR Code button clicked");
        try {
            saveQRCode();
        } catch (error) {
            console.error("Error saving QR code:", error);
            alert('Error saving QR code. Please check the console for more details.');
        }
    });

    newBtn.addEventListener('click', function() {
        console.log("New QR Code button clicked");
        try {
            resetForm();
        } catch (error) {
            console.error("Error resetting form:", error);
            alert('Error resetting form. Please check the console for more details.');
        }
    });

    bgColorBtn.addEventListener('click', function() {
        console.log("Change Background Color button clicked");
        let colorPicker = document.createElement("input");
        colorPicker.type = "color";
        colorPicker.value = backgroundColor;
        colorPicker.addEventListener("input", function() {
            backgroundColor = colorPicker.value;
        });
        colorPicker.addEventListener("change", function() {
            if (canvas) {
                generateQRCode();
            }
        });
        colorPicker.click();
    });

    qrColorBtn.addEventListener('click', function() {
        console.log("Change QR Code Color button clicked");
        let colorPicker = document.createElement("input");
        colorPicker.type = "color";
        colorPicker.value = qrCodeColor;
        colorPicker.addEventListener("input", function() {
            qrCodeColor = colorPicker.value;
        });
        colorPicker.addEventListener("change", function() {
            if (canvas) {
                generateQRCode();
            }
        });
        colorPicker.click();
    });

    function generateQRCode() {
        const url = document.getElementById('url').value;
        const logoFile = document.getElementById('logo').files[0];
        const logoSize = parseInt(document.getElementById('logo-size').value);
        const padding = parseInt(document.getElementById('padding').value);
        const complexity = parseInt(document.getElementById('complexity').value);

        console.log("URL:", url);
        console.log("Logo File:", logoFile);
        console.log("Logo Size:", logoSize);
        console.log("Padding:", padding);
        console.log("Complexity:", complexity);
        console.log("Background Color:", backgroundColor);
        console.log("QR Code Color:", qrCodeColor);

        if (!url) {
            alert('Please enter a URL.');
            return;
        }

        if (!validateURL(url)) {
            alert('Invalid URL. Please enter a valid URL.');
            return;
        }

        // Hanya menghapus elemen canvas dari qrDisplay, bukan seluruh konten
        if (canvas && qrDisplay.contains(canvas)) {
            qrDisplay.removeChild(canvas);
        }

        canvas = document.createElement('canvas');
        const options = {
            text: url,
            width: 300,
            height: 300,
            colorDark: qrCodeColor,
            colorLight: backgroundColor,
            errorCorrectionLevel: 'H',
            version: complexity
        };

        QRCode.toCanvas(canvas, options.text, { ...options }, function (error) {
            if (error) {
                console.error(error);
                return;
            }

            if (logoFile) {
                addLogoToCanvas(logoFile, canvas, logoSize, padding);
            }
        });

        // Tambahkan canvas ke qrDisplay tanpa menghapus tombol color picker
        qrDisplay.appendChild(canvas);
        qrDisplay.appendChild(bgColorBtn);
        qrDisplay.appendChild(qrColorBtn);
        qrCodeData = canvas;
    }

    function addLogoToCanvas(logoFile, canvas, logoSize, padding) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const logoDataUrl = e.target.result;
            const context = canvas.getContext('2d');
            const logo = new Image();
            logo.src = logoDataUrl;
            logo.onload = function () {
                const logoWidth = canvas.width * logoSize / 10;
                const logoHeight = logoWidth * (logo.height / logo.width);
                const logoX = (canvas.width - logoWidth) / 2;
                const logoY = (canvas.height - logoHeight) / 2;

                // Draw rounded white rectangle
                drawRoundedRect(context, logoX - padding, logoY - padding, logoWidth + 2 * padding, logoHeight + 2 * padding, padding);

                // Draw logo
                context.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
            };
        };
        reader.readAsDataURL(logoFile);
    }

    function drawRoundedRect(context, x, y, width, height, radius) {
        context.fillStyle = 'white';
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
        context.fill();
    }

    function saveQRCode() {
        if (qrCodeData) {
            const link = document.createElement("a");
            link.download = "qr-code.png";
            link.href = qrCodeData.toDataURL("image/png");
            link.click();
        } else {
            alert('No QR code to save. Please generate a QR code first.');
        }
    }

    function resetForm() {
        try {
            document.getElementById('url').value = '';
            document.getElementById('logo').value = '';
            document.getElementById('logo-size').value = 4;
            document.getElementById('padding').value = 10;
            document.getElementById('complexity').value = 10;
            backgroundColor = '#ffffff';
            qrCodeColor = '#000000';
            if (canvas && qrDisplay.contains(canvas)) {
                qrDisplay.removeChild(canvas);
                canvas = null;
            }
            qrDisplay.innerHTML = '<p>No QR code generated.</p>';
            qrDisplay.appendChild(bgColorBtn);
            qrDisplay.appendChild(qrColorBtn);
            qrCodeData = null;
        } catch (error) {
            console.error("Error resetting form:", error);
            alert('Error resetting form. Please check the console for more details.');
        }
    }

    function validateURL(url) {
        const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name and extension
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return !!pattern.test(url);
    }
});
