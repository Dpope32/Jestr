// MemeUploadScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, Animated, ImageBackground, ProgressBarAndroid } from 'react-native';
import MemeUpload from '../../components/Meme/MemeUpload';
import TopPanel from '../../components/Panels/TopPanel';
import BottomPanel from '../../components/Panels/BottomPanel';


type MemeUploadScreenProps = {
  navigation: any;
  route: any;
};

export type User = {
  email: string;
  username: string;
  profilePic: string;
  displayName: string;
  headerPic: string;
  creationDate: string;
};

const MemeUploadScreen: React.FC<MemeUploadScreenProps> = ({ navigation, route }) => {
  const { user } = route.params;
  const [isProfilePanelVisible, setIsProfilePanelVisible] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState(user ? user.profilePic : '');
  const [localUser, setLocalUser] = useState<User | null>(user || null);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [imageSelected, setImageSelected] = useState(false); // State to track if an image is selected
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (!user || !user.email) {
    Alert.alert('Error', 'User data is missing');
    navigation.goBack();
    return null;
  }

  const handleUploadSuccess = (url: string) => {
    console.log('Meme uploaded successfully:', url);
    setImageUploaded(true);
  };

  const handleImageSelect = (selected: boolean) => {
    setImageSelected(selected);
  };

  const handleHomeClick = () => {
    navigation.navigate('Home');
  };


  const toggleProfilePanel = () => {
    setProfilePanelVisible(!profilePanelVisible);
  };

  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" />
      <TopPanel
            onProfileClick={toggleProfilePanel}
            profilePicUrl={localUser ? localUser.profilePic : ''}
            username={localUser ? localUser.username : 'Default Username'}
            enableDropdown={false} // Disable dropdown in Inbox
            showLogo={false} // Hide logo in Inbox
            />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {!imageSelected && (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Upload Your Meme</Text>
            {!imageUploaded && (
              <Text style={styles.subtitle}>Easily share your memes with friends!</Text>
            )}
          </View>
        )}
        <ProgressBarAndroid style={styles.progress} styleAttr="Horizontal" indeterminate={true} color="#00a100" />
        <View style={styles.card}>
        <MemeUpload
          onUploadSuccess={handleUploadSuccess}
          userEmail={user.email}
          onImageSelect={handleImageSelect}
          username={user.username}
          navigation={navigation}  // Passing navigation prop
          route={route}            // Passing route prop
        />

        </View>
      </Animated.View>
      <BottomPanel
        onHomeClick={handleHomeClick}
        handleLike={() => {}}
        handleDislike={() => {}}
        likedIndices={new Set<number>()}
        dislikedIndices={new Set<number>()}
        likeDislikeCounts={{}}
        currentMediaIndex={0}
        toggleCommentFeed={() => {}}
        user={user}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
  },
  icon: {
    marginRight: 10,
    color: '#FFFFFF',
    fontSize: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  card: {
    width: '100%',
    padding: 20,
    backgroundColor: '#222222',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
    transform: [{ scale: 1.05 }],
    marginBottom: 20, // Added margin bottom
  },
  progress: {
    marginBottom: 20,
    width: '80%',
  },
});

export default MemeUploadScreen;
