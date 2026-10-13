# Smart Waste Classifier App
## Complete Master Development Specification for Antigravity AI

**Document:** `SMART_WASTE_CLASSIFIER_ANTIGRAVITY_MASTER_PLAN.md`  
**Version:** 1.0  
**Status:** Master implementation specification  
**Purpose:** Build the complete Smart Waste Classifier App without ambiguity, missing requirements, random architecture changes, or unnecessary complexity.

---

# 0. IMPORTANT INSTRUCTIONS FOR ANTIGRAVITY AI

You are the primary implementation agent for this project.

Your job is to build the **complete production-quality MVP** described in this document.

## Non-negotiable rules

1. Read this entire file before changing code.
2. Treat this document as the implementation source of truth.
3. Do not invent a different architecture unless a requirement here is technically impossible.
4. Do not add a backend/database/authentication system to the MVP.
5. Do not replace Vanilla JavaScript with React, Vue, Angular, or another framework.
6. Do not replace Teachable Machine with another ML platform unless explicitly requested.
7. Do not claim that a phone camera can accurately measure physical weight, exact dimensions, or material composition.
8. Keep camera images client-side. Do not upload them to a project backend.
9. Keep the application modular and readable.
10. Do not leave fake buttons, dead navigation, placeholder pages, or unfinished core functionality.
11. Do not silently remove existing working features while implementing another feature.
12. Before declaring a phase complete, test it.
13. Fix errors rather than hiding them with empty catches or disabled functionality.
14. Do not expose API keys or secrets in source code.
15. Use HTTPS-compatible deployment assumptions.
16. Maintain a clear README and project documentation.
17. If a requirement is ambiguous, prefer the simplest implementation consistent with this document.
18. Never mark a feature complete merely because its UI exists; verify the actual behavior.
19. Keep the MVP lightweight enough to run as a static PWA.
20. At the end of each phase, provide a concise implementation report, files changed, tests performed, and any remaining issue.

---

# 1. PROJECT IDENTITY

## Project Name

**Smart Waste Classifier App**

## One-line description

An AI-powered mobile-first PWA that uses a device camera and a Teachable Machine image-classification model to identify visible waste as **Recyclable, Organic, or E-Waste** and provide practical disposal guidance.

## Primary goal

Make waste identification simple:

**Scan → Analyze → Classify → Guide → Save**

## Target platform

- Mobile browser
- Desktop browser
- Installable PWA on supported browsers

---

# 2. FINAL MVP SCOPE

The MVP shall contain:

- Home screen
- Waste scanning
- Camera permission handling
- Live camera preview
- Image/frame capture
- Teachable Machine model loading
- AI prediction
- Confidence score
- Configurable confidence threshold
- Recyclable category
- Organic category
- E-Waste category
- Disposal guidance
- Low-confidence handling
- Rescan flow
- Scan history
- Basic statistics
- Clear history
- PWA manifest
- Service worker
- Responsive UI
- Accessibility basics
- Error handling
- LocalStorage persistence
- Privacy-safe client-side image processing
- Testing
- README
- Deployment readiness

---

# 3. TECHNOLOGY STACK

## Required

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

### Styling
- Tailwind CSS may be used
- Additional custom CSS is allowed when needed

### AI
- Google Teachable Machine image classification model

### Browser APIs
- `navigator.mediaDevices.getUserMedia()`
- Canvas/image processing APIs as needed
- LocalStorage
- Service Worker API
- Web App Manifest

### Development
- Git
- GitHub
- VS Code or equivalent

### Deployment
The application must be deployable to HTTPS static hosting such as:
- Vercel
- Netlify
- GitHub Pages

Do not require a server for the MVP.

---

# 4. ARCHITECTURE

Use this architecture:

```text
                    ┌──────────────────────┐
                    │        USER          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      PWA / UI        │
                    │ HTML + CSS + JS      │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌────────────────┐          ┌────────────────┐
        │ Camera Module  │          │ History Module │
        └───────┬────────┘          └───────┬────────┘
                │                           │
                ▼                           ▼
        ┌────────────────┐          ┌────────────────┐
        │ Image/Frame    │          │  LocalStorage  │
        └───────┬────────┘          └────────────────┘
                │
                ▼
        ┌────────────────────┐
        │ Classifier Module  │
        └─────────┬──────────┘
                  │
                  ▼
        ┌────────────────────┐
        │ Teachable Machine  │
        │ Image Model        │
        └─────────┬──────────┘
                  │
                  ▼
        ┌────────────────────┐
        │ Prediction +       │
        │ Confidence Handler │
        └─────────┬──────────┘
                  │
          ┌───────┴────────┐
          │                │
      >= threshold      < threshold
          │                │
          ▼                ▼
    ┌─────────────┐  ┌────────────────┐
    │ Classification│ │ Uncertain     │
    └──────┬──────┘  │ / Rescan       │
           │         └────────────────┘
           ▼
    ┌──────────────────┐
    │ Disposal Guidance│
    └────────┬─────────┘
             │
             ▼
       ┌────────────┐
       │ LocalStorage│
       └────────────┘
```

---

# 5. PROJECT STRUCTURE

Use this structure unless there is a strong technical reason to adjust it:

```text
smart-waste-classifier/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── camera.js
│   ├── classifier.js
│   ├── waste-data.js
│   ├── storage.js
│   ├── ui.js
│   └── utils.js
│
├── model/
│   ├── model.json
│   ├── metadata.json
│   └── weights.bin
│
├── assets/
│   ├── icons/
│   ├── images/
│   └── screenshots/
│
├── manifest.json
├── service-worker.js
├── README.md
├── .gitignore
└── SMART_WASTE_CLASSIFIER_ANTIGRAVITY_MASTER_PLAN.md
```

If the Teachable Machine model is hosted remotely rather than downloaded into `/model/`, document the exact model URL and loading method. Never invent a model URL.

---

# 6. APPLICATION ROUTE / SCREEN PLAN

The app can be a single-page application using sections instead of a frontend framework.

Required logical screens:

```text
HOME
  ↓
SCAN
  ↓
PROCESSING
  ↓
RESULT
  ↓
DISPOSAL GUIDANCE

HOME
  ↓
HISTORY
  ↓
STATISTICS
```

Recommended sections:

- `#home`
- `#scan`
- `#result`
- `#history`
- `#statistics`
- optional `#about`

Navigation may use buttons and section switching.

---

# 7. USER FLOW

## Main flow

```text
Open App
   ↓
Home
   ↓
Tap "Scan Waste"
   ↓
Request Camera Permission
   ↓
Camera Preview
   ↓
Position One Waste Object Clearly
   ↓
Capture / Scan
   ↓
Analyze Image
   ↓
AI Prediction
   ↓
Confidence Check
   ↓
 ┌───────────────────────┐
 │                       │
 ▼                       ▼
Confidence ≥ 75%      Confidence < 75%
 │                       │
 ▼                       ▼
Accepted Result       Uncertain Result
 │                       │
 ▼                       ▼
Disposal Guidance     Try Again
 │
 ▼
Save Metadata
 │
 ▼
History / Statistics
```

---

# 8. FUNCTIONAL REQUIREMENTS

## FR-01 Application Launch

The application shall:

- load without runtime errors;
- display the home screen;
- provide a clear Scan Waste action;
- provide access to History;
- provide access to Statistics.

## FR-02 Camera Permission

When scanning starts:

- request camera permission;
- explain why camera access is required;
- handle permission denial gracefully.

Do not repeatedly request permission in a loop.

## FR-03 Camera Preview

When permission is granted:

- display live preview;
- use the rear/environment camera when supported;
- provide a clear scan/capture button;
- allow stopping the camera when leaving the scan screen.

Use:

```javascript
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: { ideal: "environment" }
  },
  audio: false
});
```

Fallback gracefully if this constraint is unsupported.

## FR-04 Capture

The app shall:

- capture the current video frame;
- use Canvas or another appropriate browser mechanism;
- avoid unnecessary full-resolution processing;
- pass the resulting image/frame to the classifier.

## FR-05 Model Loading

The classifier shall:

- load the configured Teachable Machine model;
- show a loading state;
- prevent classification until the model is ready;
- show an error if loading fails;
- provide retry behavior.

## FR-06 Prediction

The classifier shall:

- receive the captured image;
- call the model;
- receive predictions;
- normalize the result into an internal predictable structure.

Example:

```javascript
[
  {
    className: "Recyclable",
    probability: 0.94
  },
  {
    className: "Organic",
    probability: 0.03
  },
  {
    className: "E-Waste",
    probability: 0.02
  }
]
```

The exact output shape may depend on the selected model/runtime.

## FR-07 Classification

Select the prediction with the highest probability.

Do not hard-code a class based only on object names unless the model output actually provides that label.

## FR-08 Confidence

Default:

```text
CONFIDENCE_THRESHOLD = 0.75
```

Make this configurable in one location.

## FR-09 Low Confidence

If:

```text
confidence < 0.75
```

show:

**Unable to identify waste accurately.**

Suggested supporting message:

**Try again with better lighting, a clear background, and one object centered in the camera.**

Do not save a low-confidence result as a successful classification unless the user explicitly chooses a future "save uncertain scan" feature.

## FR-10 Result

Accepted result must show:

- category;
- confidence percentage;
- recognized class/item when available;
- short explanation;
- disposal guidance;
- Scan Again button.

Example:

```text
♻️ Recyclable

Plastic Bottle
94% confidence

This item can generally be recycled when empty,
clean, and accepted by the local recycling system.

[Scan Again]
```

## FR-11 Disposal Guidance

Guidance must be stored separately from UI code.

Recommended structure:

```javascript
const WASTE_DATA = {
  recyclable: {
    label: "Recyclable",
    icon: "♻️",
    colorClass: "...",
    examples: [...],
    guidance: "...",
    tips: [...]
  },
  organic: {
    ...
  },
  eWaste: {
    ...
  }
};
```

Do not hard-code long guidance text throughout `app.js`.

## FR-12 History

Store accepted scan metadata:

```text
scanId
timestamp
category
predictedClass
confidence
guidanceKey
```

Do not store raw camera images in LocalStorage.

## FR-13 Statistics

At minimum display:

- total accepted scans;
- recyclable count;
- organic count;
- e-waste count;
- percentage distribution.

Example:

```text
Total Scans: 25

♻️ Recyclable: 12
🌱 Organic: 8
🔋 E-Waste: 5
```

## FR-14 Clear History

Provide:

- Clear History button;
- confirmation before deletion;
- empty-state UI after deletion.

## FR-15 Rescan

The user shall be able to return directly to camera scanning after a result.

Ensure camera streams are managed correctly.

## FR-16 PWA

Create a valid `manifest.json`.

Include:

- name;
- short_name;
- start_url;
- display;
- theme_color;
- background_color;
- icons;
- description.

Create a service worker for appropriate static asset caching.

Do not falsely claim that AI inference works fully offline if the model/runtime is remotely hosted and unavailable offline.

## FR-17 Error Handling

No raw technical stack traces should be shown to normal users.

Developer console logging is allowed where useful.

---

# 9. NON-FUNCTIONAL REQUIREMENTS

## NFR-01 Usability

The primary scan flow should require minimal interaction.

Recommended:

```text
Home → Scan → Capture → Result
```

## NFR-02 Performance

- Avoid unnecessary large image copies.
- Avoid repeated model loading.
- Load the model once per session where possible.
- Stop camera tracks when scanning is no longer active.
- Avoid expensive DOM updates during camera preview.

## NFR-03 Compatibility

Target modern:

- Chrome
- Edge
- Firefox
- Safari where supported

Camera/PWA support may vary by browser.

## NFR-04 Responsive Design

Test at minimum:

- 360×800
- 390×844
- 412×915
- 768×1024
- 1366×768

## NFR-05 Accessibility

Include:

- semantic HTML;
- visible focus states;
- accessible button labels;
- sufficient text contrast;
- meaningful status messages;
- keyboard-friendly navigation;
- `aria-live` for important result/status updates where appropriate.

## NFR-06 Reliability

The app must not crash if:

- camera is unavailable;
- permission is denied;
- model fails;
- LocalStorage fails;
- prediction fails;
- user leaves scan screen;
- device orientation changes.

## NFR-07 Maintainability

Keep responsibilities separated:

```text
camera.js       → camera lifecycle
classifier.js   → model and predictions
waste-data.js   → category/guidance data
storage.js      → LocalStorage
ui.js           → rendering/UI helpers
utils.js        → shared helpers
app.js          → application orchestration
```

## NFR-08 Security

- No secrets.
- No passwords.
- No unnecessary personal data.
- No arbitrary third-party script injection.
- Validate data before rendering.
- Prefer `textContent` over unsafe `innerHTML` for user-controlled values.

## NFR-09 Privacy

The MVP should:

- process images locally where the chosen model/runtime allows;
- not upload captured images to a project backend;
- not store raw camera images;
- store only scan metadata.

## NFR-10 Scalability

Waste categories must be data-driven so future classes can be added without rewriting the entire application.

## NFR-11 PWA

Service worker must not cache unsafe or unnecessary dynamic data.

---

# 10. AI MODEL REQUIREMENTS

## Model classes

The MVP must support:

```text
Recyclable
Organic
E-Waste
```

## Training data

The training dataset should contain varied examples.

Include:

- different lighting;
- different backgrounds;
- different object angles;
- different distances;
- different object sizes;
- partially rotated objects;
- realistic household environments.

Avoid a dataset where every class has an identical background or composition.

## Dataset quality

Before training:

- remove corrupted images;
- remove irrelevant images;
- balance class sizes where practical;
- avoid duplicate images;
- include real-world variations.

## Model behavior

The application should never assume:

```text
94% = guaranteed truth
```

Instead use:

```text
94% confidence
```

and explain that AI predictions can be wrong.

---

# 11. FEATURE ANALYSIS REQUIREMENTS

The model learns visual features from training data.

Examples include:

- color;
- shape;
- edges;
- texture;
- patterns;
- visual appearance;
- object structure.

The app must NOT claim:

- exact weight;
- exact dimensions;
- chemical composition;
- material purity;
- exact physical measurements.

Unless future hardware is added.

## Correct terminology

Use:

**Visual Feature Analysis**

Not:

**Precise Physical Measurement**

---

# 12. WASTE DATA DESIGN

Create a central data file.

Example:

```javascript
const WASTE_DATA = {
  recyclable: {
    id: "recyclable",
    label: "Recyclable",
    icon: "♻️",
    examples: [
      "Plastic bottles",
      "Paper",
      "Cardboard",
      "Metal cans"
    ],
    guidance: [
      "Empty the item.",
      "Clean it where appropriate.",
      "Separate it from organic waste.",
      "Follow local recycling rules."
    ]
  },

  organic: {
    id: "organic",
    label: "Organic",
    icon: "🌱",
    examples: [
      "Food scraps",
      "Fruit and vegetable waste",
      "Leaves"
    ],
    guidance: [
      "Separate from dry waste.",
      "Use composting or organic-waste collection where available."
    ]
  },

  eWaste: {
    id: "eWaste",
    label: "E-Waste",
    icon: "🔋",
    examples: [
      "Mobile phones",
      "Cables",
      "Small electronics",
      "Batteries"
    ],
    guidance: [
      "Do not mix with normal household waste.",
      "Use an authorized e-waste collection or recycling channel."
    ]
  }
};
```

Guidance should remain general and safe. Local disposal rules can vary by location.

---

# 13. STORAGE DESIGN

Use a single versioned LocalStorage key.

Recommended:

```text
smartWaste.scanHistory
```

Data:

```json
[
  {
    "scanId": "scan-001",
    "timestamp": "2026-10-13T12:00:00.000Z",
    "category": "recyclable",
    "predictedClass": "Recyclable",
    "confidence": 0.94,
    "guidanceKey": "recyclable"
  }
]
```

## Storage helper functions

Implement:

```javascript
getScanHistory()
saveScan(record)
clearScanHistory()
getStatistics()
```

Handle malformed stored JSON gracefully.

---

# 14. CAMERA MODULE DESIGN

`camera.js` responsibilities:

```javascript
startCamera(videoElement)
stopCamera()
captureFrame(videoElement, canvasElement)
isCameraSupported()
```

Requirements:

- prevent multiple streams;
- stop old tracks before creating a new stream;
- stop tracks on leaving scan mode;
- handle permission errors;
- handle unavailable hardware.

---

# 15. CLASSIFIER MODULE DESIGN

`classifier.js` responsibilities:

```javascript
loadModel()
predict(imageElement)
getTopPrediction(predictions)
isConfident(probability)
```

Constants:

```javascript
const CONFIDENCE_THRESHOLD = 0.75;
```

Model should be loaded once when practical.

Do not reload the model for every scan.

---

# 16. UI MODULE DESIGN

`ui.js` may contain:

```javascript
showScreen(id)
showLoading()
showError(message)
showPrediction(result)
showUncertainResult()
renderHistory(history)
renderStatistics(stats)
```

Keep UI rendering separate from prediction logic.

---

# 17. APP ORCHESTRATION

`app.js` should coordinate:

```text
initialize app
    ↓
register service worker
    ↓
load stored history
    ↓
prepare UI
    ↓
prepare classifier
    ↓
handle navigation
    ↓
start camera
    ↓
capture
    ↓
predict
    ↓
confidence validation
    ↓
render result
    ↓
save accepted scan
    ↓
update history/statistics
```

Do not put all logic into one huge file.

---

# 18. UI DESIGN SYSTEM

## Design direction

Use:

- clean;
- modern;
- minimal;
- environmental;
- mobile-first;
- accessible;
- professional.

Avoid:

- excessive animations;
- clutter;
- tiny buttons;
- unnecessary gradients;
- confusing navigation.

## Primary CTA

**Scan Waste**

## Result colors

Use semantic visual meaning:

- Recyclable → green family
- Organic → natural/green family
- E-Waste → amber/orange family

Do not rely only on color; always include text/icons.

---

# 19. HOME SCREEN

Required elements:

```text
Smart Waste Classifier

Identify waste with AI
and learn how to dispose of it responsibly.

[ 📷 Scan Waste ]

[ History ] [ Statistics ]

How it works
1. Scan
2. AI analyzes
3. Get classification
4. Follow disposal guidance
```

---

# 20. SCAN SCREEN

Required:

```text
← Back

Scan Waste

┌─────────────────────────┐
│                         │
│     CAMERA PREVIEW      │
│                         │
│     Center object       │
│                         │
└─────────────────────────┘

Keep one object visible
and use good lighting.

[ Capture / Scan ]
```

Show camera permission/error states clearly.

---

# 21. PROCESSING SCREEN

Show:

```text
Analyzing Waste...

AI is checking visual features.
Please wait.
```

Do not freeze the interface.

---

# 22. RESULT SCREEN

Accepted example:

```text
♻️ RECYCLABLE

Plastic Bottle

94% Confidence

Disposal Guidance

• Empty the bottle.
• Keep it clean where appropriate.
• Place it with accepted recyclable materials.

[ Scan Again ]
[ View History ]
```

---

# 23. LOW-CONFIDENCE SCREEN

Example:

```text
⚠️ Unable to Identify Accurately

Confidence: 52%

Try:
• Better lighting
• Clear background
• One object at a time
• Center the object

[ Try Again ]
```

---

# 24. HISTORY SCREEN

Display cards/list items:

```text
♻️ Recyclable
Plastic Bottle
94%
13 Oct 2026, 5:10 PM
```

Sort newest first.

Empty state:

```text
No scans yet.

Start your first waste scan.
```

---

# 25. STATISTICS SCREEN

Minimum:

```text
Total Scans

25

♻️ Recyclable   12
🌱 Organic       8
🔋 E-Waste       5
```

Optional visual bar/chart may be implemented without adding a charting dependency.

---

# 26. SERVICE WORKER

Implement:

- installation;
- activation;
- cache versioning;
- fetch strategy appropriate for static assets;
- old cache cleanup.

Recommended static cache:

```text
index.html
css/style.css
js/*.js
manifest.json
icons
```

Do not blindly cache every network response.

Provide a mechanism for updating the cache version.

---

# 27. MANIFEST

Example structure:

```json
{
  "name": "Smart Waste Classifier",
  "short_name": "Waste Classifier",
  "start_url": "/",
  "display": "standalone",
  "description": "AI-powered waste classification and disposal guidance.",
  "theme_color": "#166534",
  "background_color": "#f8fafc",
  "icons": []
}
```

Create proper icons before claiming installability is complete.

---

# 28. ERROR STATES

Every important failure must have a user-facing state.

## Camera denied

```text
Camera access is required to scan waste.
Please allow camera permission and try again.
```

## Model failed

```text
AI model could not be loaded.
Please check your connection and try again.
```

## Prediction failed

```text
We couldn't analyze this image.
Please try again.
```

## Storage failed

```text
Your scan was completed, but local history could not be saved.
```

## Unsupported browser

```text
Your browser does not support the camera features required by this app.
Please use a modern browser.
```

---

# 29. SECURITY REQUIREMENTS

Do not:

- store passwords;
- store sensitive personal data;
- expose secret keys;
- upload camera images unnecessarily;
- use `eval()`;
- inject unsanitized user data into HTML;
- add unnecessary third-party tracking.

Use:

```javascript
textContent
```

where possible.

---

# 30. PRIVACY NOTICE

Include a simple privacy statement in the About/footer area:

> Camera input is used for waste classification. The MVP does not upload captured images to a project-owned server and stores only scan metadata locally for history and statistics.

Do not claim stronger privacy guarantees than the actual implementation provides.

---

# 31. TEST PLAN

## Test Group A — Launch

- App opens.
- No console-breaking errors.
- Home UI renders.
- Navigation works.

## Test Group B — Camera

- Camera permission prompt appears.
- Rear camera is preferred.
- Preview appears.
- Capture works.
- Stop/restart works.
- Permission denial is handled.

## Test Group C — AI

- Model loads.
- Prediction returns.
- Highest probability is selected.
- Confidence displays correctly.
- Threshold works.

## Test Group D — Classification

Test representative examples:

### Recyclable
- plastic bottle
- paper
- cardboard
- metal can

### Organic
- food scraps
- fruit/vegetable waste
- leaves

### E-Waste
- mobile phone
- cable
- battery
- small electronic device

The exact classification quality depends on the trained dataset/model.

## Test Group E — Low Confidence

Use difficult/irrelevant images and verify:

```text
confidence < 75%
→ uncertain state
→ no successful history record
→ rescan option
```

## Test Group F — History

- Save accepted scan.
- Reload page.
- Verify history remains.
- Verify newest appears first.
- Clear history.
- Verify empty state.

## Test Group G — Statistics

Verify counts against manually known history.

## Test Group H — PWA

- Manifest detected.
- Service worker registers.
- Icons exist.
- Installation works where supported.
- Cache does not break application updates.

## Test Group I — Responsive

Test:

```text
360×800
390×844
412×915
768×1024
1366×768
```

## Test Group J — Error Handling

Test:

- camera denied;
- camera unavailable;
- model failure;
- invalid image;
- LocalStorage failure;
- rapid navigation;
- repeated scanning.

---

# 32. ACCEPTANCE CRITERIA

The project is considered MVP-complete only when all are true:

- [ ] Home works.
- [ ] Scan flow works.
- [ ] Camera permission works.
- [ ] Camera preview works.
- [ ] Capture works.
- [ ] Model loads.
- [ ] Prediction works.
- [ ] Confidence works.
- [ ] 75% threshold works.
- [ ] Low-confidence state works.
- [ ] Recyclable result works.
- [ ] Organic result works.
- [ ] E-Waste result works.
- [ ] Disposal guidance works.
- [ ] Rescan works.
- [ ] History works.
- [ ] Statistics work.
- [ ] Clear history works.
- [ ] LocalStorage error handling works.
- [ ] PWA manifest works.
- [ ] Service worker works.
- [ ] Responsive layout works.
- [ ] Accessibility basics are implemented.
- [ ] No major console errors remain.
- [ ] README is complete.
- [ ] Deployment has been tested over HTTPS.

---

# 33. DEVELOPMENT PHASES

Do NOT build everything randomly.

## PHASE 0 — Project Audit

Tasks:

1. Inspect current project.
2. Determine whether files already exist.
3. Do not delete useful existing work.
4. Compare current implementation against this specification.
5. Create/update a development checklist.

Deliverable:

```text
PROJECT_AUDIT.md
```

---

## PHASE 1 — Foundation

Build:

- project structure;
- index.html;
- styling;
- navigation;
- responsive shell;
- reusable UI components/helpers;
- basic README.

Acceptance:

- app loads;
- navigation works;
- no broken buttons.

---

## PHASE 2 — Camera

Build:

- permission handling;
- live preview;
- capture;
- camera lifecycle;
- error states.

Acceptance:

- phone camera works;
- camera stops correctly.

---

## PHASE 3 — AI MODEL

Build:

- model integration;
- loading state;
- prediction;
- top prediction;
- confidence;
- threshold.

Acceptance:

```text
Image → Prediction → Confidence
```

works.

---

## PHASE 4 — Classification Result

Build:

- category mapping;
- result UI;
- confidence UI;
- uncertain state;
- rescan.

Acceptance:

- all three categories display correctly.

---

## PHASE 5 — Disposal Guidance

Build:

- `waste-data.js`;
- category guidance;
- examples;
- tips.

Acceptance:

- guidance matches category.

---

## PHASE 6 — Local History

Build:

- storage module;
- scan records;
- history screen;
- clear history;
- empty state.

Acceptance:

- data persists after reload.

---

## PHASE 7 — Statistics

Build:

- counts;
- percentages;
- statistics UI.

Acceptance:

- statistics match stored data.

---

## PHASE 8 — PWA

Build:

- manifest;
- icons;
- service worker;
- caching;
- update strategy.

Acceptance:

- PWA features work on supported browsers.

---

## PHASE 9 — UX POLISH

Improve:

- typography;
- spacing;
- cards;
- buttons;
- loading;
- errors;
- animations only where useful;
- accessibility;
- mobile layout.

Do not redesign working architecture.

---

## PHASE 10 — TESTING

Run all tests from Section 31.

Create:

```text
TEST_REPORT.md
```

with:

```text
Test
Expected
Actual
Status
Notes
```

---

## PHASE 11 — DEPLOYMENT

Deploy to HTTPS hosting.

Verify:

- production URL;
- camera;
- model;
- PWA;
- LocalStorage;
- responsive UI.

Create:

```text
DEPLOYMENT.md
```

---

## PHASE 12 — FINAL AUDIT

Check every FR and NFR.

Create:

```text
FINAL_AUDIT.md
```

with:

```text
Requirement ID
Implementation
Evidence
Status
```

No requirement may be silently ignored.

---

# 34. DEFINITION OF DONE

A feature is DONE only when:

1. Code exists.
2. UI exists if required.
3. Functionality works.
4. Error state exists where applicable.
5. Mobile behavior is checked.
6. Console has no relevant errors.
7. Requirement is tested.
8. Documentation is updated.

---

# 35. GIT WORKFLOW

Recommended commits:

```text
feat: create project foundation
feat: implement camera module
feat: integrate waste classifier model
feat: implement confidence handling
feat: add waste disposal guidance
feat: add scan history
feat: add statistics dashboard
feat: implement PWA support
fix: improve camera error handling
fix: improve classifier error handling
test: complete MVP validation
docs: update project documentation
```

Do not commit:

- passwords;
- private keys;
- unnecessary generated files;
- huge temporary datasets;
- `.env` containing secrets.

---

# 36. README REQUIREMENTS

README must include:

1. Project title
2. Description
3. Problem
4. Solution
5. Features
6. How it works
7. Technology stack
8. AI model
9. Project structure
10. Setup
11. Running locally
12. Camera/HTTPS requirement
13. Model configuration
14. Testing
15. Deployment
16. Privacy
17. Limitations
18. Future scope
19. Screenshots
20. Credits/license where applicable

---

# 37. IMPORTANT TECHNICAL LIMITATIONS

The following statements must remain accurate.

## Camera cannot directly measure weight

Wrong:

> AI measures waste weight using the camera.

Correct:

> The MVP performs visual classification. Physical weight requires a scale/sensor.

## Camera cannot guarantee material composition

Wrong:

> AI scientifically identifies the exact material composition.

Correct:

> AI classifies visual appearance based on trained examples.

## Confidence is not certainty

Wrong:

> 94% means the result is 94% guaranteed correct.

Correct:

> 94% is the model's confidence/probability score for that class.

## Disposal rules vary

Use general guidance and, where appropriate, advise users to follow local waste-management rules.

---

# 38. FUTURE FEATURES — DO NOT IMPLEMENT IN MVP UNLESS REQUESTED

Keep these out of the MVP unless explicitly requested:

- user authentication;
- cloud database;
- admin dashboard;
- payment;
- GPS tracking;
- social features;
- chat;
- unnecessary analytics tracking;
- complex backend;
- unnecessary AI APIs;
- IoT hardware;
- exact weight measurement;
- exact dimension measurement.

---

# 39. OPTIONAL FUTURE ROADMAP

## Version 1.1
- more waste classes;
- improved dataset;
- multilingual guidance;
- improved statistics.

## Version 2.0
- location-aware disposal centers;
- optional cloud sync;
- user accounts;
- advanced object detection.

## Version 3.0
- IoT smart-bin integration;
- weight sensors;
- fill-level sensors;
- environmental analytics.

---

# 40. ANTIGRAVITY EXECUTION PROMPT

Use the following instruction when starting implementation:

> You are the lead software engineer for the Smart Waste Classifier App.
>
> Read `SMART_WASTE_CLASSIFIER_ANTIGRAVITY_MASTER_PLAN.md` completely before making changes.
>
> Build the project according to the exact requirements in that document.
>
> First inspect the existing project and create a `PROJECT_AUDIT.md`. Do not immediately rewrite or delete existing files.
>
> Then implement the project phase-by-phase:
>
> 1. Foundation
> 2. Camera
> 3. AI model
> 4. Classification result
> 5. Disposal guidance
> 6. Local history
> 7. Statistics
> 8. PWA
> 9. UX/accessibility polish
> 10. Testing
> 11. Deployment preparation
> 12. Final audit
>
> After each phase:
>
> - run the relevant tests;
> - inspect the browser console;
> - fix errors;
> - verify the requirement;
> - update documentation;
> - report files changed;
> - report what was tested;
> - report any remaining blocker.
>
> Do not move to the next phase if the current phase has a blocking failure.
>
> Preserve the required architecture:
>
> HTML5 + CSS/Tailwind + Vanilla JavaScript + Teachable Machine + LocalStorage + PWA.
>
> Do not introduce React, backend APIs, authentication, or databases into the MVP.
>
> Do not claim that camera-only AI measures physical weight, exact dimensions, or material composition.
>
> The final product must be a genuinely working application, not only a visual prototype.

---

# 41. FINAL EXPECTED RESULT

At completion, the user should be able to:

```text
Open App
   ↓
Tap Scan Waste
   ↓
Allow Camera
   ↓
Point Camera at Waste
   ↓
Capture
   ↓
AI Analyzes Image
   ↓
Confidence Check
   ↓
┌──────────────┬──────────────┬──────────────┐
│ ♻️ Recyclable │ 🌱 Organic   │ 🔋 E-Waste   │
└──────────────┴──────────────┴──────────────┘
   ↓
View Disposal Guidance
   ↓
Save Scan
   ↓
View History
   ↓
View Statistics
```

The result should feel like a real, usable environmental application rather than a static demo.

---

# 42. FINAL QUALITY CHECKLIST

Before final delivery, verify:

```text
[ ] Application launches
[ ] No major console errors
[ ] Home screen works
[ ] Navigation works
[ ] Camera permission works
[ ] Camera preview works
[ ] Capture works
[ ] Model loads
[ ] AI prediction works
[ ] Confidence displayed
[ ] 75% threshold implemented
[ ] Low-confidence handling works
[ ] Recyclable works
[ ] Organic works
[ ] E-Waste works
[ ] Disposal guidance works
[ ] Rescan works
[ ] History works
[ ] Statistics work
[ ] Clear history works
[ ] LocalStorage works
[ ] Error handling works
[ ] Responsive UI works
[ ] Accessibility basics work
[ ] Manifest valid
[ ] Service worker valid
[ ] PWA installability checked
[ ] README complete
[ ] Test report complete
[ ] Deployment guide complete
[ ] Final audit complete
[ ] No unsupported technical claims
```

---

# 43. FINAL PROJECT PRINCIPLE

**Build less, but build it completely.**

The goal of the MVP is not to have hundreds of features.

The goal is:

**Reliable Scan → Useful AI Classification → Honest Confidence → Correct Guidance → Useful History**

Everything else should support this core experience.
