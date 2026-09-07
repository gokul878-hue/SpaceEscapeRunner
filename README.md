# Space Escape Runner 🚀

A cyberpunk-style arcade game built with **React Native and Expo**. Control a spaceship, avoid descending asteroids, survive increasing difficulty, and beat your locally saved high score.

## Features

- Left/right spaceship controls
- Real-time asteroid movement
- Collision detection
- Progressive difficulty as the score increases
- Animated spaceship movement
- Rotating asteroid animation
- Score tracking
- Persistent high score using AsyncStorage
- Cyberpunk-inspired interface and gradients
- Cross-platform Expo project

## Tech Stack

| Technology | Usage |
|---|---|
| React Native | Mobile UI and game logic |
| React | Component/state management |
| Expo | Development and cross-platform runtime |
| AsyncStorage | Persistent high-score storage |
| Expo Linear Gradient | Visual styling |
| React Native Animated | Movement and animation |

## Project Structure

```text
SpaceEscapeRunner/
├── assets/
├── App.js
├── app.json
├── eas.json
├── index.js
├── package.json
└── README.md
```

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/gokul878-hue/SpaceEscapeRunner.git
cd SpaceEscapeRunner
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start Expo

```bash
npm start
```

You can then run the project using Expo on a supported Android/iOS device or an appropriate development environment.

## How the Game Works

1. Press the launch button to start.
2. Use the left and right controls to move the spaceship.
3. Asteroids continuously descend toward the player.
4. Passing an asteroid increases the score.
5. Asteroid speed increases as the score grows.
6. A collision ends the current run.
7. If the final score beats the previous best, it is saved locally using AsyncStorage.

## Core Programming Concepts

The project demonstrates:

- React hooks (`useState`, `useEffect`, `useRef`)
- Game-loop logic
- Bounding-box collision detection
- State-driven UI
- Animation
- Local persistence
- Responsive positioning using device dimensions

## Future Improvements

- Multiple asteroids and obstacle types
- Sound effects and background music
- Touch/gesture or accelerometer controls
- Power-ups and shields
- Difficulty levels
- Online leaderboard
- Pause/resume functionality

---

Built as a mobile development project exploring React Native, game logic, animation, and local data persistence.
