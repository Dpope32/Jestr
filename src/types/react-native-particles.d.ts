declare module 'react-native-particles' {
    import { ViewProps } from 'react-native';
    
    interface ParticlesProps extends ViewProps {
      particleSize?: number;
      particleColor?: string;
      numberOfParticles?: number;
      speed?: number;
      width: number;
      height: number;
    }
    
    const Particles: React.FC<ParticlesProps>;
    export default Particles;
  }