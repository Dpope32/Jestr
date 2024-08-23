import React from 'react';
import {TouchableOpacity, Image, StyleSheet, View, Text} from 'react-native';
import {useUserStore} from '../../utils/userStore';
import {ProfileImage} from '../../types/types';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faImage} from '@fortawesome/free-solid-svg-icons';

interface HeaderPicUploadProps {
  onHeaderPicChange: () => void;
}

const HeaderPicUpload: React.FC<HeaderPicUploadProps> = ({
  onHeaderPicChange,
}) => {
  const {headerPic} = useUserStore();

  const getImageSource = () => {
    if (!headerPic) {
      return require('../../assets/images/Jestr5.jpg');
    }
    if (typeof headerPic === 'string') {
      return {uri: headerPic};
    }
    return {uri: (headerPic as ProfileImage).uri};
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onHeaderPicChange}>
      {headerPic ? (
        <Image
          source={{
            uri:
              typeof headerPic === 'string'
                ? headerPic
                : (headerPic as ProfileImage).uri,
          }}
          style={styles.headerImage}
        />
      ) : (
        <View style={styles.placeholder}>
          <FontAwesomeIcon icon={faImage} size={24} color="#666" />
          <Text style={styles.placeholderText}>
            Click here to upload a header pic
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '110%',
    height: 200,
    marginLeft: -20,
    marginVertical: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
});

export default HeaderPicUpload;
