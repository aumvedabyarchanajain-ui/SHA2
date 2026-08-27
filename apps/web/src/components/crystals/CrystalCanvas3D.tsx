'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Sparkles, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { Sun, Moon, Flame, Sparkles as SparklesIcon, RotateCw, Eye, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export type CrystalModelType =
  | 'pyrite'
  | 'rose_quartz'
  | 'amethyst'
  | 'citrine'
  | 'clear_quartz'
  | 'black_tourmaline'
  | 'lapis_lazuli'
  | 'emerald'
  | 'selenite'

interface CrystalMeshProps {
  modelType: CrystalModelType
  wireframe: boolean
  lightingPreset: 'sunlight' | 'moonlight' | 'candlelight' | 'temple'
  isRotating: boolean
}

/**
 * 3D Procedural Mesh & Shader for authentic gemstone geometries
 */
function GemstoneMesh({ modelType, wireframe, lightingPreset, isRotating }: CrystalMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state, delta) => {
    if (isRotating && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.08
    }
  })

  // Geometry configuration based on mineral crystal system
  const renderGeometry = () => {
    switch (modelType) {
      case 'pyrite':
        // Isometric / Cubic interpenetrating dodecahedron/box cluster
        return <boxGeometry args={[1.5, 1.5, 1.5, 2, 2, 2]} />
      case 'rose_quartz':
        // Trigonal faceted double point
        return <octahedronGeometry args={[1.4, 1]} />
      case 'amethyst':
        // Terminated prismatic geode cluster
        return <cylinderGeometry args={[0.2, 1.2, 2.2, 6, 2]} />
      case 'citrine':
        // 6-sided abundance obelisk generator
        return <cylinderGeometry args={[0.1, 1.1, 2.3, 6, 1]} />
      case 'black_tourmaline':
        // Striated hexagonal grounding column
        return <cylinderGeometry args={[0.9, 1.0, 2.2, 8, 4]} />
      case 'lapis_lazuli':
        // Sacred tablet shape with beveled facets
        return <boxGeometry args={[1.8, 2.2, 0.4]} />
      case 'emerald':
        // Octagonal emerald-cut table
        return <cylinderGeometry args={[1.2, 1.2, 1.4, 8, 1]} />
      case 'selenite':
        // Rectangular charging altar slab
        return <boxGeometry args={[2.2, 0.35, 1.6]} />
      case 'clear_quartz':
      default:
        // 6-sided high-clarity terminated quartz prism
        return <cylinderGeometry args={[0.05, 1.0, 2.4, 6, 2]} />
    }
  }

  // Material and Shading logic per mineral type
  const renderMaterial = () => {
    if (wireframe) {
      return (
        <meshBasicMaterial
          wireframe
          color={
            modelType === 'pyrite' ? '#eab308' :
            modelType === 'amethyst' ? '#c084fc' :
            modelType === 'rose_quartz' ? '#f472b6' :
            modelType === 'citrine' ? '#f59e0b' :
            modelType === 'emerald' ? '#10b981' : '#e2e8f0'
          }
        />
      )
    }

    if (modelType === 'pyrite') {
      // High-metallic golden luster with brass reflections
      return (
        <meshStandardMaterial
          color="#d4af37"
          roughness={0.22}
          metalness={0.92}
          envMapIntensity={1.8}
          bumpScale={0.05}
        />
      )
    }

    if (modelType === 'black_tourmaline') {
      // Deep obsidian-black striated sheen
      return (
        <meshStandardMaterial
          color="#18181b"
          roughness={0.35}
          metalness={0.7}
          envMapIntensity={1.2}
        />
      )
    }

    if (modelType === 'lapis_lazuli') {
      // Royal ultramarine blue with gold flecks
      return (
        <meshStandardMaterial
          color="#1e3a8a"
          roughness={0.38}
          metalness={0.45}
        />
      )
    }

    // Translucent refractive quartz & crystals (Amethyst, Rose Quartz, Citrine, Clear Quartz, Selenite, Emerald)
    const colorMap: Record<string, string> = {
      rose_quartz: '#fbcfe8',
      amethyst: '#7e22ce',
      citrine: '#fef08a',
      clear_quartz: '#f8fafc',
      emerald: '#059669',
      selenite: '#f1f5f9',
    }

    return (
      <meshPhysicalMaterial
        color={colorMap[modelType] || '#ffffff'}
        transparent
        opacity={0.88}
        roughness={0.12}
        metalness={0.08}
        transmission={0.82}
        ior={1.54} // Quartz index of refraction
        thickness={1.6}
        specularIntensity={1.0}
        envMapIntensity={1.5}
      />
    )
  }

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        {renderGeometry()}
        {renderMaterial()}
      </mesh>

      {/* Prana Caustic Aura Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]}>
        <ringGeometry args={[1.2, 1.4, 32]} />
        <meshBasicMaterial
          color={
            modelType === 'pyrite' || modelType === 'citrine' ? '#f59e0b' :
            modelType === 'amethyst' ? '#a855f7' :
            modelType === 'rose_quartz' ? '#ec4899' :
            modelType === 'emerald' ? '#10b981' : '#60a5fa'
          }
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

interface Props {
  modelType?: string | null
  title?: string
  frequencyHz?: number | null
  chakra?: string | null
  className?: string
}

export default function CrystalCanvas3D({
  modelType = 'pyrite',
  title = 'Sacred Crystal',
  frequencyHz = 528,
  chakra = 'Solar Plexus',
  className = '',
}: Props) {
  const [lightingPreset, setLightingPreset] = useState<'sunlight' | 'moonlight' | 'candlelight' | 'temple'>('sunlight')
  const [isRotating, setIsRotating] = useState(true)
  const [wireframe, setWireframe] = useState(false)
  const [hasWebGL, setHasWebGL] = useState(true)

  const normalizedType = (modelType?.toLowerCase().replace(/[^a-z_]/g, '') || 'pyrite') as CrystalModelType

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) setHasWebGL(false)
    } catch {
      setHasWebGL(false)
    }
  }, [])

  return (
    <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-stone-950 text-white border border-amber-500/20 shadow-2xl ${className}`}>
      {/* Top Meta Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] uppercase font-bold tracking-widest backdrop-blur-md">
            3D Sanctuary Preview
          </Badge>
          {frequencyHz && (
            <Badge variant="outline" className="text-[10px] text-slate-300 border-slate-700 backdrop-blur-md">
              {frequencyHz} Hz Resonance
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsRotating(!isRotating)}
            className={`h-8 w-8 rounded-full border border-slate-700 backdrop-blur-md text-slate-300 hover:text-white hover:bg-slate-800 ${isRotating ? 'text-amber-400 border-amber-500/40' : ''}`}
            title="Toggle Rotation"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setWireframe(!wireframe)}
            className={`h-8 w-8 rounded-full border border-slate-700 backdrop-blur-md text-slate-300 hover:text-white hover:bg-slate-800 ${wireframe ? 'text-amber-400 border-amber-500/40' : ''}`}
            title="Toggle Sacred Geometry Wireframe"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div className="w-full h-[380px] md:h-[450px] relative cursor-grab active:cursor-grabbing">
        {hasWebGL ? (
          <Canvas
            camera={{ position: [0, 0, 4.2], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            {/* Environment Lighting Modes */}
            {lightingPreset === 'sunlight' && (
              <>
                <ambientLight intensity={0.7} />
                <directionalLight position={[4, 5, 3]} intensity={2.2} color="#fffbeb" />
                <pointLight position={[-3, -2, -2]} intensity={0.8} color="#f59e0b" />
              </>
            )}

            {lightingPreset === 'moonlight' && (
              <>
                <ambientLight intensity={0.4} color="#1e1b4b" />
                <directionalLight position={[3, 5, 2]} intensity={1.8} color="#93c5fd" />
                <pointLight position={[-2, -3, 1]} intensity={1.2} color="#c084fc" />
              </>
            )}

            {lightingPreset === 'candlelight' && (
              <>
                <ambientLight intensity={0.3} color="#451a03" />
                <pointLight position={[0, -1, 2]} intensity={3.0} color="#ea580c" distance={6} decay={2} />
                <directionalLight position={[2, 3, 1]} intensity={0.8} color="#fbbf24" />
              </>
            )}

            {lightingPreset === 'temple' && (
              <>
                <ambientLight intensity={0.5} />
                <directionalLight position={[0, 5, 2]} intensity={2.0} color="#fef08a" />
                <pointLight position={[3, 2, 2]} intensity={1.5} color="#ec4899" />
                <pointLight position={[-3, -2, -2]} intensity={1.5} color="#3b82f6" />
              </>
            )}

            <Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.6}>
              <GemstoneMesh
                modelType={normalizedType}
                wireframe={wireframe}
                lightingPreset={lightingPreset}
                isRotating={isRotating}
              />
            </Float>

            {/* Sacred Prana Sparkles */}
            <Sparkles
              count={35}
              scale={3.5}
              size={2.5}
              speed={0.4}
              opacity={0.6}
              color={
                normalizedType === 'amethyst' ? '#c084fc' :
                normalizedType === 'rose_quartz' ? '#f472b6' :
                normalizedType === 'emerald' ? '#34d399' : '#fbbf24'
              }
            />

            <OrbitControls
              enablePan={false}
              minDistance={2.5}
              maxDistance={6.0}
              rotateSpeed={0.8}
            />
          </Canvas>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <SparklesIcon className="w-12 h-12 text-amber-400 mb-3 animate-pulse" />
            <p className="font-serif text-lg text-white font-bold">{title}</p>
            <p className="text-xs text-slate-400 mt-1">WebGL 3D preview requires hardware acceleration.</p>
          </div>
        )}
      </div>

      {/* Bottom Lighting Presets Control Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md p-2.5 px-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
          <span>Sacred Lighting:</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setLightingPreset('sunlight')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${lightingPreset === 'sunlight' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Sun className="w-3 h-3" /> Surya (Sun)
          </button>

          <button
            onClick={() => setLightingPreset('moonlight')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${lightingPreset === 'moonlight' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Moon className="w-3 h-3" /> Chandra (Moon)
          </button>

          <button
            onClick={() => setLightingPreset('candlelight')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${lightingPreset === 'candlelight' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Flame className="w-3 h-3" /> Deepam (Altar)
          </button>

          <button
            onClick={() => setLightingPreset('temple')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${lightingPreset === 'temple' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <SparklesIcon className="w-3 h-3" /> Temple Glow
          </button>
        </div>
      </div>
    </div>
  )
}
