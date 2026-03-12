import { StyleSheet } from 'react-native';
import { AuthColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AuthColors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AuthColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AuthColors.border,
  },
  backButton: { padding: 4, marginRight: 8 },
  backText: { fontSize: 28, color: AuthColors.primary, lineHeight: 32 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: AuthColors.text },

  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },

  // Status card
  statusCard: {
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  },
  statusCardActive: { backgroundColor: '#D1FAE5', borderWidth: 2, borderColor: '#059669' },
  statusCardInactive: { backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#D1D5DB' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: {
    width: 14, height: 14, borderRadius: 7,
  },
  statusDotActive: { backgroundColor: '#059669' },
  statusDotInactive: { backgroundColor: '#9CA3AF' },
  statusTextBlock: {},
  statusTitle: { fontSize: 18, fontWeight: '800' },
  statusTitleActive: { color: '#065F46' },
  statusTitleInactive: { color: '#374151' },
  statusSubtitle: { fontSize: 13, marginTop: 2 },
  statusSubtitleActive: { color: '#059669' },
  statusSubtitleInactive: { color: '#6B7280' },
  statusHint: { fontSize: 11, color: '#9CA3AF', marginTop: 10, textAlign: 'center' },

  // Section label
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AuthColors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
  },

  // Card
  card: {
    backgroundColor: AuthColors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  // Photo
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  photoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: { width: 72, height: 72, borderRadius: 36 },
  photoBtn: {
    flex: 1,
    backgroundColor: AuthColors.background,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: AuthColors.border,
    borderStyle: 'dashed',
  },
  photoBtnText: { fontSize: 14, fontWeight: '600', color: AuthColors.primary, marginTop: 4 },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { fontSize: 14, color: AuthColors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: AuthColors.text },

  // Routes / Cities chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  chipText: { fontSize: 13, color: '#1D4ED8' },
  chipRemove: { fontSize: 14, color: '#93C5FD', fontWeight: '700' },
  emptyChipText: { fontSize: 13, color: AuthColors.textSecondary, fontStyle: 'italic', marginBottom: 10 },

  // Add input row
  addRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  addInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: AuthColors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: AuthColors.text,
    backgroundColor: AuthColors.inputBg,
  },
  addBtn: {
    backgroundColor: AuthColors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Chip section header (label + add button)
  chipSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  chipSectionTitle: { fontSize: 14, fontWeight: '700', color: AuthColors.text },
  addChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AuthColors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  addChipBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  chipDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 14 },

  // Village chip variant (green tint)
  chipVillage: { backgroundColor: '#ECFDF5' },
  chipTextVillage: { color: '#065F46' },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#F9FAFB' },
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
  modalTitle: { fontSize: 17, fontWeight: '700', color: AuthColors.text },
  modalBreadcrumb: { fontSize: 12, color: AuthColors.textSecondary, marginTop: 1 },
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
  modalLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  modalItemText: { fontSize: 15, color: AuthColors.text, flex: 1 },
  modalEmpty: { alignItems: 'center', paddingTop: 48 },
  modalEmptyText: { fontSize: 15, color: AuthColors.textSecondary },
});
