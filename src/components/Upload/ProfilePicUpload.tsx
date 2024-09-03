import React from 'react';
import {TouchableOpacity, StyleSheet, View, Image} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';

import {useUserStore} from '../../store/userStore';
// import { ProfileImage } from '../../types/types';

interface ProfilePicUploadProps {
  onProfilePicChange: () => void;
}

const ProfilePicUpload: React.FC<ProfilePicUploadProps> = ({
  onProfilePicChange,
}) => {
  const {profilePic} = useUserStore();

  return (
    <TouchableOpacity style={styles.container} onPress={onProfilePicChange}>
      {profilePic ? (
        <Image
          source={{
            uri: typeof profilePic === 'string' ? profilePic : profilePic.uri,
          }}
          style={styles.profileImage}
        />
      ) : (
        <View style={styles.placeholder}>
          <FontAwesomeIcon icon={faPlus} size={30} color="#666" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 135,
    height: 135,
    borderRadius: 70,
    overflow: 'hidden',
    marginTop: -70,
    marginLeft: 10,
    backgroundColor: '#e0e0e0',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default ProfilePicUpload;
