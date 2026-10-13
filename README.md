<div align="center">

# 🌱 Smart Waste Classifier

### AI-powered waste recognition built for the mobile-first world.

**Scan waste. Understand it. Dispose of it responsibly.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://smart-waste-classifier-steel.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/injmam089/smart-waste-classifier)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-AI-FF6F00?style=for-the-badge&logo=tensorflow)](https://www.tensorflow.org/js)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![SDG 15](https://img.shields.io/badge/SDG%2015-Life%20on%20Land-4C9F38?style=for-the-badge)](https://sdgs.un.org/goals/goal15)

<br>

**♻️ Recyclable &nbsp; • &nbsp; 🌱 Organic &nbsp; • &nbsp; 🔋 E-Waste**

</div>

---

## 📱 What is Smart Waste Classifier?

**Smart Waste Classifier** is a mobile-first AI web application that helps users identify common waste categories using their smartphone camera or gallery.

Instead of asking users to manually decide where an item belongs, the application provides a simple visual classification workflow:

```text
          📷 CAPTURE
              │
              ▼
       🖼️ IMAGE FRAME
              │
              ▼
        🤖 AI ANALYSIS
              │
              ▼
      🏷️ CLASSIFICATION
              │
      ┌───────┼────────┐
      ▼       ▼        ▼
     ♻️      🌱       🔋
 Recyclable Organic  E-Waste
      │       │        │
      └───────┼────────┘
              ▼
       🗑️ DISPOSAL GUIDE
              │
              ▼
        📊 SAVE RESULT
```

The entire core experience is designed to work **client-side in the browser**, with scan history and statistics stored locally.

---

## ✨ Why this project?

Waste segregation sounds simple, but everyday objects are not always easy to categorize.

A user may see:

> "Where should I throw this?"

Smart Waste Classifier turns that question into:

> **Scan → AI identifies → App explains → User disposes responsibly**

### Core goals

- Make waste identification **fast**
- Make the interface **easy enough for anyone**
- Make the experience **camera-first**
- Provide useful disposal guidance
- Keep basic history available without requiring an account
- Encourage better waste-segregation habits

---

# 🚀 Key Features

| Feature | Description |
|---|---|
| 📷 **Smart Scanner** | Scan waste using the phone camera |
| 🖼️ **Gallery Upload** | Analyze an existing image |
| 🤖 **AI Classification** | TensorFlow.js + Teachable Machine |
| ♻️ **3 Waste Classes** | Recyclable, Organic, E-Waste |
| 🎯 **Confidence Threshold** | 75% minimum confidence |
| 🗑️ **Disposal Guidance** | Category-specific handling guidance |
| 📜 **Scan History** | View previous classifications |
| 📊 **Statistics** | Track category distribution |
| 💾 **LocalStorage** | Persistent client-side history |
| 📱 **PWA** | Installable mobile web experience |
| 🌙 **Responsive UI** | Mobile-first with larger-screen support |
| ♿ **Accessible Controls** | Large touch targets and clear states |

---

# 📱 Mobile-First Experience

This project is **not desktop-first UI squeezed into a phone**.

The interface was designed around the way people actually use a smartphone:

```text
┌──────────────────────────┐
│                          │
│       Smart Waste        │
│                          │
│    "Sort smarter.        │
│     Live greener."       │
│                          │
│      ┌────────────┐      │
│      │  📷 SCAN   │      │
│      └────────────┘      │
│                          │
│   Quick Actions          │
│                          │
│   How it works           │
│                          │
├──────────────────────────┤
│ 🏠  📜  📷  📊  ℹ️       │
└──────────────────────────┘
```

### Target mobile viewports

- `360 × 800`
- `390 × 844`
- `412 × 915`

### UX principles

- Large touch targets
- Thumb-friendly controls
- Bottom navigation
- Camera-first interaction
- Minimal steps
- Clear AI feedback
- Safe-area support
- No unnecessary technical clutter

---

# 🧭 App Navigation

The application contains five primary navigation destinations plus the central Scan action:

```text
🏠 Home
   │
   ├── 📷 Scan
   │      └── AI Analysis
   │             └── Result
   │
   ├── 📜 History
   │
   ├── 📊 Statistics
   │
   └── ℹ️ About
```

---

# 🏠 Home

The Home screen acts as the starting point for the entire experience.

### Includes

- 🌱 Eco-focused hero section
- 📷 Primary **Scan Waste** action
- ⚡ Quick actions
- 🧠 How It Works
- ♻️ Supported categories
- 📜 Recent scans

### Hero

> **Sort smarter. Live greener.**

The main action is intentionally obvious:

> **Scan Waste**

---

# 📷 AI Waste Scanner

The scanner is the heart of the application.

### User flow

```text
1. Open Scanner
       ↓
2. Allow Camera
       ↓
3. Position Waste
       ↓
4. Capture
       ↓
5. AI Analysis
       ↓
6. Classification Result
```

### Scanner capabilities

- Live camera preview
- Camera switching
- Gallery selection
- Framing guidance
- Capture button
- Retake option
- AI analysis state
- Error recovery
- Low-confidence handling

The scanner is optimized for portrait mobile usage.

---

# 🤖 AI Classification

The application uses a **Google Teachable Machine image model** running through **TensorFlow.js** in the browser.

### Model classes

| Category | Examples |
|---|---|
| ♻️ **Recyclable** | Plastic, paper, cardboard, glass, metal |
| 🌱 **Organic** | Food and biological waste |
| 🔋 **E-Waste** | Batteries, electronics, PCBs, appliances |

The model evaluates learned visual patterns such as:

- Shape
- Color
- Texture
- Edges
- Surface appearance
- Visual patterns

It then returns probabilities for the available classes.

---

# 🎯 Confidence System

The application uses a **75% confidence threshold**.

```text
              AI Prediction
                   │
          ┌────────┴────────┐
          │                 │
       ≥ 75%              < 75%
          │                 │
          ▼                 ▼
   CONFIDENT RESULT      UNCERTAIN
          │                 │
          ▼                 ▼
   Disposal Guidance     Try Again
```

### Example

```text
Plastic Bottle

♻️ Recyclable
94% confidence

Classification Confident
```

When confidence is below the threshold, the app avoids presenting the prediction as a reliable classification and instead asks the user to try again.

---

# 🧠 AI + Application Logic

The AI model is responsible for **visual classification**.

The application layer is responsible for:

```text
AI Prediction
     │
     ▼
Normalize Label
     │
     ▼
Check Confidence
     │
     ▼
Map Category
     │
     ▼
Load Disposal Guidance
     │
     ▼
Render Result
     │
     ▼
Save Scan
```

This separation keeps the model focused on recognition while the application manages the user experience and category-specific information.

---

# 🗑️ Disposal Guidance

After classification, the application provides practical guidance for the detected category.

Guidance can cover:

- 🧼 Preparation
- 🚛 Appropriate disposal route
- ⚠️ Safety considerations
- 🏛️ Local disposal considerations

> **Important:** Disposal rules differ between cities and municipalities. The application should be treated as an awareness and guidance tool, not a replacement for official local waste-management instructions.

---

# 📜 Scan History

Every successful scan can be saved locally.

### History contains

- Category
- Item/result name
- Confidence
- Timestamp

### Filters

```text
ALL
│
├── ♻️ Recyclable
├── 🌱 Organic
└── 🔋 E-Waste
```

No account is required for the basic local history workflow.

---

# 📊 Statistics

The Statistics screen turns scan history into a simple personal dashboard.

### Metrics

```text
┌────────────────────────────┐
│        YOUR IMPACT         │
├─────────────┬──────────────┤
│ Total Scans │ Recyclable   │
│     25      │      12      │
├─────────────┼──────────────┤
│  Organic    │   E-Waste   │
│      8      │       5      │
└─────────────┴──────────────┘
```

Distribution data helps users understand their own scanning patterns.

---

# 💾 Privacy-First Local Storage

The core application does not require a user account.

Scan information is stored in the browser using:

```text
localStorage
```

### Local data may include

- Scan history
- Classification result
- Confidence
- Timestamp
- Statistics

### Privacy model

```text
📷 Camera
   ↓
🧠 Browser AI
   ↓
📊 Local Result
   ↓
💾 Browser Storage
```

Clearing the browser's site data/storage can remove locally stored history.

---

# 📲 Progressive Web App

Smart Waste Classifier is structured as a **Progressive Web App**.

### PWA capabilities

- `manifest.json`
- Service Worker
- Installable experience
- Cached static assets
- Mobile viewport support
- Safe-area support

The goal is to make the web application feel closer to a lightweight native mobile application.

---

# 🎨 Design System

The visual language follows a **Premium Eco-Tech** direction.

### Primary palette

```text
Deep Forest
#064E3B

Forest Emerald
#065F46

Emerald
#047857

Mint
#10B981

Fresh Mint
#34D399

Surface
#F8FAFC
```

### Semantic category colors

| Category | Direction |
|---|---|
| ♻️ Recyclable | Emerald |
| 🌱 Organic | Lime / Green |
| 🔋 E-Waste | Amber |
| ❓ Uncertain | Slate |

### Typography

**Plus Jakarta Sans**

The interface emphasizes readability and comfortable mobile text sizing.

---

# 🛠️ Technology Stack

## Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Tailwind CSS
- Plus Jakarta Sans

## AI / Machine Learning

- Google Teachable Machine
- TensorFlow.js
- Image Classification

## Browser APIs

- MediaDevices API
- Canvas API
- LocalStorage API
- Service Worker API
- Web App Manifest

## Development / Deployment

- Git
- GitHub
- Vercel

---

# 🏗️ Architecture

```text
┌───────────────────────────────────────────┐
│              Mobile Browser               │
│                                           │
│  ┌─────────────┐      ┌───────────────┐ │
│  │ Camera /    │─────▶│ Canvas / Image │ │
│  │ Gallery     │      │ Preparation    │ │
│  └─────────────┘      └───────┬───────┘ │
│                               │           │
│                               ▼           │
│                    ┌──────────────────┐  │
│                    │ TensorFlow.js    │  │
│                    │ Teachable Model  │  │
│                    └────────┬─────────┘  │
│                             │             │
│                             ▼             │
│                    ┌──────────────────┐  │
│                    │ Classification   │  │
│                    │ + Confidence     │  │
│                    └────────┬─────────┘  │
│                             │             │
│             ┌───────────────┼──────────┐  │
│             ▼               ▼          ▼  │
│        Result UI      Disposal Data   History
│                                      │    │
│                                      ▼    │
│                                  LocalStorage
└───────────────────────────────────────────┘
```

---

# 📁 Project Structure

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
│
├── assets/
│
├── manifest.json
├── service-worker.js
├── README.md
└── .gitignore
```

---

# ⚙️ Run Locally

## 1. Clone the repository

```bash
git clone https://github.com/injmam089/smart-waste-classifier.git
```

## 2. Enter the project

```bash
cd smart-waste-classifier
```

## 3. Start a local server

For VS Code:

1. Open the project folder.
2. Install **Live Server** if necessary.
3. Open `index.html`.
4. Choose **Open with Live Server**.

Camera features work best from a secure context such as:

```text
HTTPS
```

or a local development environment such as:

```text
localhost
```

---

# 📷 Camera Permission

On the first scan:

1. Open **Scan**
2. Allow camera permission
3. Point the camera at the waste
4. Capture
5. Wait for AI analysis
6. Review the result

If the camera is blocked:

```text
Browser Settings
      ↓
Site Permissions
      ↓
Camera
      ↓
Allow
```

---

# 🧪 Testing & Quality

The project has gone through functional and UI regression testing across the implemented phases.

### Mobile viewport checks

| Test | 360×800 | 390×844 | 412×915 |
|---|:---:|:---:|:---:|
| No horizontal overflow | ✅ | ✅ | ✅ |
| Navigation | ✅ | ✅ | ✅ |
| Touch targets | ✅ | ✅ | ✅ |
| Responsive layout | ✅ | ✅ | ✅ |

### Functional areas

- [x] Foundation
- [x] Navigation
- [x] Camera
- [x] AI classifier
- [x] Classification result
- [x] Disposal guidance
- [x] LocalStorage
- [x] History
- [x] Statistics
- [x] PWA
- [x] Accessibility
- [x] Responsive UI

### Automated verification

```text
50 / 50 tests passed
```

The automated flow also verifies the intended capture → analysis → prediction → storage → result workflow.

> **Production note:** Automated testing does not replace final real-device camera testing. A physical smartphone should be used to verify camera permissions, capture, AI loading and result navigation before a release is considered fully production-verified.

---

# 🛡️ Error & Recovery Handling

The scanner includes safeguards for common failures.

### Low confidence

```text
AI confidence < 75%
        ↓
Uncertain Result
        ↓
Improve framing / lighting
        ↓
Scan Again
```

### Model loading

The application handles model initialization before prediction and avoids exposing technical model configuration in the main user experience.

### Capture recovery

If analysis cannot be completed, the user receives a recoverable state instead of being permanently trapped in the capture flow.

---

# 🔐 Security & Privacy

Smart Waste Classifier follows a client-side-first architecture.

### Principles

- No mandatory account
- Camera access controlled by browser permissions
- Scan history stored locally
- No sensitive profile required
- Browser storage can be cleared by the user
- AI inference is performed in the browser

### Important

The application should not be used to make safety-critical decisions about hazardous materials.

---

# 🌍 SDG 15 — Life on Land

Smart Waste Classifier supports environmental awareness through better waste identification and responsible disposal behavior.

### Concept

```text
       🌱 Awareness
            ↓
      🤖 Identification
            ↓
       ♻️ Segregation
            ↓
      🗑️ Disposal
            ↓
     🌍 Cleaner Environment
```

The project aligns with the broader sustainability objective of reducing improper waste handling and encouraging responsible environmental practices.

---

# 📸 Screenshots

> Add final production screenshots here after mobile deployment verification.

Recommended screenshot set:

| Screen | File |
|---|---|
| 🏠 Home | `assets/screenshots/home.png` |
| 📷 Scanner | `assets/screenshots/scanner.png` |
| 🤖 AI Analysis | `assets/screenshots/analysis.png` |
| 🎯 Result | `assets/screenshots/result.png` |
| 🗑️ Disposal | `assets/screenshots/disposal.png` |
| 📜 History | `assets/screenshots/history.png` |
| 📊 Statistics | `assets/screenshots/statistics.png` |

Example:

```markdown
![Home](assets/screenshots/home.png)
![Scanner](assets/screenshots/scanner.png)
![Result](assets/screenshots/result.png)
```

---

# 🚀 Deployment

The project is designed for deployment using **Vercel**.

### Deployment checklist

```text
☑️ Production build
☑️ Correct model configuration
☑️ HTTPS enabled
☑️ Camera permission
☑️ AI model loading
☑️ Real prediction
☑️ Result navigation
☑️ LocalStorage
☑️ PWA assets
☑️ Mobile verification
```

### Live Project

**Repository**

https://github.com/injmam089/smart-waste-classifier

**Live Application**

https://smart-waste-classifier-steel.vercel.app/

---

# 🔮 Roadmap

### Phase 1 — Core Experience
- [x] Camera scanning
- [x] AI classification
- [x] Waste categories
- [x] Disposal guidance
- [x] History
- [x] Statistics

### Phase 2 — Mobile Experience
- [x] Mobile-first redesign
- [x] Bottom navigation
- [x] Camera-first scanner
- [x] PWA
- [x] Accessibility improvements

### Phase 3 — Future Intelligence
- [ ] More waste classes
- [ ] Larger training dataset
- [ ] Multilingual support
- [ ] Local recycling-center discovery
- [ ] Location-aware disposal guidance
- [ ] Community waste insights
- [ ] Optional cloud synchronization
- [ ] Sustainability achievements

---

# 💡 Future Vision

The long-term goal is to evolve the project from a simple classifier into a **personal waste-assistance platform**.

```text
          📷
       Scan Waste
          │
          ▼
        🤖 AI
          │
          ▼
     Identify Item
          │
          ▼
   ♻️ Best Disposal
          │
          ▼
    📍 Find Nearby
      Facility
          │
          ▼
       🌍 Impact
```

---

# 👨‍💻 Project

**Smart Waste Classifier**

Built as an AI + sustainability focused web application with a strong emphasis on mobile usability and practical environmental awareness.

### Project links

- 🌐 **Live:** https://smart-waste-classifier-steel.vercel.app/
- 💻 **GitHub:** https://github.com/injmam089/smart-waste-classifier

---

<div align="center">

### 🌱 Scan smarter. Sort better. Live greener.

**Made with ♻️ + 🤖 + 📱**

</div>
