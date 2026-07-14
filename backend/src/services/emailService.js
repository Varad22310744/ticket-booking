import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});
export const sendBookingConfirmation = async (toEmail, bookingRef, eventTitle, seatDetails, qrDataUrl) => {
    const qrCid = 'qrcode';
    await transporter.sendMail({
        from: `"Ticket Booking" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Booking Confirmed - ${eventTitle}`,
        html: `
      <h2>Booking Confirmed!</h2>
      <p><strong>Event:</strong> ${eventTitle}</p>
      <p><strong>Seats:</strong> ${seatDetails}</p>
      <p><strong>Booking Reference:</strong> ${bookingRef}</p>
      <p>Show this QR code at entry:</p>
      <img src="cid:${qrCid}" alt="QR Code" />
    `,
        attachments: [
            {
                filename: 'qrcode.png',
                content: qrDataUrl.split('base64,')[1],
                encoding: 'base64',
                cid: qrCid
            }
        ]
    });
};
export const sendWaitlistOffer = async (toEmail, eventTitle, offerLink, expiryMinutes) => {
    await transporter.sendMail({
        from: `"Ticket Booking" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Seat Available - ${eventTitle}`,
        html: `
      <h2>A seat opened up!</h2>
      <p>Complete your booking for <strong>${eventTitle}</strong> within ${expiryMinutes} minutes.</p>
      <a href="${offerLink}">Click here to book now</a>
      <p>If not completed in time, seat goes to next person in line.</p>
    `
    });
};
//# sourceMappingURL=emailService.js.map