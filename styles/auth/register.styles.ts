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
    marginBottom: 16,
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
  // Picker row (District / Taluka / Village)
  pickerRow: {
    height: 52,
    backgroundColor: AuthColors.background,
    borderWidth: 1.5,
    borderColor: AuthColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerRowError: {
    borderColor: AuthColors.error,
  },
  pickerRowDisabled: {
    opacity: 0.45,
  },
  pickerRowText: {
    fontSize: 16,
    color: AuthColors.text,
    flex: 1,
  },
  pickerRowPlaceholder: {
    fontSize: 16,
    color: AuthColors.placeholder,
    flex: 1,
  },
  pickerChevron: {
    fontSize: 12,
    color: AuthColors.textSecondary,
  },
  // Modal (drill-down pageSheet)
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AuthColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AuthColors.border,
    gap: 8,
  },
  modalBackButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AuthColors.text,
  },
  modalBreadcrumb: {
    fontSize: 12,
    color: AuthColors.textSecondary,
    marginTop: 1,
  },
  modalSearch: {
    margin: 16,
    backgroundColor: AuthColors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: AuthColors.text,
    borderWidth: 1,
    borderColor: AuthColors.border,
  },
  modalLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: AuthColors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 15,
    color: AuthColors.text,
    flex: 1,
  },
  modalEmpty: {
    alignItems: 'center',
    paddingTop: 48,
  },
  modalEmptyText: {
    fontSize: 15,
    color: AuthColors.textSecondary,
  },
  button: {
    height: 54,
    backgroundColor: AuthColors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
});
