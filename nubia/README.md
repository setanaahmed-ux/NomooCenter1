# NUBIA | Executive Mind Literacy — landing page

A static, bilingual (English / العربية) landing page. No build step: upload the `nubia/` folder to any static host (GitHub Pages, Netlify, Cloudflare Pages, cPanel).

## Files
- `index.html` — page structure and English content
- `assets/js/i18n-ar.js` — Arabic content (same keys as the `data-i18n` attributes)
- `assets/js/config.js` — **the only file you edit to go live**
- `assets/js/main.js` — language switch, Blind-Spot Profile, registration form
- `assets/css/styles.css` — design

## Before publishing — fill in `assets/js/config.js`
Any value left as `null` appears on the page as a dashed "To be confirmed / قيد التأكيد" placeholder.

| Setting | What it controls |
|---|---|
| `workshop.startDate` | First session (ISO, with time-zone offset). Registration deadline is calculated as 48 h earlier. |
| `workshop.datesText`, `deliveryText` | Dates and location/online delivery, in EN and AR |
| `contact.phone`, `contact.email` | Shown in the price card, footer and privacy notice |
| `registration.formEndpoint` | Where the form posts JSON (e.g. a Formspree form URL). **While null, no data is collected**; visitors are asked to contact you directly. |
| `registration.enforceLimits` | Set `true` only once the 12-place / 48-hour rule is actually enforced (e.g. your form provider caps submissions). Then the page shows the rule and closes the form automatically. |
| `registration.seatsRemaining` | Optional places-left counter (shown only when `enforceLimits` is true) |
| `payment.url` / `payment.instructions` | Payment link button shown after registration, or written instructions |
| `privacy.providerName`, `privacy.retention` | Completes the privacy notice |

Setup notes (yellow boxes) only appear on `localhost`, `file://`, or with `?preview` in the URL; they're hidden on the live site.

## Leadership Blind-Spot Profile
Fully functional and runs in the browser: 10 statements in 3 areas (Assumptions & Interpretations ×4, Emotional Reactions & Decision Pressure ×3, Established Thinking Habits ×3) on a 5-point frequency scale. The area with the highest average is shown as "one possible area to explore further", with a note when two areas are close or all responses are low. Answers are never stored or sent anywhere. It's framed throughout as self-reflection, not a diagnosis or assessment.

## Language
`?lang=ar` / `?lang=en` selects a language directly (good for sharing links). Otherwise the visitor's last choice is used, then their browser language.

## SEO
Once the domain is known, add `<link rel="canonical">` and make the `hreflang` links in `index.html` absolute URLs.
