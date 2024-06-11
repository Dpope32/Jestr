import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

type TopPanelProps = {
  onProfileClick: () => void;
  profilePicUrl: string;
  username: string;
  enableDropdown: boolean;
  showLogo: boolean; // New prop to control the logo visibility
};

const { width } = Dimensions.get('window');

const TopPanel: React.FC<TopPanelProps> = ({ 
  onProfileClick, 
  profilePicUrl, 
  username, 
  enableDropdown, 
  showLogo 
}) => {
  // This state and selection handler should only be effective if dropdowns are enabled
  const [selectedTab, setSelectedTab] = useState("Flow");
  const handleSelect = (index: string | number, value: string) => {
    setSelectedTab(value);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onProfileClick} style={styles.profileContainer}>
        <Image source={{ uri: profilePicUrl }} style={styles.profilePic} />
        <Text style={styles.username}>{username}</Text>
      </TouchableOpacity>
      {showLogo && <Image source={require('../../assets/images/Jestr.jpg')} style={styles.logo} />}
      {enableDropdown && (
<ModalDropdown
  options={['Flow', 'Following']}
  defaultValue={selectedTab}
  style={styles.dropdown}
  textStyle={styles.dropdownText}
  dropdownStyle={styles.dropdownMenu}
  dropdownTextStyle={styles.dropdownTextStyle}  // Apply the text styling
  onSelect={handleSelect}
  renderRightComponent={() => (
    <FontAwesomeIcon icon={faChevronDown} size={16} color="#1bd40b" />
  )}
/>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    left: 0,
    top: 0,
    zIndex: 10,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  profileContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    color: '#1bd40b',
    fontWeight: 'bold',
  },
  logo: {
    position: 'absolute',
    top: 10,
    left: 152,
    width: 100,
    height: 50,
    resizeMode: 'contain',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent', // Ensuring the container itself has no background
  },
  dropdown: {
    marginTop: -20,
    width: 100, // Slightly wider to accommodate longer text if needed
    height: 40,
    justifyContent: 'center',
    borderColor: '#1bd40b',
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Darker background for better contrast
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1bd40b',
    marginRight: 5,
    fontWeight: 'bold', // Making the text bold for better visibility
  },
  dropdownMenu: {
    marginTop: 8, // Provide some space between the dropdown and the dropdown menu
    width: 100, // Match the width with the dropdown button
    borderColor: '#1bd40b',
    height: 75,
    borderWidth: 2,
    marginRight: -23,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slightly darker to distinguish from the button
    overflow: 'hidden', // Prevent any children from overflowing the boundaries
  },
  dropdownTextStyle: {
    color: 'white',  // Ensures text is visible against the gray background
    fontSize: 12,
    padding: 10,  // Adds padding for each dropdown item for better tap targets
    backgroundColor: 'transparent',  // No background color here, it's set globally for the dropdown
    textAlign: 'center',  // Centers text horizontally
    alignSelf: 'center',
  },
});

export default TopPanel;