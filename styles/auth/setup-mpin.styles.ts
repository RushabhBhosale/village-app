import { StyleSheet } from 'react-native';
import { AuthColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: AuthColors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: AuthColors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: AuthColors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  lockEmoji: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: AuthColors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: AuthColors.textSecondary,
    marginBottom: 28,
    textAlign: 'center',
  },
  mpinSection: {
    marginBottom: 24,
  },
  mpinLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: AuthColors.text,
    textAlign: 'center',
    marginBottom: 14,
  },
  mpinError: {
    fontSize: 12,
    color: AuthColors.error,
    textAlign: 'center',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: AuthColors.border,
    marginVertical: 20,
  },
  button: {
    height: 54,
    backgroundColor: AuthColors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: AuthColors.white,
    letterSpacing: 0.3,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AuthColors.textSecondary,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 13,
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: '500',
  },
});
