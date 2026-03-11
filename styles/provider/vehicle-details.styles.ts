import { StyleSheet } from 'react-native';
import { AuthColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AuthColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  backText: {
    fontSize: 18,
    color: AuthColors.text,
    lineHeight: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AuthColors.text,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  emojiHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: AuthColors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: AuthColors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: AuthColors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
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
    backgroundColor: AuthColors.background,
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
  button: {
    height: 52,
    backgroundColor: AuthColors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
});
