// Badges.styles.tsx

import { StyleSheet, Platform, Dimensions } from 'react-native';
import { COLORS } from '../../../theme/theme';

const CARD_MARGIN = 15;
const NUM_COLUMNS = 2;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - (NUM_COLUMNS + 1) * CARD_MARGIN) / NUM_COLUMNS;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 30 : 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
     padding:20
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
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2, // Increased height for better layout
  },
  badgeCard: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: COLORS.iconBackground, // Optional: Add background color for icons
  },
  badgeImage: {
    width: 40,
    height: 40,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 5,
  },
  progressText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '500',
  },
  lockOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,0,0,0.7)',
    borderRadius: 20,
    padding: 5,
  },
  badgeBackTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  badgeDetails: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  unearnedBadge: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default styles;
