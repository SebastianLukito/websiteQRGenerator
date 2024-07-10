document.addEventListener('DOMContentLoaded', function () {
    const generateBtn = document.getElementById('generate-btn');
    const saveBtn = document.getElementById('save-btn');
    const newBtn = document.getElementById('new-btn');
    const qrDisplay = document.getElementById('qr-display');
    let qrCodeData = null;
    let canvas = null;

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

        if (!url) {
            alert('Please enter a URL.');
            return;
        }

        if (!validateURL(url)) {
            alert('Invalid URL. Please enter a valid URL.');
            return;
        }

        if (canvas && qrDisplay.contains(canvas)) {
            qrDisplay.removeChild(canvas);
        }

        canvas = document.createElement('canvas');
        const options = {
            text: url,
            width: 300,
            height: 300,
            errorCorrectionLevel: 'H', // Set error correction level
            version: complexity
        };

        QRCode.toCanvas(canvas, options.text, { ...options }, function (error) {
            if (error) {
                console.error(error);
                return;
            }

            if (logoFile) {
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
                        const rectX = logoX - padding;
                        const rectY = logoY - padding;
                        const rectWidth = logoWidth + 2 * padding;
                        const rectHeight = logoHeight + 2 * padding;
                        const radius = padding;

                        context.fillStyle = 'white';
                        context.beginPath();
                        context.moveTo(rectX + radius, rectY);
                        context.lineTo(rectX + rectWidth - radius, rectY);
                        context.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + radius);
                        context.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
                        context.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - radius, rectY + rectHeight);
                        context.lineTo(rectX + radius, rectY + rectHeight);
                        context.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - radius);
                        context.lineTo(rectX, rectY + radius);
                        context.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
                        context.closePath();
                        context.fill();

                        // Draw logo
                        context.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
                    };
                };
                reader.readAsDataURL(logoFile);
            }
        });

        qrDisplay.innerHTML = ''; // Clear the "No QR code generated." text
        qrDisplay.appendChild(canvas);
        qrCodeData = canvas;
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
            if (canvas && qrDisplay.contains(canvas)) {
                qrDisplay.removeChild(canvas);
                canvas = null;
            }
            qrDisplay.innerHTML = '<p>No QR code generated.</p>';
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
