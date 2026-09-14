# Linear Motion Graph Lab

Standalone, mobile-first position → velocity experiment. The original piecewise motion and SVG car are preserved; the equations now live in `js/physics.js` and feed a single `stateAt(model, t)` calculation used by every graph, label and car update.

## Run and deploy

No production dependencies or build step. Serve this repository with any static HTTP server; ES modules require HTTP rather than opening `index.html` through `file://`.

```powershell
node tests/server.js
```

Open `http://127.0.0.1:8000`. For GitHub Pages, serve the repository root on the chosen deployment branch. Keep `index.html`, `style.css`, `script.js` and the entire `js/` directory together. Tests and npm dependencies are development-only. Neither simulation loads files from its sibling repository.

## Use

- Play, Stop and Reset; playback at 0.5×, 1× or 2×. Stop freezes the displayed state. Scrubbing pauses and stays paused until Play.
- Drag either graph horizontally with a mouse, touch or pen. Vertical touch gestures can scroll the page. Secondary pointers cannot take control.
- Focus a graph: Space plays/pauses; arrows step by 0.1 s; Shift + arrow steps by 1 s; Home/End go to the endpoints; R resets. Form controls retain their native editing keys.
- Expand the average-velocity panel for two secant endpoints. Predict mode hides the derived graph while preserving time and playback.
- Concepts, eight challenges and the polynomial worked example are collapsible. Solutions require an attempted answer and a check first.

## Physics audit

The original position function is unchanged: `2t²` on 0–5 s; `100 − 2(10 − t)²` on 5–10 s; `100` on 10–15 s; `100 − 20(t − 15)` on 15–25 s; `−100 + 20(t − 25)` on 25–30 s.

Position is continuous. Velocity exists at 5 and 10 s but is undefined at the sharp position corners at 15 and 25 s. Acceleration is undefined at 5, 10, 15 and 25 s. At velocity jumps, finite acceleration cannot describe the ideal impulse. Endpoints use one-sided derivatives inside the displayed domain. Graphs show separate open limits rather than joining jumps with a sloping line.

Distance is the exact sum of absolute position changes, splitting each interval at any velocity zero. Total distance is 400 m and net displacement is 0 m. The separate polynomial activity verifies 12 m s⁻¹, 15 m s⁻¹ and 1.2 m s⁻².

## Tests

Node.js 20+ is sufficient for the numerical tests. Browser tests use Playwright, Edge and axe-core; these are development dependencies only.

```powershell
npm ci
npm test
npm run test:browser
```

The default browser channel is installed Microsoft Edge. To use bundled Chromium:

```powershell
npx playwright install chromium
$env:BROWSER_CHANNEL = 'chromium'
npm run test:browser
```

The browser suite starts and closes its own local server on port 8000. Stop a manually running server before testing. It covers eleven requested viewports, pointer types, cancellation, keyboard editing, playback, corner values, car mapping, resize, activities, prediction, reduced motion and an automated WCAG A/AA audit. PNG screenshots and machine-readable results are generated under `test-results/` (gitignored).

Refresh-rate tests inject 60/90/120/144 Hz timestamps at every playback speed. They are deterministic clock tests, not measurements on physical monitors. Touch/pen and viewport checks are browser emulation, not physical iPhone/iPad certification. Automated accessibility checks do not replace a screen-reader usability review.

## Files

`physics-core.js` handles derivatives, integration and classification; `physics.js` defines this experiment; `animation.js` owns the sole playback loop; `graph.js` handles DPI, coordinates and overlays; `activities.js` handles independent learning state; `script.js` binds them to the page. The companion experiment carries its own copies of the shared modules so it remains independently deployable.
