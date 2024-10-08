// InfoFooterAuth.tsx
import React, { useRef } from 'react';
import {
  Platform,
  ScrollView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { FooterNavRouteProp } from '../../../navigation/NavTypes/AuthStackTypes';
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from '../../../constants/uiConstants';

const InfoFooterAuth = () => {
  const navigation = useNavigation();
  const route = useRoute<FooterNavRouteProp>();
  const content = route.params?.content;

  const modalY = useRef(new Animated.Value(0)).current;

  // Initialize PanResponder only for iOS
  const panResponder = useRef(
    Platform.OS === 'ios'
      ? PanResponder.create({
          onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
          onPanResponderMove: (_, gestureState) => {
            if (gestureState.dy > 0) {
              modalY.setValue(gestureState.dy);
            }
          },
          onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dy > 100) {
              navigation.goBack();
            } else {
              Animated.spring(modalY, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
            }
          },
        })
      : null
  ).current;

  // Function to render content based on the route parameter
  const renderContent = () => {
    switch (content) {
      case 'privacyPolicy':
        return PRIVACY_POLICY;
      case 'termsService':
        return TERMS_OF_SERVICE;
      default:
        return null;
    }
  };

  // Function to render header based on the route parameter
  const renderHeader = () => {
    switch (content) {
      case 'privacyPolicy':
        return 'Privacy Policy';
      case 'termsService':
        return 'Terms of Service';
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Blur View for Better UI on Background */}
      <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
        {/* Close Button for Android */}
        {Platform.OS === 'android' && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContentWrapper,
            { transform: [{ translateY: modalY }] },
          ]}
          {...(Platform.OS === 'ios' ? panResponder?.panHandlers : {})}
        >
          {/* Header */}
          <View style={styles.headerContainer}>

      
            {/* Modal Header Title */}
            <Text style={styles.modalHeader}>{renderHeader()}</Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollViewContent}>
            <Text style={styles.modalText}>{renderContent()}</Text>
          </ScrollView>
        </Animated.View>
      </BlurView>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    
  },
  closeButton: {
    position: 'absolute',
    top: 95,
    right: 20,
    zIndex: 10,
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 8,
  },
  modalContentWrapper: {
    flex: 1,
    backgroundColor: '#2C2C2C',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 100,
  },
  headerContainer: {
    marginBottom: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#444444', 
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 5,
  },
  modalHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingBottom: 15,
  },
  scrollViewContent: {
    flex: 1,
  },
  modalText: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
    textAlign: 'justify',
    marginBottom: 20,
  },
});

export default InfoFooterAuth;
