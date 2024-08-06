import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions, Image, TextInput, } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes, faCopy, faEnvelope, faCommentDots, faCamera, faMobile, IconDefinition, faMessage, faCommentSms, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faXTwitter, faSnapchatGhost, faLinkedinIn, faInstagram} from '@fortawesome/free-brands-svg-icons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

interface Friend {
  username: string;
  profilePic: string;
}

type ShareType = 'copy' | 'message' | 'snapchat' | 'facebook' | 'twitter' | 'email' | 'friend' | 'instagram';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  friends: Friend[];
  onShare: (type: ShareType, username: string, message: string) => Promise<void>;
  currentMedia: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ visible, onClose, friends, onShare, currentMedia }) => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [message, setMessage] = useState('');

  const handleFriendSelect = (friend: Friend) => {
    setSelectedFriend(friend);
  };

  const handleShare = async () => {
    if (selectedFriend) {
      try {
        await onShare('friend', selectedFriend.username, message);
        Toast.show({
          type: 'success',
          text1: 'Meme shared successfully!',
          position: 'top',
          visibilityTime: 3000,
        });
        setSelectedFriend(null);
        setMessage('');
        onClose();
      } catch (error) {
        console.error('Error sharing meme:', error);
        Toast.show({
          type: 'error',
          text1: 'Failed to share meme. Please try again.',
          position: 'bottom',
          visibilityTime: 3000,
        });
      }
    }
  };

  const handleClose = () => {
    setSelectedFriend(null);
    setMessage('');
    onClose();
  };

  const handleIconClick = (type: ShareType) => {
    console.log(`Clicked on ${type} icon`);
    // Placeholder for icon click functionality
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={handleClose}>
      <TouchableOpacity style={styles.modalBackground} onPress={handleClose} activeOpacity={1}>
        <View style={[styles.modalContainer, selectedFriend && styles.expandedModal]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <FontAwesomeIcon icon={faTimes} size={24} color="#1bd40b" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Share Meme</Text>
          {selectedFriend ? (
            <View style={styles.selectedFriendContainer}>
              <Image source={{ uri: selectedFriend.profilePic }} style={styles.friendImage} />
              <Text style={styles.friendName}>{selectedFriend.username}</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendsContainer}>
              {friends.map((friend, index) => (
                <TouchableOpacity key={index} onPress={() => handleFriendSelect(friend)}>
                  <Image source={{ uri: friend.profilePic }} style={styles.friendImage} />
                  <Text style={styles.friendName}>{friend.username}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {selectedFriend && (
            <>
              <Image source={{ uri: currentMedia }} style={styles.previewImage} resizeMode="contain" />
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Add message..."
                  value={message}
                  onChangeText={setMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleShare}>
                  <FontAwesomeIcon icon={faArrowUp} size={24} color="white" />
                </TouchableOpacity>
              </View>
            </>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.iconsContainer}
          >
            {icons.map(icon => (
              <TouchableOpacity key={icon.type} onPress={() => handleIconClick(icon.type)}>
                <FontAwesomeIcon icon={icon.icon} size={42} color={icon.color} style={styles.icon} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContainer: {
    backgroundColor: '#1C1C1C',
    padding: 20,
    height: height / 2.5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  expandedModal: {
    height: height / 1.25,
  },
  selectedFriendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#1bd40b',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'white',
  },
  friendsContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  friendImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginHorizontal: 15,
  },
  friendName: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  iconsContainer: {
    flexGrow: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 20,
  },
  cancelButton: {
    marginTop: 20,
    padding: 10,
    borderWidth: 2,
    borderColor: '#1bd40b',
    borderRadius: 30,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
});

const icons: { type: ShareType; icon: IconDefinition; color: string }[] = [
  { type: 'copy', icon: faCopy, color: '#666666' },
  { type: 'message', icon: faCommentSms, color: '#4CAF50' },
  { type: 'snapchat', icon: faSnapchatGhost, color: '#FFFC00' },
  { type: 'facebook', icon: faFacebookF, color: '#1877F2' },
  { type: 'twitter', icon: faXTwitter, color: '#1DA1F2' },
  { type: 'email', icon: faMessage, color: '#D14836' },
  { type: 'instagram', icon: faInstagram, color: '#C13584' },
];

export default ShareModal;