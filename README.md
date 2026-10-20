# Krezzel Letter Builder

A browser-local job-application-letter builder for formal Bahasa Indonesia letters and English cover letters.

## Run locally

This is a static prototype with no install step. From this folder, start any static web server, for example:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

The project uses the Tailwind Play CDN to keep the prototype dependency-free. For a production deployment, replace the CDN script with a pinned, locally built Tailwind CSS bundle and apply an appropriate Content Security Policy.

## Files

- `index.html` — semantic landing page and letter-editor structure.
- `styles.css` — document typography, responsive behavior, print styling, and components not conveniently expressed in utilities.
- `app.js` — safe form reading, validation, local letter generation, preview rendering, copy, print, and reset interactions.
- `assets/krezzel-logo.png` — supplied, unmodified Krezzel brand asset.
- `assets/krezzel-mark-transparent.png` — transparent, cropped navigation mark derived from the supplied logo; the original asset remains preserved.

## Privacy

No data is transmitted or persisted by this prototype. Form data remains in the current page session and is cleared when the page reloads or the user starts a new letter.

## Functional scope and limitations

- **Save PDF** opens the browser print dialog, where the user can choose **Save as PDF**. This works without a server or third-party library.
- The letter text is generated locally from form inputs using carefully constrained templates; it does not claim to use an AI model and does not invent credentials.
- There is no account, cloud save, server, DOCX export, or external job-posting integration.
- The generator intentionally uses editable placeholders for required fields until the user supplies them.

## Reference takeaways

The implementation was informed by live inspection of the two requested reference sites on 20 October 2026:

- **TalentApply**: its broad career-journey navigation and product-oriented UI illustrate the value of grouping related tools and showing a product interface early. Krezzel instead keeps the first task singular—writing one letter—and removes the dashboard metrics and job-search complexity from its core workflow.
- **CVMaker Indonesia**: its localized onboarding, clear multi-step career flow, template emphasis, and mobile commitment are useful cues. Krezzel avoids unsupported performance claims, fabricated social proof, and an overlong marketing flow; it uses a compact explanation and moves quickly to the working editor.
