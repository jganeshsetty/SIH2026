import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingCrops() {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1} position={[-2, 1, -2]}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#FF6B6B" roughness={0.2} metalness={0.1} />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1} position={[2, -0.5, 1]}>
        <mesh>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#4ECDC4" roughness={0.3} />
        </mesh>
      </Float>
      <Float speed={2.5} rotationIntensity={1} floatIntensity={1.5} position={[0, 1.5, 2]}>
        <mesh>
          <torusGeometry args={[0.4, 0.15, 16, 32]} />
          <meshStandardMaterial color="#FFE66D" roughness={0.1} metalness={0.8} />
        </mesh>
      </Float>
    </group>
  );
}

export function ThreeHero() {
  return (
    <div className="w-full h-[500px] relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
           <Sphere args={[1.5, 64, 64]}>
              <MeshDistortMaterial color="#A8E6CF" distort={0.4} speed={2} roughness={0.2} />
           </Sphere>
        </Float>
        
        <FloatingCrops />
        <Environment preset="forest" />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
