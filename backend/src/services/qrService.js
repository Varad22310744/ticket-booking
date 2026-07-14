import QRCode from 'qrcode';
export const generateQRCode = async (bookingRef) => {
    try {
        // returns base64 data URL — embeddable directly in email <img> tag
        const qrDataUrl = await QRCode.toDataURL(bookingRef, {
            errorCorrectionLevel: 'M',
            width: 300
        });
        return qrDataUrl;
    }
    catch (err) {
        throw new Error('QR generation failed: ' + err.message);
    }
};
//# sourceMappingURL=qrService.js.map