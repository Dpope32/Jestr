import {Dimensions} from 'react-native';
import Toast from 'react-native-toast-message';
import {ProfileImage} from '../types/types';

export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;


export const generateUniqueId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  };

  export const showToast = (type: string, text1: string, text2: string) => {
    Toast.show({
      type,
      text1,
      text2,
      visibilityTime: 3000,
      topOffset: 50,
      position: 'top'
    });
  };


  export const getProfilePicUri = (profilePic: string | ProfileImage | null): string => {
    if (typeof profilePic === 'string') {
      return profilePic;
    } else if (profilePic?.url) {
      return profilePic.url;
    } else if (profilePic?.uri) {
      return profilePic.uri;
    }
    return 'https://jestr-bucket.s3.us-east-2.amazonaws.com/ProfilePictures/unnamed.png';
  };
  
