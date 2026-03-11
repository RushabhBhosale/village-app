import { StyleSheet } from 'react-native';
import { AuthColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: AuthColors.primary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: AuthColors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: AuthColors.textSecondary,
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 40,
  },
  card: {
    flex: 1,
    backgroundColor: AuthColors.white,
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AuthColors.border,
    shadowColor: AuthColors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardSelected: {
    borderColor: AuthColors.primary,
    backgroundColor: '#F0FFF4',
  },
  cardEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AuthColors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: AuthColors.textSecondary,
    textAlign: 'center',
  },
  cardTitleSelected: {
    color: AuthColors.primary,
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: AuthColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  button: {
    width: '100%',
    backgroundColor: AuthColors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
