import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial } from 'three';

interface MarketBarProps {
  position: [number, number, number];
  color: string;
  speed: number;
  delay: number;
}

// A dynamic bar that moves up and down like a stock graph
const MarketBar: React.FC<MarketBarProps> = ({ position, color, speed, delay }) => {
  const meshRef = useRef<Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (meshRef.current) {
      // Sine wave animation to simulate market volatility
      const time = state.clock.elapsedTime;
      const height = 1 + Math.sin(time * speed + delay) * 2; // Scale Y
      
      meshRef.current.scale.y = Math.max(0.2, height);
      meshRef.current.position.y = initialY + (height / 2); // Keep base grounded
      
      // Slight color pulsing
      const material = meshRef.current.material as MeshStandardMaterial;
      if (material && material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = 0.5 + Math.sin(time * 2 + delay) * 0.3;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
};

interface FloatingComplexShapeProps {
  position: [number, number, number];
  color: string;
  speed: number;
}

// Complex floating shape (Torus Knot) representing complex algorithms
const FloatingComplexShape: React.FC<FloatingComplexShapeProps> = ({ position, color, speed }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += speed * 0.01;
      meshRef.current.rotation.y += speed * 0.02;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.5) * 0.005;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusKnotGeometry args={[0.8, 0.2, 100, 16]} />
      <meshStandardMaterial 
        color={color} 
        wireframe 
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

// Moving particles/stars
const StarField = ({ count = 300 }: { count?: number }) => {
   const meshRef = useRef<Mesh>(null);
   const positions = useMemo(() => {
     const pos = new Float32Array(count * 3);
     for(let i=0; i<count; i++) {
       pos[i*3] = (Math.random() - 0.5) * 40; // X
       pos[i*3+1] = (Math.random() - 0.5) * 40; // Y
       pos[i*3+2] = (Math.random() - 0.5) * 20 - 5; // Z
     }
     return pos;
   }, [count]);

   useFrame((state) => {
      if(meshRef.current) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
        meshRef.current.rotation.z = state.clock.elapsedTime * 0.01;
      }
   })

   return (
     <points ref={meshRef}>
       <bufferGeometry>
         <bufferAttribute 
            attach="attributes-position" 
            count={count} 
            itemSize={3} 
            array={positions} 
         />
       </bufferGeometry>
       <pointsMaterial size={0.08} color="#ffffff" transparent opacity={0.8} />
     </points>
   )
}

const Scene3D: React.FC = () => {
  // Generate random bars
  const bars = useMemo(() => {
    const items: MarketBarProps[] = [];
    const colors = ['#00ff88', '#00ccff', '#8800ff', '#ff0055'];
    
    // Create a grid of bars
    for(let x = -8; x <= 8; x+=2) {
       for (let z = -5; z >= -15; z-=2) {
         if (Math.random() > 0.5) { // Randomly skip some to make it look organic
            items.push({
                position: [x + (Math.random() - 0.5), -5, z],
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: 1 + Math.random(),
                delay: Math.random() * 5
            });
         }
       }
    }
    return items;
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#020010] to-[#1a0b2e]">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        {/* Dynamic Background Color via React Three Fiber */}
        <color attach="background" args={['#050210']} />
        
        {/* Fog to blend distant objects */}
        <fog attach="fog" args={['#050210', 5, 25]} />

        {/* Lights */}
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={2} color="#00ccff" />
        <pointLight position={[-10, -10, -5]} intensity={1.5} color="#ff0055" />
        <pointLight position={[0, 0, 5]} intensity={0.5} color="#00ff88" />

        {/* Market Graph Bars */}
        <group rotation={[0.2, 0, 0]}> {/* Tilt the whole group slightly */}
            {bars.map((bar, i) => (
            <MarketBar 
                key={i} 
                position={bar.position} 
                color={bar.color} 
                speed={bar.speed}
                delay={bar.delay}
            />
            ))}
        </group>

        {/* Floating Abstract Shapes */}
        <FloatingComplexShape position={[-6, 3, -5]} color="#00ccff" speed={1} />
        <FloatingComplexShape position={[7, -2, -8]} color="#ff0055" speed={0.8} />
        <FloatingComplexShape position={[0, 5, -10]} color="#00ff88" speed={0.5} />

        <StarField count={500} />
      </Canvas>
      
      {/* Overlay Gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050210] via-transparent to-[#050210] pointer-events-none opacity-80"></div>
    </div>
  );
};

export default Scene3D;