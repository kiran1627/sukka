# ✨ AURORA — Interactive Cinematic Birthday Experience

> A breathtaking 15-scene interactive cinematic birthday experience built with Next.js 15, React 19, Three.js, GSAP, and a rich ecosystem of animation libraries.

![Aurora](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-R3F-000?style=for-the-badge&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)

---

## 🎬 The Experience

Aurora takes the recipient through 15 emotionally-crafted scenes:

| # | Scene | Description |
|---|-------|-------------|
| 1 | **Boot Sequence** | Cinematic startup with typewriter text and soft piano |
| 2 | **Galaxy** | Fly through nebulae as stars spell "Happy Birthday" |
| 3 | **Moon** | Recipient's name materializes on a glowing moon |
| 4 | **Butterflies** | Moon explodes into butterflies, roses, and sparkles |
| 5 | **Secret Portal** | Password-locked love portal (password: configurable) |
| 6 | **Magic Forest** | Interactive flowers reveal photo memories |
| 7 | **Gift Box** | 3D gift with ribbon unwrap and particle explosion |
| 8 | **Memory Tunnel** | Auto-traveling through floating photo cards |
| 9 | **Love Timeline** | Interactive timeline of your relationship |
| 10 | **Birthday Cake** | 3D cake with blow-to-extinguish candles (mic support) |
| 11 | **Love Letter** | Envelope opens, typewriter reveals your letter |
| 12 | **The Question** | Playful YES/NO with dodging button behavior |
| 13 | **Celebration** | Massive fireworks spelling names and messages |
| 14 | **Aurora Sky** | Northern lights, lanterns, and a final quote |
| 15 | **Hidden Surprises** | Unlockable gallery, coupons, dreams, promises |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (recommended 20+)
- npm 9+

### Installation

```bash
# Clone the repository
cd AURORA

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the experience.

---

## ⚙️ Configuration

**Everything is configurable from a single JSON file.** Edit `config/content.json` to customize:

```
config/
  content.json     ← All dynamic content lives here
```

### Content Structure

| Field | Type | Description |
|-------|------|-------------|
| `recipientName` | string | The birthday person's name |
| `password` | string | Secret portal password (default: "I Love You") |
| `bootMessages` | string[] | Boot sequence messages |
| `photos` | Photo[] | Memory photos with captions and dates |
| `videos` | Video[] | Video memories |
| `music.scenes` | Record | Background music per scene |
| `music.effects` | Record | Sound effects |
| `timeline` | TimelineEvent[] | Relationship milestones |
| `quotes` | string[] | Romantic quotes |
| `loveLetter` | string | The birthday letter text |
| `gallery` | GalleryItem[] | Secret gallery photos |
| `specialDates` | SpecialDate[] | Important dates |
| `voiceNotes` | VoiceNote[] | Voice messages |
| `futureDreams` | string[] | Future dreams together |
| `bucketList` | BucketListItem[] | Bucket list items |
| `reasonsILoveYou` | string[] | Reasons I love you |
| `loveCoupons` | LoveCoupon[] | Redeemable love coupons |
| `promiseWall` | string[] | Promises to the recipient |

---

## 🎵 Adding Audio

Place audio files in the `public/audio/` directory:

```
public/
  audio/
    piano-gentle.mp3        ← Scene 1 music
    cosmic-ambient.mp3      ← Scene 2 music
    emotional-strings.mp3   ← Scene 3 music
    ...
    sfx/
      sparkle.mp3           ← Sound effects
      whoosh.mp3
      pop.mp3
      ...
    voice/
      note-1.mp3            ← Voice messages
```

Update `config/content.json` → `music.scenes` and `music.effects` with the correct paths.

---

## 🖼️ Adding Photos & Videos

Place media files in the `public/` directory:

```
public/
  images/
    memory-1.jpg            ← Memory photos
    memory-2.jpg
    timeline/
      first-meeting.jpg     ← Timeline event photos
    gallery/
      photo-1.jpg           ← Secret gallery photos
  videos/
    moment-1.mp4            ← Video memories
```

Update `config/content.json` with the correct file paths.

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | GSAP, Motion |
| 3D | Three.js, React Three Fiber, Drei, Post Processing |
| Particles | tsParticles |
| Audio | Howler.js |
| State | Zustand |
| Deployment | Vercel |

---

## 📱 Responsive Design

Aurora works on all devices:
- ✅ Desktop (1920px+)
- ✅ Laptop (1024px)
- ✅ Tablet (768px)
- ✅ Mobile (375px)
- ✅ Landscape & Portrait

---

## ♿ Accessibility

- Keyboard navigation throughout
- `prefers-reduced-motion` support (disables heavy animations)
- ARIA labels on all interactive elements
- Screen reader friendly scene transitions
- Click fallback for microphone-dependent features

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Build

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
AURORA/
├── config/content.json          # All dynamic content
├── public/
│   ├── audio/                   # Music & sound effects
│   ├── images/                  # Photos & assets
│   ├── videos/                  # Video memories
│   └── fonts/                   # Custom fonts
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/content/         # Content API route
│   │   ├── globals.css          # Design system
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Main page
│   ├── components/
│   │   ├── scenes/              # 15 scene components
│   │   ├── effects/             # Visual effects (cursor glow)
│   │   ├── ui/                  # Reusable UI components
│   │   └── SceneManager.tsx     # Scene orchestrator
│   ├── hooks/                   # Custom hooks
│   ├── store/                   # Zustand store
│   ├── lib/                     # Utilities & fonts
│   └── types/                   # TypeScript types
├── next.config.ts
├── vercel.json
└── package.json
```

---

## 🎨 Design System

### Colors
- **Background**: `#050505`, `#090814`, `#0F172A`
- **Gold**: `#D4A853` / `#F5D88E`
- **Aurora Blue**: `#60A5FA`
- **Warm Pink**: `#F9A8D4`
- **Lavender**: `#A78BFA`
- **Green**: `#34D399`

### Typography
- **Serif**: Playfair Display (headings, emotional text)
- **Sans**: Inter (body, UI)
- **Script**: Great Vibes (titles, romantic text)

### Effects
- Glassmorphism cards with mouse-tracking tilt
- Cursor glow trail
- Particle backgrounds (stars, fireflies, sparkles, aurora)
- GSAP-powered scene transitions
- GLSL shaders (nebula, aurora borealis)

---

## License

Made with ❤️ for someone special.
