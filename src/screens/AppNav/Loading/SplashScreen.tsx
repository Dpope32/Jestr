// SplashScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

interface SplashScreenProps {
  username?: string; 
}

const SplashScreen: React.FC<SplashScreenProps> = ({ username }) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMessage(getGreetingMessage(username));
  }, [username]);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../../assets/animations/splash.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
      <View style={styles.textContainer}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

function getGreetingMessage(username?: string): string {
  const currentHour = new Date().getHours();
  if (currentHour < 6) {
    return username
      ? `Good early morning, ${username}! Ready to laugh at some memes??`
      : `Gooooooood early morning! Ready to start your day?`;
  } else if (currentHour < 12) {
    return username
      ? `Gm @ ${username}! Let's get some memes in front of you, shall we?`
      : `Good morning! Let's get some memes in front of you, shall we?`;
  } else if (currentHour < 15) {
    return username
      ? `Lunch time huh, ${username}? Time for some fun memes.`
      : `Hope you're having a good day! Time for some fun memes.`;
  } else if (currentHour < 18) {
    return username
      ? `Good afternoon, ${username}! Ready for some memes?`
      : `Good afternoon! Ready for some memes?`;
  } else if (currentHour < 21) {
    return username
      ? `Good evening, ${username}! Time to unwind with some memes.`
      : `Good evening! Time to unwind with some memes.`;
  } else {
    return username
      ? `Good night, ${username}! Relax and enjoy some memes.`
      : `Good night! Relax and enjoy some memes.`;
  }
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lottie: {
    width: width * 0.5,
    height: width * 0.5,
  },
  textContainer: {
    marginTop: 30,
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  message: {
    color: '#fff',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default SplashScreen;
