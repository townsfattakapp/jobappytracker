'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface HeroSceneProps {
  /** CSS height of the canvas area. */
  height?: number
  className?: string
}

/**
 * A lightweight Three.js hero: a slowly turning torus knot lit in the brand
 * palette, wrapped in a drifting particle field. Transparent background so it
 * sits on any surface. Pauses when hidden and renders a single frame when the
 * user prefers reduced motion.
 */
export default function HeroScene({ height = 220, className = '' }: HeroSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0, 6.2)

    // Knot in brand colours
    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.15, 0.34, 220, 32, 2, 3),
      new THREE.MeshPhysicalMaterial({
        color: 0xc13584,
        metalness: 0.35,
        roughness: 0.22,
        clearcoat: 0.6,
        clearcoatRoughness: 0.3,
        emissive: 0x3b0a3a,
        emissiveIntensity: 0.35,
      }),
    )
    scene.add(knot)

    // Halo ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.3, 0.02, 12, 160),
      new THREE.MeshBasicMaterial({ color: 0xf77737, transparent: true, opacity: 0.45 }),
    )
    ring.rotation.x = Math.PI / 2.4
    scene.add(ring)

    // Particles
    const count = 360
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const r = 2.6 + Math.random() * 2.2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({ color: 0xe6683c, size: 0.045, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }),
    )
    scene.add(particles)

    // Lights: purple from the left, orange from the right, soft white key
    scene.add(new THREE.AmbientLight(0xffffff, 0.35))
    const purple = new THREE.PointLight(0x833ab4, 40, 20)
    purple.position.set(-4, 2, 3)
    const orange = new THREE.PointLight(0xf77737, 40, 20)
    orange.position.set(4, -2, 3)
    const key = new THREE.DirectionalLight(0xffffff, 1.4)
    key.position.set(1, 3, 4)
    scene.add(purple, orange, key)

    // Pointer parallax
    const target = { x: 0, y: 0 }
    const onPointer = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect()
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.6
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * -0.4
    }
    mount.addEventListener('pointermove', onPointer)

    const resize = () => {
      const w = mount.clientWidth || 1
      const h = mount.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(mount)

    let frame = 0
    let running = true
    const clock = new THREE.Clock()
    const render = () => {
      const t = clock.getElapsedTime()
      knot.rotation.x = t * 0.25 + target.y
      knot.rotation.y = t * 0.35 + target.x
      ring.rotation.z = t * 0.12
      particles.rotation.y = t * 0.05
      camera.position.x += (target.x * 0.8 - camera.position.x) * 0.05
      camera.position.y += (target.y * 0.8 - camera.position.y) * 0.05
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }
    const loop = () => {
      if (!running) return
      render()
      frame = requestAnimationFrame(loop)
    }
    const onVisibility = () => {
      running = !document.hidden && !reduceMotion
      if (running) loop()
      else cancelAnimationFrame(frame)
    }
    document.addEventListener('visibilitychange', onVisibility)
    if (reduceMotion) render()
    else loop()

    return () => {
      running = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      mount.removeEventListener('pointermove', onPointer)
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry.dispose()
          const m = obj.material as THREE.Material | THREE.Material[]
          if (Array.isArray(m)) m.forEach((x) => x.dispose())
          else m.dispose()
        }
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className={`hero-scene ${className}`} style={{ height }} aria-hidden="true" />
}
