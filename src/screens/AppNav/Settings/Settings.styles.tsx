import { StyleSheet, Dimensions, Platform } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 50,
  },
  formContainer: {
    padding: 20,
    backgroundColor: 'transparent'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Ensure items start from the left
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1, // Allow it to take up remaining space
    paddingTop: Platform.OS === 'ios' ? 60 : 10,
  },
  backButtonTouchable: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 70, // Increased by 50 pixels
    left: 20,
    width: 50,
    height: 50,
    zIndex: 999,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.0)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  languageItemText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  languageItemIcon: {
    color: '#1bd40b',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#1bd40b',
    padding: 10,
    borderRadius: 5,
    marginBottom: 80,
    alignSelf: 'flex-start',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subOptionsContainer: {
    marginTop: 20,
  },
  subOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    marginBottom: 10,
  },
  subOptionIcon: {
    marginRight: 15,
    color: '#1bd40b',
  },
  subOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalScrollView: {
    maxHeight: height * 0.6,
    width: '100%',
  },
  buttonContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  button1: {
    flexDirection: 'row',
    borderColor: '#1bd40b',
    borderWidth: 2,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  button: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  icon: {
    marginRight: 16,
    color: '#1bd40b',
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 14,
    color: '#BBBBBB',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  arrowIcon: {
    color: '#1bd40b',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    borderColor: '#FF0000',  // Changed to pure red
    borderWidth: 2,  // Added border width
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    position: 'absolute',
    bottom: 30,
    left: 20,
    width: 100,
  },
  logoutText: {
    color: '#FF0000',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 14,
  },
  logoutIcon: {
    color: '#FF0000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingTop: 200
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 14,
    alignItems: 'flex-start',  // Changed from 'flex-start' to 'stretch' to allow proper alignment
    justifyContent: 'flex-start',  // Ensure items start from the top
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    minHeight: height * .9,
    width: '100%',
    paddingTop: 60,
    paddingLeft: 40,
  },
  modalBackButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.0)',
    padding: 10,
    borderRadius: 20,
  },
  warningText: {
    color: '#FF3B30',
    marginBottom: 15,
    fontSize: 16,
  },
  legalText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  messageInput: {
    height: 80, // Reduced height
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  submitButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '30%',
    borderColor: '#1bd40b',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  submitButton1: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '30%',
    borderColor: '#1bd40b',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
container1: {
  flex: 1,
  padding: 12,
  justifyContent: 'space-between', // This will spread out the content vertically
},
  feedbackIndex: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 10,
    width: 25,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  messageContainer: {
    position: 'relative', 
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  modalHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 20,
    alignSelf: 'flex-start',
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  modalDescription: {
    fontSize: 16,
    color: '#BBBBBB',
    marginBottom: 25,
    lineHeight: 22,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  settingValue: {
    fontSize: 16,
    color: '#BBBBBB',
    marginBottom: 20,
  },
  changeButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
    width: '30%',
    borderColor: '#1bd40b',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  notificationSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
   settingSection: {
    marginBottom: 30,
  },
  settingSection1: {
    marginBottom: 10,
    borderColor: '#1bd40b',
    borderWidth: 2,
    padding: 20,
    borderRadius: 12
  },
  sectionTitle1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1bd40b',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1bd40b',
    marginBottom: 15,
  },
  settingItem1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingLabel1: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
  },
  tab: {
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#1bd40b',
  },
  tabIcon: {
    color: '#FFFFFF',
    marginBottom: 5,
  },
  tabText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  noBlockedAccounts: {
    color: '#BBBBBB',
    fontSize: 16,
    fontStyle: 'italic',
  },
  unblockButton: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderColor: '#1bd40b',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  feedbackListContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
  },
  feedbackListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackPreview: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
  },
  feedbackTimestamp: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  feedbackStatus: {
    fontWeight: 'bold',
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    color: '#FFFFFF',
    overflow: 'hidden',
  },
  loadingIndicator: {
    marginVertical: 20, 
    alignSelf: 'center', 
  },
  
  charCount: {
    position: 'absolute',
    bottom: 10, 
    right: 10, 
    fontSize: 12,
    color: '#999',
  },
  addBlockedAccountContainer: {
    marginTop: 10,
  },
  addBlockedAccountInput: {
    height: 40,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#fff',
    marginBottom: 10,
  },
  addBlockedAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#1bd40b',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  addBlockedAccountButtonText: {
    color: '#1bd40b',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  addBlockedAccountIcon: {
    color: '#1bd40b',
  },
  blockButton: {
    backgroundColor: '#1bd40b',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  blockButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  policyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  policyIcon: {
    color: '#1bd40b',
    marginRight: 10,
  },
  policyButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  policyContainer: {
    flex: 1,
    position: 'relative', // Add this to allow absolute positioning of the back button
  },
  policyBackButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  policyBackIcon: {
    color: '#1bd40b',
    fontSize: 20,
  },
  policyContent: {
    flex: 1,
    paddingTop: 50, // Add some top padding to ensure content is not hidden behind the back button
  },
  policyText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleContainer1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    marginRight: 10,
    color: '#1bd40b',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  fontSizeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  fontSizeLabel: {
    fontSize: 12,
    color: '#BBBBBB',
  },
  activeFontSizeLabel: {
    color: '#1bd40b',
    fontWeight: 'bold',
  },
  languageSection: {
    marginTop: 'auto',
  },
  languageButton: {
    borderColor: '#1bd40b',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  languageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});