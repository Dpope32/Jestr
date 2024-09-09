import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : 50,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
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
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
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
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 14,
  },
  logoutIcon: {
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    paddingTop: 40,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    minHeight: height * 0.7,
    width: '100%',
  },
  modalBackButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: '#1bd40b',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: '#1bd40b',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
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
});