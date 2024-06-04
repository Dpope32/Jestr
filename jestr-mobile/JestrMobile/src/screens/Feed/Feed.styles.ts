import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#1C1C1C',
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardMedia: {
    width: windowWidth,  // Set width to match the device width
    height: undefined,   // Allow the height to adjust based on the content
    resizeMode: 'contain',
    backgroundColor: 'rgba(0, 0, 0, 0.53)',
    marginBottom: 10,
  },
  darkMode: {
    backgroundColor: '#979797',
    color: '#ffffff',
  },
  commentFeed: {
    marginTop: 10,
  },
  card: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#000000',
    paddingBottom: 95,
  },
  prev: {
    position: 'absolute',
    top: '50%',
    left: 6,
    transform: [{ translateY: -50 }],
    backgroundColor: 'rgba(255, 255, 255, 0.33)',
    color: '#333333',
    borderWidth: 0,
    fontSize: 24,
  },
  next: {
    position: 'absolute',
    top: '50%',
    right: 6,
    transform: [{ translateY: -50 }],
    backgroundColor: 'rgba(255, 255, 255, 0.33)',
    color: '#333333',
    borderWidth: 0,
    fontSize: 24,
  },
  cardVideo: {
    marginBottom: 10,
  },
  bottomIcon: {
    fontSize: 30, // Adjust size as needed
    color: 'black', // Set to black
  },
  bottomIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Adjust positioning as needed
    padding: 10,
  },
  buttons: {
    flexDirection: 'row', // Use flexbox for horizontal alignment
    position: 'absolute', // Position absolutely to place within the card
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -50 }], // Align the center of the buttons with the center of the card
    gap: 20, // Space between each button
  },
  buttonsButton: {
    borderRadius: 50, // Make buttons circular
    borderWidth: 0,
    color: '#008000',
    fontSize: 20,
    width: 40, // Define a fixed width for uniformity
    alignItems: 'center', // Center the icon vertically
    justifyContent: 'center', // Center the icon horizontally
    height: 40,
    margin: 8, // Space between icons
    position: 'relative', // Use relative instead of absolute
    bottom: 60, // Place it above the bottom-panel
  },
  endOfList: {
    width: '100%',
    padding: 16,
    textAlign: 'center',
    fontSize: 18,
    color: '#333333',
    backgroundColor: '#ffffff',
    borderRadius: 16,
  },
  likeCounter: {
    position: 'absolute',
    bottom: 70, // Adjust this value based on your bottom-panel height
    marginLeft: 52,
    width: '100%',
    textAlign: 'left',
    fontStyle: 'italic',
    fontWeight: 'bold',
    fontSize: 16, // Make sure the font size is readable
    color: '#ffffff', // Adjust for readability on all backgrounds
  },
  posterUsername: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 80, // Adjust the top position to bring the user info over the media
    right: 0,
    color: 'white',
    padding: 8,
    fontSize: 16,
    marginTop: -6,
  },
  profilePic: {
    position: 'absolute',
    top: 10, // Adjust based on your layout
    left: 10, // Adjust based on your layout
    width: 60, // Adjust size as needed
    height: 60, // Adjust size as needed
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 3, 242, 0.42)',
  },
  posterProfilePic: {
    width: 40, // Adjust size as needed
    height: 40, // Adjust size as needed
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 28, // Adjust the top position to bring the user info over the media
    right: -4, // Adjust the left position to align with the content padding
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent background
    color: 'white',
    padding: 4,
    borderRadius: 18, // Soften the corners
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.51)',
  },
  followIcon: {
    position: 'absolute',
    marginRight: 10, // Adjust this value to move the icon horizontally
    top: 34,
    left: 310,
    color: '#2fff2f', // This is the hex code for green
  },
  username: {
    fontSize: 18, // Match to your design
    fontWeight: 'bold',
    color: 'white',
  },
  caption: {
    position: 'absolute',
    marginTop: 'auto',
    bottom: 117, // Adjust this value based on your bottom-panel height
    width: '98%',
    textAlign: 'left',
    fontStyle: 'italic',
    fontSize: 16, // Make sure the font size is readable
    fontWeight: 'normal', // Adjust weight as needed
    color: '#ffffff', // Adjust for readability on all backgrounds
  },
});

export default styles;
