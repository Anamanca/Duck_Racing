# 🦆 Duck Racing

A fun and interactive duck racing web application built with React, TypeScript, Phaser 3, and Vite. Perfect for events, team building, or casual entertainment!

![Duck Racing](https://img.shields.io/badge/Duck-Racing-FFD700)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Phaser](https://img.shields.io/badge/Phaser-3-9FCF46)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)

## ✨ Features

### 🎮 Two Race Modes
- **Fixed Result**: Results determined by vote count (highest votes win). Supports ties!
- **Random**: Results randomized for each race. Vote counts disabled in this mode.

### 🎯 Core Gameplay
- **5-10 ducks** racing simultaneously in separate lanes
- **5+ obstacles per duck** affecting speed dynamically
- **Exact finish order calculation** - Pre-calculated timeline ensures correct ranking
- **Continuous ranking for ties** - Players with same votes share the same rank (1,1,3 not 1,2,3)
- **75% position correction** - Speed gradually adjusts to ensure correct finish order
- **Real-time speed changes** based on obstacles and random buffs
- **Countdown timer** (5-4-3-2-1-GO) before each race
- **Race timer** counting UP from 0 (not down)

### 🎨 Visual Features
- **Extended track** - 75% of screen width for longer races
- **Checkered start/finish zones** - Racing flag pattern
- **Double-sized ducks** (1.2x scale) for better visibility
- **Large bold player names** (28px) with 6px stroke
- **Animated decorations**:
  - 🌊 Flowing river with wave effects and wake trails
  - 🌳 Trees and 🌸 flowers on riverbanks
  - 🦌 Animals watching (deer, crocodile, elephant, bear on left)
  - 🦛 Cheering animals (hippo, dog, cat, ostrich on right)
  - ☁️ Floating clouds and 🐦 flying birds

### 🎭 Duck Effects & Emotions
Each duck displays emotions based on their state:

| Situation | Emoji | Effect |
|-----------|-------|--------|
| Normal swimming | 😊 | Happy face bubble |
| Boost > 30% | 😤 | Determined + lightning ⚡ |
| Normal boost | 😠 | Focused + speed lines 💨 |
| Slow/obstacle | 😰 | Sweating face |
| Hit rock | 😮 | Jump animation + surprise |
| In whirlpool | 😵 | Spin + dizzy stars ⭐✨💫 |
| Under log | 🥽 | Dive + scale down |
| Stuck on branch | 😫 | Shake + frustration |
| Collision | ❗ | Bounce + exclamation |
| Finish line | 🎉 | Celebration bounce |

**Special Effects:**
- **Wake Trail** 💦 - Continuous water splash behind duck
- **Speed Lines** 💨 - Wind effect when moving fast
- **Rainbow Trail** 🌈 - Colorful trail during big boost
- **Lightning** ⚡ - Electric effect for super speed
- **Dizzy Stars** ⭐ - Spinning stars when hit by obstacle
- **Splash Ring** - Expanding water rings

### 🎵 Audio Support
- **Custom music upload** for 3 phases:
  - Countdown music
  - Racing music (loops during race)
  - Finish music (plays on results screen)
- **Default sound effects** when no custom music provided
- **Audio storage** via Dexie.js (IndexedDB)
- **Multiple format support**: MP3, WAV, OGG, M4A, AAC, MP4

### ⚙️ Configurable Settings
- Race duration: **10-120 seconds** (default: 10s)
- Player names (required in both modes)
- **Vote counts** (only active in Fixed Result mode)
- Toggle between Fixed and Random modes
- Add/remove players dynamically

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone or navigate to project
cd duck-racing

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Usage

1. Open the app in your browser (typically `http://localhost:5173`)
2. **Settings Screen** appears:
   - Choose race mode:
     - **Fixed Result**: Enter player names AND vote counts
     - **Random**: Enter player names only (vote input disabled)
   - Set race duration (10-120 seconds)
   - Add players
   - (Optional) Upload custom music files
3. Click **"START RACE"**
4. Watch the **5-second countdown** (5-4-3-2-1-GO)
5. Enjoy the race with animated ducks and obstacles!
6. View **results screen** showing rankings with tie support
7. Click **"Back to Settings"** to return (no auto-restart)

## 🏗️ Architecture

### Tech Stack
- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Game Engine**: Phaser 3 (Arcade Physics)
- **State Management**: Zustand
- **Database**: Dexie.js (IndexedDB wrapper)
- **Styling**: CSS3 with responsive design

### Project Structure

```
duck-racing/
├── src/
│   ├── components/
│   │   └── SettingsScreen.tsx    # React UI for race configuration
│   │
│   ├── core/
│   │   ├── types/
│   │   │   └── race.ts           # TypeScript interfaces
│   │   ├── RaceCalculator.ts     # Core racing logic with exact positioning
│   │   └── ObstacleGenerator.ts  # Generate and distribute obstacles
│   │
│   ├── dexie/
│   │   └── audioDB.ts            # IndexedDB for audio file storage
│   │
│   ├── phaser/
│   │   ├── entities/
│   │   │   └── Duck.ts           # Duck sprite with emotion effects
│   │   │
│   │   ├── managers/
│   │   │   └── RaceManager.ts    # Race scene management
│   │   │
│   │   ├── scenes/
│   │   │   ├── BootScene.ts      # Asset loading
│   │   │   ├── CountdownScene.ts # 5-second countdown
│   │   │   ├── RaceScene.ts      # Main gameplay with timer
│   │   │   └── FinishScene.ts    # Results display with celebration
│   │   │
│   │   └── game.ts               # Phaser game configuration
│   │
│   ├── store/
│   │   └── raceStore.ts          # Zustand global state
│   │
│   ├── App.tsx                   # Main app component
│   ├── App.css                   # Styling
│   └── main.tsx                  # Entry point
│
├── index.html
├── package.json
└── README.md
```

## 🧠 Core Logic

### 1. Race Initialization Flow
```
User clicks START
  ↓
SettingsScreen validates (min 2 players)
  ↓
RaceCalculator.calculateRace()
  ↓
BootScene → CountdownScene (5s)
  ↓
RaceScene starts → RaceManager.create()
  ↓
Ducks race with effects → FinishScene on complete
```

### 2. Finish Order Calculation (Fixed Mode)

**Tie Handling (Continuous Ranking):**
```
Example:
- hieu: 10 votes → Rank 1 🥇 WINNER
- hai: 10 votes  → Rank 1 🥇 WINNER (tied!)
- mai: 6 votes   → Rank 3 🥉 (skips rank 2)
- quan: 6 votes  → Rank 3 🥉 (tied!)
- hu: 3 votes    → Rank 5
```

**Algorithm:**
1. Group players by vote count
2. Sort groups by votes (descending)
3. Assign same rank to all in tie group
4. Next group gets rank = current position + group size

### 3. Speed & Position Calculation

**Pre-calculated Timeline:**
```typescript
// For each frame (60fps):
// 1. Calculate exact target position using easing function
// 2. Velocity = (targetX - prevX) * fps
// 3. Apply visual effects based on velocity ratio
// 4. Enforce exact position (visual effects don't affect outcome)
```

**Finish Time Formula:**
- Rank 1: `raceDuration - 1.5s`
- Rank N: `raceDuration - 1.5s + (N-1) × 0.4s`

### 4. Obstacle System

**Types & Effects:**
| Type | Emoji | Speed Reduction | Animation |
|------|-------|-----------------|-----------|
| Rock | 🪨 | 35% | Jump |
| Log | 🪵 | 25% | Dive (scale down) |
| Whirlpool | 🌀 | 45% | Spin + dizzy stars |
| Branch | 🌿 | 30% | Shake stuck |
| Collision | 💥 | 15% | Bump bounce |

**Distribution:**
- Minimum 5 obstacles per duck
- Evenly distributed along track
- Logs affect all lanes; others affect nearby lanes

### 5. Lane System

- **River**: 75% of screen width
- **Lanes**: Evenly distributed vertically
- **Each duck**: Stays in assigned lane, Y-position fixed
- **Start/Finish zones**: Checkered pattern, 40px wide

## 🎨 Visual Assets

### Procedural Graphics
- Duck sprites generated via Phaser Graphics API
- Checkered start/finish patterns
- Animated wave lines on river
- Firework particle effects

### Emoji Decorations
- Trees: 🌳
- Flowers: 🌸 🌺 🌻 🌷 🌼
- Animals Left: 🦌 🐊 🐘 🐻
- Animals Right: 🦛 🐕 🐈 🐦 🦅
- Clouds: ☁️
- Birds: 🐦 🦅 🕊️

### Duck Effects System

**Continuous Effects:**
- Wake trail (💦) - spawned every 200ms
- Emotion bubble - changes based on state

**Triggered Effects:**
- Speed lines (💨) - when velocity > 110%
- Lightning (⚡) - when velocity > 130%
- Rainbow trail - during boost events
- Dizzy stars (⭐✨💫) - when hitting obstacles
- Splash ring - during boost
- Exclamation (❗) - on collision

## 🔧 Configuration

### Game Config (game.ts)
```typescript
{
  width: 1200,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 } }
  }
}
```

### Race Settings
- **Min Players**: 2
- **Max Players**: 10 (configurable)
- **Min Duration**: 10 seconds
- **Max Duration**: 120 seconds
- **FPS**: 60

## 🐛 Troubleshooting

### Audio Not Playing
- Check browser autoplay policy
- Click on page to activate audio context
- Upload custom audio files if default sounds don't work

### Game Not Starting
- Check console for errors
- Ensure at least 2 players are added
- Try refreshing the page

### Performance Issues
- Reduce number of players
- Shorten race duration
- Close other browser tabs

## 📝 Recent Updates

### Version 2.0 - Major Enhancements

**Core Logic:**
- ✅ Exact position calculation for accurate finish order
- ✅ Continuous ranking (1,1,3) for tie handling
- ✅ Pre-calculated timeline with easing functions
- ✅ Timer counts UP from 0 (not down)

**Visual Effects:**
- ✅ Duck emotion system (😊😤😠😰😵🎉)
- ✅ Wake trails, speed lines, rainbow trails
- ✅ Lightning effects for super boost
- ✅ Dizzy stars, splash rings, fireworks
- ✅ Double-sized ducks with bold names

**UI Improvements:**
- ✅ "CONGRATULATIONS!" title with pulse animation
- ✅ Winner highlight with gold background
- ✅ Vote input disabled in Random mode
- ✅ No auto-restart (manual control)
- ✅ Extended track (75% width)

**Bug Fixes:**
- ✅ Fixed auto-start on load
- ✅ Fixed countdown timing
- ✅ Fixed position correction at 75%
- ✅ Fixed audio file chooser visibility

## 📝 License

MIT License - Feel free to use for personal or commercial projects!

## 🙏 Credits

- Built with [Phaser 3](https://phaser.io/)
- UI powered by [React](https://react.dev/)
- State management by [Zustand](https://github.com/pmndrs/zustand)
- Audio storage via [Dexie.js](https://dexie.org/)

---

Made with 💛 and 🦆🦆🦆

**Happy Racing!** 🏁🎮
