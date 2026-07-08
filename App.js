import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Dimensions, Alert, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SHIP_WIDTH = 46;
const SHIP_HEIGHT = 60;
const ASTEROID_SIZE = 44;

const STEP = 35; 
const MIN_X = 20; 
const MAX_X = SCREEN_WIDTH - SHIP_WIDTH - 20; 
const SHIP_BOTTOM_OFFSET = 120;

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [shipX, setShipX] = useState((SCREEN_WIDTH - SHIP_WIDTH) / 2);
  const [gameActive, setGameActive] = useState(false);

  const [asteroidX, setAsteroidX] = useState(Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE));
  const [asteroidY, setAsteroidY] = useState(-ASTEROID_SIZE);

  // --- ANIMATION UTILITIES ---
  const shipAnimatedX = useRef(new Animated.Value((SCREEN_WIDTH - SHIP_WIDTH) / 2)).current;
  const asteroidRotation = useRef(new Animated.Value(0)).current;
  const gameLoopRef = useRef(null);

  // Load high score on launch
  useEffect(() => {
    loadHighScore();
  }, []);

  // Smoothly slide spaceship when position state updates
  useEffect(() => {
    Animated.spring(shipAnimatedX, {
      toValue: shipX,
      useNativeDriver: false,
      friction: 7,
      tension: 40
    }).start();
  }, [shipX]);

  // Infinite slow rotation loop for the asteroid geometry
  useEffect(() => {
    if (gameActive) {
      Animated.loop(
        Animated.timing(asteroidRotation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();
    } else {
      asteroidRotation.setValue(0);
    }
  }, [gameActive]);

  const loadHighScore = async () => {
    try {
      const savedScore = await AsyncStorage.getItem('space_high_score');
      if (savedScore !== null) setHighScore(parseInt(savedScore, 10));
    } catch (e) {
      console.log(e);
    }
  };

  const checkAndUpdateHighScore = async (finalScore) => {
    if (finalScore > highScore) {
      try {
        setHighScore(finalScore);
        await AsyncStorage.setItem('space_high_score', finalScore.toString());
        Alert.alert('🚀 NEW RECORD! 🚀', `Incredible flight! New Best: ${finalScore}`);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const getRandomX = () => Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE - 40) + 20;

  const resetAndStartGame = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setScore(0);
    const initialX = (SCREEN_WIDTH - SHIP_WIDTH) / 2;
    setShipX(initialX);
    shipAnimatedX.setValue(initialX);
    setAsteroidY(-ASTEROID_SIZE);
    setAsteroidX(getRandomX());
    setGameActive(true);
  };

  const gameOver = () => {
    setGameActive(false);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    const finalScore = score;
    
    Alert.alert('💥 HULL CRITICAL 💥', `Spaceship destroyed.\nFinal Score: ${finalScore}`, [
      { text: 'RESPAWN', onPress: resetAndStartGame }
    ]);
    checkAndUpdateHighScore(finalScore);
  };

  // --- PHYSICS ENGINE LOOP ---
  useEffect(() => {
    if (gameActive) {
      gameLoopRef.current = setInterval(() => {
        setAsteroidY((prevY) => {
          // Dynamic scaling speed calculation based on current progress
          const speedMultiplier = 6 + Math.min(4, Math.floor(score / 5) * 0.8);
          const nextY = prevY + speedMultiplier;

          if (nextY > SCREEN_HEIGHT) {
            setScore((s) => s + 1);
            setAsteroidX(getRandomX());
            return -ASTEROID_SIZE;
          }
          return nextY;
        });
      }, 16);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameActive, score]);

  // --- COLLISION COMPILER ---
  useEffect(() => {
    if (!gameActive) return;

    const shipTop = SCREEN_HEIGHT - SHIP_BOTTOM_OFFSET - SHIP_HEIGHT;
    const shipBottom = SCREEN_HEIGHT - SHIP_BOTTOM_OFFSET;
    const asteroidBottom = asteroidY + ASTEROID_SIZE;

    // Check against Animated X value bounding box approximation
    const shipLeft = shipX;
    const shipRight = shipX + SHIP_WIDTH;
    const asteroidLeft = asteroidX;
    const asteroidRight = asteroidX + ASTEROID_SIZE;

    if (asteroidBottom >= shipTop && asteroidY <= shipBottom) {
      if (asteroidRight >= shipLeft && asteroidLeft <= shipRight) {
        gameOver();
      }
    }
  }, [asteroidX, asteroidY, shipX, gameActive]);

  const moveLeft = () => {
    if (!gameActive) return;
    setShipX((prev) => Math.max(MIN_X, prev - STEP));
  };

  const moveRight = () => {
    if (!gameActive) return;
    setShipX((prev) => Math.min(MAX_X, prev + STEP));
  };

  // Interpolate rotation steps for spinning asteroid
  const spin = asteroidRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <LinearGradient colors={['#060612', '#0B0B26', '#150A36']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HUD Header Bar */}
      <View style={styles.topContainer}>
        <Text style={styles.title}>SPACE ESCAPE</Text>
        <Text style={styles.subtitle}>R U N N E R</Text>

        <View style={styles.dashboardContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreNumber}>{score}</Text>
          </View>
          <View style={[styles.scoreBox, styles.highScoreBox]}>
            <Text style={styles.highScoreLabel}>BEST SYSTEM</Text>
            <Text style={styles.highScoreNumber}>{highScore}</Text>
          </View>
        </View>

        {!gameActive && (
          <TouchableOpacity style={styles.launchButton} onPress={resetAndStartGame}>
            <Text style={styles.launchButtonText}>LAUNCH APPARATUS</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Deep Space Game Area */}
      <View style={styles.gameArea}>
        {/* Animated Asteroid with detailed geometric rock shards */}
        {gameActive && (
          <Animated.View style={[styles.asteroid, { left: asteroidX, top: asteroidY, transform: [{ rotate: spin }] }]}>
            <View style={styles.craterOne} />
            <View style={styles.craterTwo} />
            <View style={styles.rockEdge} />
          </Animated.View>
        )}

        {/* Animated Spaceship */}
        <Animated.View style={[styles.spaceship, { left: shipAnimatedX }]}>
          <View style={styles.laserSpike} />
          <View style={styles.cockpitShield} />
          <View style={styles.heavyMainBody} />
          <View style={styles.leftWingBlade} />
          <View style={styles.rightWingBlade} />
          <View style={styles.plasmaThrusterGlow} />
        </Animated.View>
      </View>

      {/* Cyberpunk Navigation Deck */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={moveLeft} disabled={!gameActive}>
          <LinearGradient colors={['rgba(0,255,204,0.15)', 'rgba(0,255,204,0.02)']} style={styles.btnGradient}>
            <Text style={styles.controlButtonText}>◀</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={moveRight} disabled={!gameActive}>
          <LinearGradient colors={['rgba(0,255,204,0.15)', 'rgba(0,255,204,0.02)']} style={styles.btnGradient}>
            <Text style={styles.controlButtonText}>▶</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  topContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#00FFCC',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 255, 204, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#706F94',
    letterSpacing: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  dashboardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '88%',
    marginBottom: 20,
  },
  scoreBox: {
    backgroundColor: 'rgba(11, 11, 38, 0.6)',
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 6,
  },
  highScoreBox: {
    borderColor: 'rgba(255, 170, 0, 0.3)',
    backgroundColor: 'rgba(255, 170, 0, 0.03)',
  },
  scoreLabel: {
    fontSize: 9,
    color: '#656582',
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 2,
  },
  scoreNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
  },
  highScoreLabel: {
    fontSize: 9,
    color: '#FFAA00',
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 2,
  },
  highScoreNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFAA00',
    textShadowColor: 'rgba(255, 170, 0, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  launchButton: {
    backgroundColor: '#00FFCC',
    paddingVertical: 14,
    paddingHorizontal: 44,
    borderRadius: 12,
    shadowColor: '#00FFCC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  launchButtonText: {
    color: '#060612',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  // Advanced Asteroid Structural Geometry
  asteroid: {
    position: 'absolute',
    width: ASTEROID_SIZE,
    height: ASTEROID_SIZE,
    backgroundColor: '#433F57',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2D2A3D',
    overflow: 'hidden',
    shadowColor: '#FF3366',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  craterOne: {
    position: 'absolute',
    top: 6,
    left: 8,
    width: 12,
    height: 12,
    backgroundColor: '#2D2A3D',
    borderRadius: 6,
    opacity: 0.5,
  },
  craterTwo: {
    position: 'absolute',
    bottom: 8,
    right: 6,
    width: 10,
    height: 10,
    backgroundColor: '#2D2A3D',
    borderRadius: 5,
    opacity: 0.5,
  },
  rockEdge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 15,
    height: 15,
    backgroundColor: '#5C5776',
    transform: [{ rotate: '45deg' }],
  },
  // Advanced Spaceship Elements
  spaceship: {
    position: 'absolute',
    bottom: SHIP_BOTTOM_OFFSET,
    width: SHIP_WIDTH,
    height: SHIP_HEIGHT,
    alignItems: 'center',
  },
  heavyMainBody: {
    width: 20,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#00FFCC',
    zIndex: 3,
  },
  laserSpike: {
    width: 4,
    height: 12,
    backgroundColor: '#00FFCC',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    zIndex: 4,
  },
  cockpitShield: {
    position: 'absolute',
    top: 18,
    width: 10,
    height: 14,
    backgroundColor: '#0066FF',
    borderRadius: 4,
    zIndex: 5,
    borderWidth: 1,
    borderColor: '#00FFFF',
  },
  leftWingBlade: {
    position: 'absolute',
    bottom: 4,
    left: -4,
    width: 16,
    height: 28,
    backgroundColor: '#FF0055',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 4,
    zIndex: 2,
    transform: [{ rotate: '-10deg' }],
  },
  rightWingBlade: {
    position: 'absolute',
    bottom: 4,
    right: -4,
    width: 16,
    height: 28,
    backgroundColor: '#FF0055',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 4,
    zIndex: 2,
    transform: [{ rotate: '10deg' }],
  },
  plasmaThrusterGlow: {
    position: 'absolute',
    bottom: -10,
    width: 10,
    height: 12,
    backgroundColor: '#FFCC00',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    shadowColor: '#FF6600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  controlButton: {
    width: '46%',
    height: 65,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.3)',
  },
  btnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#00FFCC',
    fontSize: 24,
    fontWeight: 'bold',
  },
});