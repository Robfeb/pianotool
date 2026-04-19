# 🎹 Rob's Piano Tool

A high-performance, interactive music theory and practice station built with **Angular 21**, **Tone.js**, and designed as a fully responsive **Progressive Web App (PWA)**.

## 🚀 Key Features

### 🎹 Interactive Virtual Keyboard
- **Responsive Design**: Adapts to Desktop, Tablet, and Mobile.
- **PC Keyboard Mapping**: Play notes instantly using your computer keys (A through Ñ).
- **Octave & Sound Control**: Shift octaves (Z/X) and cycle through 20+ instrument presets (C/V) in real-time.

### 🎼 MIDI Player & Practice Engine
- **Vast Library**: Built-in access to over **300 songs and exercises** categorized by difficulty.
- **Practice Mode**: Smart sequential matching—the app waits for you to play the correct note before advancing.
- **Hand Selection**: Isolate the Left Hand (Pink) or Right Hand (Green) for focused practice.
- **Real-time Visualization**: Synchronized "falling" notes visual feedback on the keyboard.

### 📐 Music Theory Engine
- **Chord Library**: Over 14 chord types (Maj, Min, 7th, Dim, etc.) available in all 12 keys.
- **Sun-Glow Visualization**: Theory-selected notes glow in a distinct **Gold Gradient** to separate them from practice targets.
- **Bilingual Interface**: Seamlessly switch between English and Spanish (🇪🇸) at any time.

### ⏱️ Integrated Metronome
- **Precision Timing**: Built on the Tone.js transport engine for zero-jitter performance.
- **Customizable**: Adjustable BPM (40-240), multiple beat counts (2, 3, 4), and accent toggles.
- **Shortcuts**: Start/Stop instantly with the **'M'** key.

### 📲 PWA & Customization
- **Installable**: Add to your Home Screen or Desktop as a native app with custom premium branding.
- **Theming**: Premium **Dark/Light** mode support with automated persistence.
- **Persistent Settings**: All your preferences (language, theme, panel visibility, BPM) are saved locally.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Angular 21 (Signals-based reactivity).
- **Audio Engine**: Tone.js (v15+) using Advanced Web Audio API.
- **PWA**: @angular/pwa for offline caching and standalone installation.
- **Styling**: SCSS with CSS Variables for dynamic real-time theming.
- **State Management**: Angular Signals + LocalStorage for robust persistence.

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone [repo-url]
   cd pianotool
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🎹 Keyboard Mappings (Quick Reference)

| Key Type | Key Mappings |
| :--- | :--- |
| **White Keys** | `A` `S` `D` `F` `G` `H` `J` `K` `L` `Ñ` |
| **Black Keys** | `W` `E` `T` `Y` `U` `O` `P` |
| **Octave Shift** | `Z` (Down), `X` (Up) |
| **Sound Preset** | `C` (Prev), `V` (Next) |
| **Metronome** | `M` (Start/Stop) |

---

Developed with ❤️ for Piano Learners.
