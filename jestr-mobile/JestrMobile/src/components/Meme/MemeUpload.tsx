// MemeUpload.tsx
import React, { useState, useRef } from 'react';
import { View, Alert, TouchableOpacity, Text, StyleSheet, Image, TextInput, Modal, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import { faTimes, faShare, faComment, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faSnapchat } from '@fortawesome/free-brands-svg-icons';
import Share from 'react-native-share';
import * as ImagePicker from 'react-native-image-picker';
import { uploadMeme } from './memeService';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUpload, faCrop, faFilter, faUndo, faRotateRight, faArrowLeft, faRotateLeft, faSun, faMoon, faRefresh, faTextWidth, faAdjust } from '@fortawesome/free-solid-svg-icons';
import Slider from '@react-native-community/slider';
import ImageResizer from 'react-native-image-resizer';
import styles from './MemeUpload.styles';


type MemeUploadProps = {
  onUploadSuccess: (url: string) => void;
  userEmail: string;
  onImageSelect: (selected: boolean) => void;
};


const MemeUpload: React.FC<MemeUploadProps> = ({ onUploadSuccess, userEmail, onImageSelect }) => {
  const [image, setImage] = useState<string[]>([]);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [textOverlay, setTextOverlay] = useState('');
  const [editIndex, setEditIndex] = useState(0);
  const [showBrightnessSlider, setShowBrightnessSlider] = useState(false);
  const [showContrastSlider, setShowContrastSlider] = useState(false);
  const editHistoryRef = useRef<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedMemeUrl, setUploadedMemeUrl] = useState('');



  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibrary({ mediaType: 'photo' });
    if (result.assets && result.assets[0]?.uri) {
      setImage([result.assets[0].uri]);
      onImageSelect(true);
    }
  };

  const handleUpload = async () => {
    if (!image || image.length === 0) {
      Alert.alert('Please select an image');
      return;
    }
  
    setUploading(true);
    console.log('Starting upload...'); // Debug log
  
    try {
      const result = await uploadMeme(image[0], userEmail);
      setUploadedMemeUrl(result.url);
      setUploadSuccess(true);
      onUploadSuccess(result.url);
      console.log('Upload success:', result.url); // Debug log
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Upload failed', 'Unable to upload the meme. Please try again.');
    }
  
    setUploading(false);
    console.log('Upload finished'); // Debug log
    
  };
  

  const handleShare = async () => {
    try {
      await Share.open({
        url: uploadedMemeUrl,
        message: 'Check out this meme!',
      });
    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert('Share failed', 'Unable to share the meme. Please try again.');
    }
  };

  const closeSuccessModal = () => {
    if (uploadSuccess) {  // Additional check to ensure it doesn't run if already false
      setUploadSuccess(false);
      setUploadedMemeUrl('');
      setImage([]);
      onImageSelect(false);
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
    onImageSelect(false);
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

  const handleEdit = async () => {
    try {
      const result = await ImageResizer.createResizedImage(
        image[editIndex],
        800,
        600,
        'JPEG',
        100,
        0,
        undefined,
        false,
        { mode: 'contain', onlyScaleDown: true }
      );

      setEditedImage(result.uri);
    } catch (error) {
      console.error('Error editing image:', error);
      Alert.alert('Error', 'Failed to edit the image.');
    }
  };

  const handleFilter = async (filterType: 'contrast' | 'grayscale') => {
    try {
      let filteredImage;

//      if (filterType === 'contrast') {
//        filteredImage = await ContrastFilter.image(image[editIndex], {
//          contrast: 2.0,
//        });
//      } else if (filterType === 'grayscale') {
//        filteredImage = await GrayScaleFilter.image(image[editIndex]);
//      }

      if (filteredImage) {
        setEditedImage(filteredImage);
      }
    } catch (error) {
      console.error('Error applying filter:', error);
      Alert.alert('Error', 'Failed to apply the filter.');
    }
  };


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View>
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
                style={[styles.captionInput, { height: 50, color: '#fff' }]}
                placeholder="Add a caption..."
                placeholderTextColor="#999"
                onChangeText={setCaption}
                value={caption}
                multiline
                numberOfLines={3}
                blurOnSubmit={true}
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
              <TouchableOpacity style={styles.iconButton} onPress={() => handleFilter('contrast')}>
          <FontAwesomeIcon icon={faFilter} size={26} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => handleFilter('grayscale')}>
          <FontAwesomeIcon icon={faMoon} size={26} style={styles.icon} />
        </TouchableOpacity>
        </View>
          {editedImage && (
            <View style={styles.editedImageContainer}>
              <Image source={{ uri: editedImage }} style={styles.editedImage} />
            </View>
          )}
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
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>Finalize Upload</Text>
          )}
        </TouchableOpacity>
      )}
       <Modal visible={uploadSuccess} animationType="slide" transparent>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
    <TouchableOpacity style={styles.closeButton} onPress={closeSuccessModal}>
  <FontAwesomeIcon icon={faTimes} size={24} color="red" />
</TouchableOpacity>

      <Text style={styles.successText}>Meme uploaded successfully!</Text>
      {uploadedMemeUrl ? (
  <Image source={{ uri: uploadedMemeUrl }} style={styles.uploadedImage} resizeMode="contain" />
) : (
  <Text style={styles.placeholderText}>Image preview not available</Text>
)}
      <View style={styles.shareContainer}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <FontAwesomeIcon icon={faFacebook} size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <FontAwesomeIcon icon={faTwitter} size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <FontAwesomeIcon icon={faComment} size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <FontAwesomeIcon icon={faEnvelope} size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <FontAwesomeIcon icon={faSnapchat} size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </TouchableWithoutFeedback>

  );
};

export default MemeUpload;