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
    marginBottom: 32,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
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
    marginBottom: 20,
  },
  userInfo: {
    backgroundColor: AuthColors.background,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  userInfoText: {
    fontSize: 14,
    color: AuthColors.textSecondary,
  },
  userInfoHighlight: {
    fontWeight: '700',
    color: AuthColors.primary,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: AuthColors.text,
    marginBottom: 6,
  },
  input: {
    height: 50,
    backgroundColor: AuthColors.inputBg,
    borderWidth: 1.5,
    borderColor: AuthColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
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
  hint: {
    marginBottom: 16,
  },
  hintText: {
    fontSize: 12,
    color: AuthColors.textSecondary,
  },
  button: {
    height: 52,
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
});
