# Smart Waste Classifier App

An AI-powered mobile-first Progressive Web App (PWA) that uses a device camera and a Google Teachable Machine image classification model to categorize visible waste into **Recyclable, Organic, or E-Waste** and provide immediate, actionable disposal guidance.

---

## 1. Project Title
**Smart Waste Classifier App**

## 2. Description
The Smart Waste Classifier is a lightweight, responsive, client-side web application designed to help individuals and communities separate waste accurately at the point of disposal. By positioning an item in front of the device's camera, the user receives an instantaneous visual feature analysis, classification into one of three core waste categories, a statistical confidence score, and clear step-by-step disposal instructions.

## 3. The Problem
Improper waste sorting and recycling contamination pose massive ecological and economic challenges worldwide. Municipal recycling streams are frequently contaminated with organic matter, while hazardous electronic waste (e-waste) and batteries are mistakenly discarded into regular landfills, leading to toxic leaching and fires. Most citizens struggle with ambiguous packaging symbols and lack instant guidance on how to properly clean, separate, or deposit specific waste items.

## 4. The Solution
The Smart Waste Classifier removes sorting ambiguity by providing an instant, accessible scanning utility directly in any mobile or desktop web browser:
1. **Zero Install Required**: Operates instantly as a web app or installable PWA.
2. **Instant Visual Classification**: Identifies common recyclables, compostable organics, and dangerous e-waste.
3. **Transparent Confidence**: Clearly communicates model confidence levels and prompts for a rescan when lighting or positioning is ambiguous.
4. **Actionable Instructions**: Supplies practical preparation and disposal steps (e.g., rinse, remove lids, take batteries to certified collection).
5. **Private & Client-Side**: All camera frames remain strictly on the user's device.

## 5. Features
- **Mobile-First Responsive Interface**: Clean, accessible UI tailored for handheld smartphones (360px–420px) up to high-resolution desktop displays.
- **Camera Viewfinder**: Live camera feed with corner framing reticles and optimized environment camera selection (`facingMode: "environment"`).
- **Client-Side AI Inference**: Neural network predictions powered by Google Teachable Machine and TensorFlow.js.
- **Configurable Confidence Threshold**: Automatic safety threshold (`CONFIDENCE_THRESHOLD = 0.75`) to flag uncertain predictions and avoid incorrect guidance.
- **Categorized Waste Intelligence**:
  - ♻️ **Recyclable**: Plastics, cardboard, paper, metal containers.
  - 🌱 **Organic**: Food scraps, fruit peels, yard waste.
  - 🔋 **E-Waste**: Electronics, cables, chargers, batteries.
- **Local Scan History**: Reverse-chronological audit log stored in browser LocalStorage without external database overhead.
- **Environmental Statistics Dashboard**: Aggregated summary counters and percentage distribution breakdowns.
- **Installable PWA**: Offline-capable application shell, Web App Manifest, and Service Worker caching.
- **Strict Accessibility (a11y)**: Semantic HTML5, keyboard navigation, high text contrast, and `aria-live` screen-reader announcements.

## 6. How It Works
```text
Open App
   ↓
Tap "Scan Waste"
   ↓
Allow Camera Access
   ↓
Center Waste Object in Viewfinder
   ↓
Capture Video Frame
   ↓
AI Model Analyzes Visual Features (Color, Texture, Shape, Edges)
   ↓
Confidence Check
   ├── ≥ 75%  ──> Accepted Result ──> Disposal Guidance ──> Save to Local History
   └── < 75%  ──> Low-Confidence Warning ──> Retake / Rescan Guidance
```

## 7. Technology Stack
- **Frontend Core**: Vanilla HTML5, CSS3, ES6+ JavaScript modules.
- **Styling**: Tailwind CSS (Utility classes) + Custom CSS (`css/style.css`).
- **AI / Machine Learning**: Google Teachable Machine Image Model, TensorFlow.js runtime.
- **Browser APIs**:
  - `navigator.mediaDevices.getUserMedia` (Camera feed)
  - HTML5 `<canvas>` (Frame capture & resizing)
  - `window.localStorage` (Client-side scan history & statistics)
  - Service Worker API & Web App Manifest (PWA capabilities)
- **Deployment**: Static HTTPS hosting (GitHub Pages, Vercel, Netlify).

## 8. AI Model
- **Platform**: Google Teachable Machine (Image Model).
- **Core Classes**: `Recyclable`, `Organic`, `E-Waste`.
- **Inference Mode**: Pure client-side evaluation running on the browser's WebGL / CPU backend.
- **Confidence Handling**: Probabilities are normalized between 0% and 100%. Classifications with top probability below 75% are routed to an informative retry screen.

## 9. Project Structure
```text
smart-waste-classifier/
├── index.html                           # Single-page application structure & views
├── css/
│   └── style.css                        # Custom styling, animations & accessibility rules
├── js/
│   ├── app.js                           # Application lifecycle orchestrator
│   ├── camera.js                        # WebRTC camera stream & frame capture module
│   ├── classifier.js                    # Teachable Machine model loader & predictor
│   ├── waste-data.js                    # Centralized disposal guidance data dictionary
│   ├── storage.js                       # LocalStorage persistence & statistics engine
│   ├── ui.js                            # Screen transitions & DOM renderers
│   └── utils.js                         # Shared helper functions (selectors, formatters)
├── model/
│   ├── model.json                       # Model graph topology (when bundled locally)
│   ├── metadata.json                    # Class labels & training metadata
│   └── weights.bin                      # Quantized neural network weights
├── assets/
│   ├── icons/                           # PWA icons (192x192, 512x512, favicon)
│   ├── images/                          # Visual guides & category diagrams
│   └── screenshots/                     # UI screenshots
├── manifest.json                        # PWA Web App Manifest
├── service-worker.js                    # PWA static cache & offline shell worker
├── PROJECT_AUDIT.md                     # Phase-by-phase implementation audit
├── SMART_WASTE_CLASSIFIER_ANTIGRAVITY_MASTER_PLAN.md # Master architectural specification
└── README.md                            # Comprehensive project documentation
```

## 10. Setup
No Node.js runtime, build tools, or compilers are strictly required. The application runs natively in any modern web browser.

1. Clone or download the repository:
   ```bash
   git clone <repository-url>
   cd smart-waste-classifier
   ```
2. Ensure files are placed in an HTTPS-capable web server or local development server.

## 11. Running Locally
Because modern browsers require secure contexts (HTTPS or `localhost`) to access camera hardware via `getUserMedia`, run a local HTTP server:

### Using Python:
```bash
# Python 3
python -m http.server 8000
```
Open `http://localhost:8000` in your web browser.

### Using Node.js (npx):
```bash
npx serve .
```

### Using VS Code Live Server:
Right-click `index.html` and select **"Open with Live Server"**.

## 12. Camera / HTTPS Requirement
Modern web security standards enforce that `navigator.mediaDevices.getUserMedia()` is **only** accessible under:
- `http://localhost` or `http://127.0.0.1` (local development)
- Valid `https://` domain origins (production deployment)

When testing on mobile devices over a local Wi-Fi network, access must be routed through an HTTPS tunnel (such as `cloudflared` or `ngrok`) or deployed to a staging host like Vercel or GitHub Pages.

## 13. Model Configuration
The AI classifier is permanently pre-configured with the production Google Teachable Machine model in `js/classifier.js` (`DEFAULT_MODEL_URL = 'https://teachablemachine.withgoogle.com/models/KUTJfq9YN/'`). The model automatically initializes when the application launches or when scanning begins. To update or retrain the model in the future, simply update the `DEFAULT_MODEL_URL` constant or place exported model files in `./model/`.

## 14. Testing
The test plan covers 10 verification groups (A through J):
- **Group A**: Launch & SPA Navigation
- **Group B**: Camera permissions, streaming, and frame capture
- **Group C**: AI model loading, inference, and confidence scoring
- **Group D**: Classification accuracy across all three categories
- **Group E**: Low-confidence handling & rescan workflows
- **Group F**: LocalStorage persistence, sorting, and history clearance
- **Group G**: Statistics metrics and distribution calculations
- **Group H**: PWA installation, manifest validity, and offline shell
- **Group I**: Responsive layouts (360px up to desktop)
- **Group J**: Error resilience (denied permissions, offline, corrupted data)

Refer to `TEST_REPORT.md` for complete test records and findings.

## 15. Deployment
The application is entirely static and deployable to any HTTPS static web host:
- **GitHub Pages**: Push to the `main` branch and enable GitHub Pages in repository settings.
- **Vercel**: Import repository; zero build command needed (root directory serves `index.html`).
- **Netlify**: Drag-and-drop or connect repository.

Refer to `DEPLOYMENT.md` for deployment verification steps.

## 16. Privacy Notice
- **Zero Cloud Image Uploads**: Camera streams and captured images are processed strictly in-memory inside the browser via HTML5 Canvas and TensorFlow.js.
- **No Third-Party Trackers**: No invasive tracking cookies, analytics scripts, or user fingerprinting are employed.
- **Local Storage Only**: Only high-level classification metadata (category, confidence percentage, timestamp) is stored in the user's browser LocalStorage.

## 17. Technical Limitations
1. **Visual Feature Analysis Only**: The camera analyzes optical features (shapes, colors, textures, and edges). It **cannot** physically measure object weight, exact cubic dimensions, or internal material purity.
2. **Confidence is Statistical**: A 94% confidence score represents the statistical probability generated by the trained neural network relative to its training set, not absolute certainty.
3. **Lighting & Angle Dependency**: Heavy shadows, glare, complex backgrounds, or overlapping items may degrade prediction confidence.
4. **Local Regulations Vary**: Recycling rules vary between municipalities. The app provides standard global best practices, but users should always adhere to local municipal recycling guidelines.

## 18. Future Scope (Roadmap)
- **Version 1.1**: Expanded waste sub-classes (e-waste battery types, glass colors, textiles), multilingual disposal instructions.
- **Version 2.0**: Municipal geolocation lookup for nearby recycling drop-off centers and hazardous waste depots.
- **Version 3.0**: Smart Bin IoT hardware integration (ultrasonic fill-level sensors, scale modules).

## 19. Screenshots
*(Placeholder — UI screenshots for Mobile Viewfinder, Classification Results, History, and Statistics will be captured and documented in later testing phases.)*

## 20. Credits & License
- Built with Vanilla HTML5, CSS3, Tailwind CSS, and JavaScript.
- Powered by Google Teachable Machine / TensorFlow.js.
- Licensed under the MIT License.
