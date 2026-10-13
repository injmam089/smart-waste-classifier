# Smart Waste Classifier App — Deployment Guide & Readiness Specification (Phase 11)

**Document:** `DEPLOYMENT.md`  
**Phase Status:** Phase 11 — COMPLETED (Deployment Preparation)  
**Target Environment:** Static HTTPS Hosting (GitHub Pages, Netlify, Vercel, Cloudflare Pages)  
**Architecture:** 100% Client-Side Progressive Web Application (PWA) — Zero Backend Required  
**Trained AI Model Status:** Classifier pipeline implemented and tested; trained model files pending user/deployer configuration.

---

## 1. Project Type & Architecture Overview

The **Smart Waste Classifier App** is a client-side, mobile-first Progressive Web Application (PWA). It does not require a server-side runtime, backend database, Node.js process, or external user authentication.

```text
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│                                                             │
│   ┌───────────────┐     ┌───────────────┐     ┌──────────┐  │
│   │  index.html   │ ──> │   app.js      │ ──> │  camera  │  │
│   │  (SPA Shell)  │     │ (Controller)  │     │  Module  │  │
│   └───────────────┘     └───────┬───────┘     └──────────┘  │
│                                 │                           │
│        ┌────────────────────────┼────────────────────┐      │
│        ▼                        ▼                    ▼      │
│  ┌───────────┐           ┌──────────────┐     ┌───────────┐ │
│  │ Local     │           │  classifier  │     │ waste-data│ │
│  │ Storage   │           │   Module     │     │  Module   │ │
│  └───────────┘           └──────┬───────┘     └───────────┘ │
│                                 │                           │
│                     ┌───────────┴───────────┐               │
│                     ▼                       ▼               │
│             ┌──────────────┐         ┌─────────────┐        │
│             │ Teachable    │         │ TensorFlow  │        │
│             │ Machine CDN  │         │ .js CDN     │        │
│             └──────────────┘         └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                               ▲
                               │
            ┌──────────────────┴──────────────────┐
            │       Service Worker (PWA)          │
            │  service-worker.js (smart-waste-v1) │
            │      17 Pre-Cached Shell Assets     │
            └─────────────────────────────────────┘
```

---

## 2. Required Hosting Conditions

The application is fully static and can be deployed to any static web host or CDN, provided the following conditions are met:

1. **HTTPS Protocol (Mandatory):**
   - WebRTC camera access (`navigator.mediaDevices.getUserMedia()`) is restricted by browser security policies strictly to **secure origins** (`https://`) or `http://localhost`.
   - The Service Worker API (`navigator.serviceWorker.register()`) is also restricted to secure contexts.
   - Any deployment to production **must serve over HTTPS** with a valid SSL/TLS certificate.
2. **Static File Serving:**
   - The host must serve static HTML, CSS, JavaScript (MIME type: `application/javascript`), SVG, PNG, and JSON (`application/json`) files.
   - No server-side scripting (PHP, Python, Node.js, Ruby) is required.
3. **CORS Headers for Model Weights (if loading remote models):**
   - If loading a Teachable Machine model hosted on `https://teachablemachine.withgoogle.com/models/...`, standard CORS headers from Google allow cross-origin model retrieval.
   - If hosting model files (`model.json`, `metadata.json`, `weights.bin`) locally on the same origin under `./model/`, same-origin policies apply cleanly with no CORS configuration needed.

---

## 3. Required Production Files & Directory Structure

To deploy the application, the following files and directories must be published to the web host:

```text
├── index.html                   # Core SPA shell & layout
├── manifest.json                # PWA Web App Manifest
├── service-worker.js            # Offline caching & service worker lifecycle
├── css/
│   └── style.css                # Custom responsive, animation, and accessible styles
├── js/
│   ├── app.js                   # Application coordinator & event wiring
│   ├── camera.js                # WebRTC camera access, permissions, and frame capture
│   ├── classifier.js            # Teachable Machine loader, inference, and threshold logic
│   ├── storage.js               # LocalStorage scan history & statistics management
│   ├── ui.js                    # DOM rendering, view transitions, and accessibility helpers
│   ├── utils.js                 # Reusable utility functions
│   └── waste-data.js            # Decoupled disposal guidance data dictionary
├── assets/
│   └── icons/
│       ├── favicon.svg          # Browser tab icon
│       ├── icon.svg             # Vector master application icon
│       ├── icon-192.png         # Standard mobile PWA home screen icon (192x192)
│       ├── icon-512.png         # Splash screen / store icon (512x512)
│       ├── icon-192-maskable.png# Android adaptive launcher icon (192x192)
│       └── icon-512-maskable.png# Android adaptive launcher icon (512x512)
└── model/                       # Optional: Local Teachable Machine model directory
    ├── model.json               # (Deployer-provided model architecture)
    ├── metadata.json            # (Deployer-provided class labels)
    └── weights.bin              # (Deployer-provided model weight shards)
```

---

## 4. Relative Path Verification & Portability

The entire codebase utilizes **relative paths** (`./` or directory-relative paths) instead of root-relative absolute paths (`/`):

- **HTML Asset Linkages:**
  - `<link rel="stylesheet" href="css/style.css">`
  - `<link rel="manifest" href="manifest.json">`
  - `<link rel="icon" type="image/svg+xml" href="assets/icons/favicon.svg">`
  - `<script type="module" src="js/app.js"></script>`
- **Web App Manifest:**
  - `"start_url": "./index.html"`
  - `"scope": "./"`
  - `"src": "assets/icons/icon-192.png"`
- **Service Worker Cache List:**
  - All 17 pre-cached application shell assets are prefixed with `./` (`./index.html`, `./js/app.js`, etc.).
  - Navigation requests fall back to `./index.html`.

> [!NOTE]
> **Subdirectory Portability:** Because all URLs are relative, the app functions identically whether hosted at the domain root (e.g., `https://smartwaste.example.com/`) or within a repository subdirectory (e.g., `https://username.github.io/smart-waste-classifier/`).

---

## 5. Security & Privacy Audit

A comprehensive security audit of the repository confirmed:
1. **Zero Hardcoded Secrets:** No API keys, credentials, tokens, or private environment variables exist in the codebase.
2. **Zero Hardcoded Localhost URLs:** No references to `http://localhost` or `127.0.0.1` exist in production source code.
3. **Camera Privacy (Client-Side Only):** Camera frames captured onto the `<canvas>` element remain strictly inside browser memory. Images are **never** transmitted to an external server or third-party service.
4. **LocalStorage Privacy (FR-12):** Scans saved to LocalStorage strictly exclude image binary data, canvas data URLs, and base64 strings to safeguard privacy and prevent quota exhaustion.
5. **No Analytics or Trackers:** No tracking pixels, Google Analytics, or third-party cookies are loaded.
6. **Integrity and Security Headers:** External CDN scripts (TensorFlow.js, Teachable Machine, Tailwind CSS) load over secure HTTPS from trusted CDNs (`cdn.jsdelivr.net`, `cdn.tailwindcss.com`).

---

## 6. Production AI Model Configuration & Status

### Current Status
- **Classifier Pipeline:** **100% Implemented & Verified.**  
  Handles model loading states, probability normalizations, category mappings, 75% confidence thresholding, low-confidence rejection, and error recovery.
- **Production Model Endpoint:** **Configured & Validated.**  
  The application is pre-configured with the production Google Teachable Machine model URL:
  `https://teachablemachine.withgoogle.com/models/i63G5gVSy/`
  defined in `js/classifier.js` (`DEFAULT_MODEL_URL`). The model automatically initializes upon launch or scan entry without requiring manual user input.
- **Model Classes:** Trained with 3 waste categories: `Recyclable`, `Organic`, `E-Waste`.
- **Live Weights:** Resolved directly over secure HTTPS with standard CORS headers (`Access-Control-Allow-Origin: *`).

### Retraining or Updating the Model
If the model is retrained or updated in the future:
1. Copy the newly exported Google Teachable Machine shareable URL.
2. Update the `DEFAULT_MODEL_URL` constant in `js/classifier.js`.
3. Alternatively, place the exported `model.json`, `metadata.json`, and `weights.bin` into `./model/`.

---

## 7. Deployment Procedures

### Platform 1: GitHub Pages

1. Push your repository commits to GitHub:
   ```bash
   git push origin main
   ```
2. Navigate to your GitHub repository in your browser.
3. Go to **Settings** $\rightarrow$ **Pages** (under Code and automation).
4. Under **Build and deployment** $\rightarrow$ **Source**, select **Deploy from a branch**.
5. Select branch `main` and folder `/(root)`.
6. Click **Save**.
7. GitHub Pages will build and deploy the site in approximately 1–2 minutes.
8. Access the site at `https://<username>.github.io/<repository-name>/`.
9. Ensure **Enforce HTTPS** is checked under Settings $\rightarrow$ Pages.

### Platform 2: Netlify

#### Option A: Netlify Drop (Instant Zero-Install)
1. Open [Netlify Drop](https://app.netlify.com/drop).
2. Drag and drop the `Smart Garbage` project folder onto the page.
3. Netlify will immediately publish the site and assign a secure `https://*.netlify.app` URL.

#### Option B: Netlify Git Continuous Deployment
1. Connect your GitHub repository to Netlify.
2. Build command: *(leave empty — static site)*
3. Publish directory: `.` *(root)*
4. Click **Deploy Site**. Automatic HTTPS is provisioned by Let's Encrypt.

### Platform 3: Vercel

1. Install the Vercel CLI or import via the Vercel Dashboard:
   ```bash
   npx vercel
   ```
2. Select default settings:
   - Root directory: `./`
   - Framework preset: `Other`
   - Build command: *(None)*
   - Output directory: *(None)*
3. Deploy to production:
   ```bash
   npx vercel --prod
   ```
4. Access via the assigned `https://*.vercel.app` domain.

---

## 8. Post-Deployment Verification Checklist

After deploying to any static hosting provider, run through this verification checklist on both a desktop browser and a real mobile device:

- [ ] **HTTPS Verification:** URL bar displays a secure padlock icon (`https://`).
- [ ] **Console Inspection:** Open Developer Tools (`F12`), verify no script loading errors or missing assets (`404`).
- [ ] **PWA Manifest:** Verify manifest detection in DevTools $\rightarrow$ Application $\rightarrow$ Manifest.
- [ ] **Service Worker:** Verify service worker registration in DevTools $\rightarrow$ Application $\rightarrow$ Service Workers (`smart-waste-v1` active).
- [ ] **Camera Permission Prompt:** Click "Start Camera" on the Scan screen; browser prompts for camera access.
- [ ] **Live Camera Feed:** Camera stream renders fluidly in the viewfinder (rear camera preferred on mobile).
- [ ] **Capture & Canvas:** Tap capture button; preview freeze/canvas capture operates without error.
- [ ] **Model Loading / Configuration:** If custom model URL is entered, verify status badge updates to "Model Ready".
- [ ] **Result & Guidance:** Confident scans show category badges, confidence percentages, and correct disposal advice.
- [ ] **LocalStorage Persistence:** Confident scans appear on the History screen; verify data persists after refreshing the page.
- [ ] **Statistics Dashboard:** Statistics reflect actual scan history counts; Clear History resets values to 0.
- [ ] **Offline Resilience:** Disconnect internet; reload page; verify application shell loads and renders offline.

---

## 9. Troubleshooting Common Production Issues

| Issue | Likely Cause | Solution |
| :--- | :--- | :--- |
| **Camera not starting / Permission denied** | Site served over insecure HTTP | Ensure URL begins with `https://`. WebRTC is blocked on insecure origins. |
| **Camera black screen on mobile** | Permissions rejected or another app using camera | Go to browser site settings, set Camera to "Allow", and close other camera apps. |
| **Model loading failure (CORS error)** | Model URL hosted on an origin that blocks cross-origin requests | Use Teachable Machine's official shareable URL or host files in the same `./model/` directory. |
| **Service worker registration failed** | Browsing in private/incognito mode or insecure context | Use standard browsing session over HTTPS. |
| **404 on page refresh** | Server configured for SPA rewrite rules that don't match static files | The app uses hash routing (`#scan`, `#history`); no server URL rewrite configuration is required. |
| **Updated files not appearing** | Service worker cached older app shell | Service worker checks for updates automatically. Force reload with `Ctrl+Shift+R` or clear browser cache. |

---

## 10. Privacy & Legal Disclaimers

1. **Client-Side Processing Notice:** All camera frames are processed exclusively in the user's browser runtime and are never uploaded or stored on any remote server.
2. **Visual Analysis Disclaimer:** The application performs optical/visual pattern matching based on trained training sets. It does not measure physical weight, chemical purity, or exact material composition.
3. **Local Waste Regulations:** Waste disposal guidance provided by the application reflects standard municipal best practices. Users should always adhere to their local municipality's specific sorting and hazardous waste regulations.

---

*End of Deployment Guide.*
