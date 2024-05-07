import React, { useState, useRef } from 'react';
import { View, Alert, TouchableOpacity, Text, StyleSheet, Image, TextInput } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { uploadMeme } from './memeService';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUpload, faCrop, faFilter, faUndo, faRotateRight, faArrowLeft, faRotateLeft, faSun, faMoon, faRefresh, faTextWidth, faAdjust } from '@fortawesome/free-solid-svg-icons';
import Slider from '@react-native-community/slider';
import ImageResizer from 'react-native-image-resizer';
import styles  from './MemeUpload.styles'

type MemeUploadProps = {
  onUploadSuccess: (url: string) => void;
  userEmail: string;
};

const MemeUpload: React.FC<MemeUploadProps> = ({ onUploadSuccess, userEmail }) => {
  const [image, setImage] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [textOverlay, setTextOverlay] = useState('');
  const [editIndex, setEditIndex] = useState(0);
  const [showBrightnessSlider, setShowBrightnessSlider] = useState(false);
  const [showContrastSlider, setShowContrastSlider] = useState(false);
  const editHistoryRef = useRef<string[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibrary({ mediaType: 'mixed' });
    if (result.assets && result.assets[0]?.uri) {
      setImage([result.assets[0].uri]);
    }
  };

  const handleUpload = async () => {
    try {
      const result = await uploadMeme(image[0], userEmail);
      onUploadSuccess(result.url);
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Upload failed', 'Unable to upload the meme. Please try again.');
    }
  };

const handleRotateRight = async () => {
  setImage(prevImages => {
    const updatedImages = [...prevImages];
    rotateImage(updatedImages[editIndex], 90).then(rotatedImage => {
      updatedImages[editIndex] = rotatedImage;
      editHistoryRef.current[editIndex] = rotatedImage;
      setImage(updatedImages);
    });
    return prevImages;
  });
};

const handleRotateLeft = async () => {
  setImage(prevImages => {
    const updatedImages = [...prevImages];
    rotateImage(updatedImages[editIndex], -90).then(rotatedImage => {
      updatedImages[editIndex] = rotatedImage;
      editHistoryRef.current[editIndex] = rotatedImage;
      setImage(updatedImages);
    });
    return prevImages;
  });
};


  const handleUndo = () => {
    if (editHistoryRef.current.length > 0) {
      setImage(prevImages => {
        const updatedImages = [...prevImages];
        const prevImage = editHistoryRef.current[editIndex];
        updatedImages[editIndex] = prevImage;
        editHistoryRef.current.pop();
        return updatedImages;
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImage(prevImages => prevImages.filter((_, i) => i !== index));
    if (index === editIndex) {
      setEditIndex(0);
    } else if (index < editIndex) {
      setEditIndex(editIndex - 1);
    }
  };

  const handleReset = () => {
    setImage([]);
    setCaption('');
    setBrightness(1);
    setContrast(1);
    setTextOverlay('');
    editHistoryRef.current = [];
    setEditIndex(0);
  };

  const rotateImage = async (imageUri: string, degrees: number) => {
    try {
      const result = await ImageResizer.createResizedImage(
        imageUri,
        1000,
        1000,
        'JPEG',
        100,
        degrees
      );
      return result.uri;
    } catch (err) {
      console.error(err);
      return imageUri;
    }
  };

  const handleEdit = () => {
    Alert.alert('Edit', 'Image editing functionality coming soon.');
  };
  return (
    <>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          {image.length > 0 ? (
            image.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.image} />
            ))
          ) : (
            // Placeholder text or image
            <TouchableOpacity style={styles.placeholderContainer} onPress={pickImage}>
            <FontAwesomeIcon icon={faUpload} size={38} color="#999" />
            <Text style={styles.placeholderText}>Tap here to upload your meme!</Text>
          </TouchableOpacity>
          )}
        </View>
      </View>
        {image.length > 0 && (
          <>
            <View style={{ marginHorizontal: 0 }}>
              <TextInput
                style={[styles.captionInput, { height: 50 }]}
                placeholder="Add a caption..."
                placeholderTextColor="#999"
                onChangeText={setCaption}
                value={caption}
                multiline
                numberOfLines={3}
              />
            </View>
            
            <TouchableOpacity style={[styles.iconButton, styles.rotateLeftButton]} onPress={handleRotateLeft}>
              <FontAwesomeIcon icon={faRotateLeft} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, styles.rotateRightButton]} onPress={handleRotateRight}>
              <FontAwesomeIcon icon={faRotateRight} style={styles.icon} />
            </TouchableOpacity>
            
            {/* <View style={styles.textOverlayContainer}>
              <FontAwesomeIcon icon={faTextWidth} style={styles.icon} />
              <TextInput
                style={styles.textOverlayInput}
                placeholder="Text Overlay"
                placeholderTextColor="#999"
                onChangeText={setTextOverlay}
                value={textOverlay}
              />
            </View> */}
            
            <View style={styles.editingActionsContainer}>
              <TouchableOpacity style={styles.iconButton} onPress={handleUndo}>
                <FontAwesomeIcon icon={faRefresh} size={26} style={styles.icon} /> 
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleReset}>
                <FontAwesomeIcon icon={faArrowLeft} size={26} style={styles.icon} /> 
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => setShowBrightnessSlider(!showBrightnessSlider)}>
                <FontAwesomeIcon icon={faSun} size={26} style={styles.icon} color={showBrightnessSlider ? 'white' : 'white'} /> 
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => setShowContrastSlider(!showContrastSlider)}>
                <FontAwesomeIcon icon={faAdjust} size={26} style={styles.icon} />  
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
                <FontAwesomeIcon icon={faCrop} size={26} style={styles.icon} /> 
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
                <FontAwesomeIcon icon={faFilter} size={26} style={styles.icon} /> 
              </TouchableOpacity>
            </View>

            
            {showBrightnessSlider && (
              <View style={styles.brightnessContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0.5}
                  maximumValue={2}
                  step={0.1}
                  value={brightness}
                  onValueChange={(value: number) => setBrightness(value)}
                />
              </View>
            )}
            
            {showContrastSlider && (
              <View style={styles.contrastContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0.5}
                  maximumValue={2}
                  step={0.1}
                  value={contrast}
                  onValueChange={(value: number) => setContrast(value)}
                />
              </View>
            )}
            
          </>
        )}
      {image.length > 0 && (
        <TouchableOpacity
          style={[styles.uploadButton, { marginHorizontal: 20 }]}
          onPress={() => {
            if (image.length === 0) {
              Alert.alert('Please select an image or video');
              return;
            }
            handleUpload();
          }}
        >
          <Text style={styles.uploadButtonText}>Finalize Upload</Text>
        </TouchableOpacity>
      )}
    </>
  );
}

export default MemeUpload;