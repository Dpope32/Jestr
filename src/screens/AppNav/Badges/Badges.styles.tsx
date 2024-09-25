import { StyleSheet, Platform, Dimensions } from 'react-native';
import { COLORS } from '../../../theme/theme';

const CARD_MARGIN = 10;
const NUM_COLUMNS = 3;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - (NUM_COLUMNS + 1) * CARD_MARGIN) / NUM_COLUMNS;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  badgeList: {
    paddingHorizontal: CARD_MARGIN / 2,
    paddingTop: 10,
    paddingBottom: 40,
  },
  badgeContainer: {
    margin: CARD_MARGIN / 2,
    alignItems: 'center',
    width: CARD_WIDTH * 1,
    height: CARD_WIDTH * 1.2,
  },
  badgeCard: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  badgeIconContainer: {
    width: CARD_WIDTH * 0.4,
    height: CARD_WIDTH * 0.4,
    borderRadius: (CARD_WIDTH * 0.4) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 5,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 5,
  },
  progressText: {
    marginTop: 5,
    fontSize: 10,
  },
  lockOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,0,0,0.4)',
    borderRadius: 15,
    padding: 5,
  },
  badgeBackTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  badgeDetails: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
  },
  unearnedBadge: {
    opacity: 0.4,
  },
});

export default styles;