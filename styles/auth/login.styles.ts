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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: AuthColors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: AuthColors.textSecondary,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: AuthColors.text,
    marginBottom: 6,
  },
  input: {
    height: 52,
    backgroundColor: AuthColors.background,
    borderWidth: 1.5,
    borderColor: AuthColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: AuthColors.text,
  },
  inputError: {
    borderColor: AuthColors.error,
  },
  placeholder: {
    color: AuthColors.placeholder,
  },
  errorText: {
    fontSize: 12,
    color: AuthColors.error,
    marginTop: 4,
  },
  mpinLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: AuthColors.text,
    marginBottom: 14,
    textAlign: 'center',
  },
  mpinError: {
    fontSize: 12,
    color: AuthColors.error,
    marginTop: 10,
    textAlign: 'center',
  },
  button: {
    height: 54,
    backgroundColor: AuthColors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
    color: AuthColors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: AuthColors.primary,
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
