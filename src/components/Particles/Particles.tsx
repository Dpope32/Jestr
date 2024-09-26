import React, {useEffect, useState} from 'react';
import {Animated} from 'react-native';
import {styles, Particle} from '../../screens/AuthNav/Onboarding/componentData';

interface ParticlesProps {
  windowWidth: number;
  windowHeight: number;
  density: number;
  color: string;
}

const Particles: React.FC<ParticlesProps> = ({windowWidth, windowHeight}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({length: 20}, () => ({
      left: Math.random() * windowWidth,
      top: Math.random() * windowHeight,
      size: Math.random() * 9 + 2,
      animated: new Animated.Value(0),
    }));

    setParticles(newParticles);

    newParticles.forEach(particle => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.animated, {
            toValue: 1,
            duration: 2000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.animated, {
            toValue: 0,
            duration: 2000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, [windowWidth, windowHeight]);

  return (
    <>
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              opacity: particle.animated,
              transform: [
                {
                  translateY: particle.animated.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -100],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </>
  );
};

export default Particles;
