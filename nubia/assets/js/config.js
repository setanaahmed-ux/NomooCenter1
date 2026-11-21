/*
 * NUBIA | Executive Mind Literacy — site configuration
 * ---------------------------------------------------------------------------
 * This is the ONLY file you need to edit to publish real details.
 * Anything left as `null` is shown on the page as a clearly marked
 * "To be confirmed" placeholder in both languages. Nothing is invented.
 */
window.NUBIA_CONFIG = {
  workshop: {
    // ISO date-time of the first session INCLUDING the time-zone offset,
    // e.g. "2027-02-07T18:00:00+04:00". Used to compute the registration
    // deadline (closeHoursBefore hours earlier).
    startDate: null,
    // Human-readable dates, e.g. "7–11 February 2027, 18:00–20:00 (GST)".
    datesText: { en: null, ar: null },
    // e.g. "Online via Zoom" / "عبر الإنترنت (Zoom)", or a venue and city.
    deliveryText: { en: null, ar: null }
  },

  contact: {
    phone: null,   // e.g. "+971 50 000 0000"
    email: null    // e.g. "hello@example.com"
  },

  registration: {
    // POST endpoint that accepts JSON and returns 2xx, e.g. a Formspree form
    // ("https://formspree.io/f/xxxxxxx"), Basin, Getform or your own API.
    // While null, the form does NOT collect data: visitors are told online
    // registration is not yet open and are pointed to the contact details.
    formEndpoint: null,

    maxParticipants: 12,
    closeHoursBefore: 48,

    // Set to true ONLY when the deadline and 12-place limit are genuinely
    // enforced (e.g. your form provider stops accepting submissions after
    // 12 entries / after the deadline, and you keep seatsRemaining current).
    // When true, the page shows the closing rule and automatically closes the
    // form after the deadline or when seatsRemaining reaches 0.
    enforceLimits: false,

    // Places still available (number) — or null to hide the counter.
    seatsRemaining: null
  },

  payment: {
    // Hosted payment page (e.g. a Stripe / PayPal payment link for US$50).
    // Shown as a button after a successful registration request.
    url: null,
    // Or written instructions (bank transfer etc.) shown instead.
    instructions: { en: null, ar: null }
  },

  privacy: {
    providerName: null,                 // e.g. "Formspree (formspree.io)"
    retention: { en: null, ar: null }   // e.g. "12 months after the workshop"
  }
};
