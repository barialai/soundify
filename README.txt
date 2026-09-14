SOUNDIFY WEBSITE - WHATSAPP-FIRST RENTAL MVP

Open index.html in a browser.

BOOKING FLOW
1. Customer adds equipment to cart.
2. Customer reviews quantities.
3. Customer enters full name, phone, email, event date, rental days, delivery address and exact Google Maps location.
4. Customer chooses UPI / Google Pay or Razorpay.
5. Customer can pay, then clicks "Send booking on WhatsApp".
6. WhatsApp opens with the complete cart, customer details, total and payment status already written.
7. Soundify verifies stock/payment/delivery manually and sends final confirmation by email.

IMPORTANT: EDIT THESE VALUES AT THE TOP OF script.js BEFORE GOING LIVE
- WHATSAPP_NUMBER
- UPI_ID
- RAZORPAY_PAYMENT_LINK

UPI / GPAY
The site creates a dynamic UPI payment URL using the cart total. On mobile, "Open UPI / GPay" opens an installed UPI app. On desktop, a QR code is generated after you add your real UPI ID.

RAZORPAY
The included Razorpay button supports a payment-link workflow. Replace the placeholder with your Razorpay Payment Link.
For a fully automatic payment system where the exact dynamic cart amount is charged and payment is verified automatically, add a backend with Razorpay Orders API + webhook verification. Do not put Razorpay secret keys in this front-end.

BOOKING CONFIRMATION
The website deliberately labels the WhatsApp submission as a booking request. The final booking is only confirmed after Soundify manually verifies availability/payment and emails the customer.
