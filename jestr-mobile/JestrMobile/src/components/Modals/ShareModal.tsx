import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions, Image } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes, faCopy, faEnvelope, faCommentDots, faCamera, faMobile, IconDefinition, faMessage, faCommentSms } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faXTwitter, faSnapchatGhost, faLinkedinIn, faInstagram} from '@fortawesome/free-brands-svg-icons';
import { useNavigation } from '@react-navigation/native';

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
    onShare: (type: ShareType, username?: string) => Promise<void>;  
  }

const ShareModal: React.FC<ShareModalProps> = ({ visible, onClose, friends, onShare }) => {
    return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={visible}
          onRequestClose={onClose}
          supportedOrientations={['portrait', 'landscape']}
        >
         <TouchableOpacity style={styles.modalBackground} onPress={onClose} activeOpacity={1}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Share Meme</Text>
            {friends.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.friendsContainer}
              >
                {friends.map((friend, index) => (
                  <TouchableOpacity key={index} onPress={() => onShare('friend', friend.username)}>
                    <Image source={{ uri: friend.profilePic }} style={styles.friendImage} />
                    <Text style={styles.friendName}>{friend.username}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.iconsContainer}
            >
              {icons.map(icon => (
                <TouchableOpacity key={icon.type} onPress={() => onShare(icon.type)}>
                  <FontAwesomeIcon icon={icon.icon} size={42} color={icon.color} style={styles.icon} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
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
      borderColor: '#1bd40b',  // Green border
      borderRadius: 30,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: 'white',
      fontSize: 18,
    },
  });
  
  const icons: { type: ShareType; icon: IconDefinition; color: string }[] = [
    { type: 'copy', icon: faCopy, color: '#666666' },  // "Copy Link" at the beginning
    { type: 'message', icon: faCommentSms, color: '#4CAF50' },
    { type: 'snapchat', icon: faSnapchatGhost, color: '#FFFC00' },
    { type: 'facebook', icon: faFacebookF, color: '#1877F2' },
    { type: 'twitter', icon: faXTwitter, color: '#1DA1F2' },
    { type: 'email', icon: faMessage, color: '#D14836' },  // Updated to use Gmail icon
    { type: 'instagram', icon: faInstagram, color: '#C13584' }  // Instagram added at the end
];

  export default ShareModal;