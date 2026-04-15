import { useEffect, useRef, useState } from 'react'
import * as Phaser from 'phaser'
import { useRaceStore } from './store/raceStore'
import { SettingsScreen } from './components/SettingsScreen'
import { ResultsScreen } from './components/ResultsScreen'
import { gameConfig } from './phaser/game'
import { BootScene } from './phaser/scenes/BootScene'
import { CountdownScene } from './phaser/scenes/CountdownScene'
import { RaceScene } from './phaser/scenes/RaceScene'
import { FinishScene } from './phaser/scenes/FinishScene'
import './App.css'

function App() {
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { gameState, setGameState } = useRaceStore()
  const [showSettings, setShowSettings] = useState(true)
  const [showResults, setShowResults] = useState(false)
  const isGameStarted = useRef(false)

  // Initialize Phaser game
  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      const config = {
        ...gameConfig,
        parent: containerRef.current
      }
      gameRef.current = new Phaser.Game(config)
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  // Handle game state changes
  useEffect(() => {
    if (gameState === 'settings') {
      setShowSettings(true)
      setShowResults(false)
    } else if (gameState === 'finished') {
      setShowResults(true)
    } else {
      setShowSettings(false)
      setShowResults(false)
    }
  }, [gameState])

  const handleStartRace = () => {
    setShowSettings(false)
    setShowResults(false)
    setGameState('countdown')

    if (gameRef.current && !isGameStarted.current) {
      isGameStarted.current = true
      // Add scenes dynamically
      gameRef.current.scene.add('BootScene', BootScene)
      gameRef.current.scene.add('CountdownScene', CountdownScene)
      gameRef.current.scene.add('RaceScene', RaceScene)
      gameRef.current.scene.add('FinishScene', FinishScene)
      // Start BootScene
      gameRef.current.scene.start('BootScene')
    } else if (gameRef.current && isGameStarted.current) {
      // Restart: stop all and start fresh
      ['BootScene', 'CountdownScene', 'RaceScene', 'FinishScene'].forEach(sceneKey => {
        const scene = gameRef.current!.scene.getScene(sceneKey)
        if (scene) {
          gameRef.current!.scene.stop(sceneKey)
        }
      })
      gameRef.current.scene.start('BootScene')
    }
  }

  const handleBackToSettings = () => {
    setGameState('settings')
    setShowSettings(true)
    setShowResults(false)
    isGameStarted.current = false
    if (gameRef.current) {
      // Stop all scenes
      ['BootScene', 'CountdownScene', 'RaceScene', 'FinishScene'].forEach(sceneKey => {
        const scene = gameRef.current!.scene.getScene(sceneKey)
        if (scene) {
          gameRef.current!.scene.stop(sceneKey)
        }
      })
      // Remove scenes to allow fresh start
      gameRef.current.scene.remove('BootScene')
      gameRef.current.scene.remove('CountdownScene')
      gameRef.current.scene.remove('RaceScene')
      gameRef.current.scene.remove('FinishScene')
    }
  }

  return (
    <div className="app">
      {/* Settings Overlay */}
      {showSettings && (
        <div className="settings-overlay">
          <SettingsScreen onStartRace={handleStartRace} />
        </div>
      )}

      {/* Phaser Game Container */}
      <div
        ref={containerRef}
        className="game-container"
        style={{
          width: '100vw',
          height: '100vh',
          display: showSettings || showResults ? 'none' : 'block'
        }}
      />

      {/* Results Overlay */}
      {showResults && (
        <ResultsScreen onBackToSettings={handleBackToSettings} />
      )}
    </div>
  )
}

export default App
