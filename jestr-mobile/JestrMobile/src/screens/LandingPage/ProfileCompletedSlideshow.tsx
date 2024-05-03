import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProfileCompletedSlideshowProps {
  onComplete: () => void;
}

const ProfileCompletedSlideshow: React.FC<ProfileCompletedSlideshowProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSlide === 0) {
        setCurrentSlide(1);
      } else {
        onComplete();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentSlide, onComplete]);

  return (
    <View style={styles.container}>
      {currentSlide === 0 ? (
        <Text style={styles.text}>Memes...</Text>
      ) : (
        <Text style={styles.text}>How it should be</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    color: 'white',
  },
});

export default ProfileCompletedSlideshow;