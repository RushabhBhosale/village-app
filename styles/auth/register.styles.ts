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
  // GPS detect button
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: AuthColors.primary,
    backgroundColor: '#EDF7F0',
    gap: 6,
    marginBottom: 12,
  },
  detectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: AuthColors.primary,
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: AuthColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: AuthColors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AuthColors.text,
  },
  modalClose: {
    fontSize: 14,
    fontWeight: '600',
    color: AuthColors.primary,
  },
  searchBox: {
    height: 44,
    backgroundColor: AuthColors.background,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: AuthColors.text,
    borderWidth: 1,
    borderColor: AuthColors.border,
  },
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: AuthColors.border,
  },
  listItemSelected: {
    backgroundColor: '#EDF7F0',
  },
  listItemText: {
    fontSize: 16,
    color: AuthColors.text,
  },
  listItemTextSelected: {
    color: AuthColors.primary,
    fontWeight: '600',
  },
  listEmpty: {
    padding: 24,
    alignItems: 'center',
  },
  listEmptyText: {
    fontSize: 14,
    color: AuthColors.textSecondary,
  },
  // Loading
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  loadingText: {
    fontSize: 12,
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
