import { StyleSheet } from 'react-native';
import { AuthColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    color: AuthColors.textSecondary,
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: AuthColors.text,
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: AuthColors.border,
    backgroundColor: AuthColors.white,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: AuthColors.textSecondary,
  },
  villageBanner: {
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: AuthColors.primary,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 22,
  },
  villageBannerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  villageBannerName: {
    fontSize: 26,
    fontWeight: '800',
    color: AuthColors.white,
    marginTop: 4,
  },
  villageBannerLocation: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  card: {
    backgroundColor: AuthColors.white,
    borderRadius: 18,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AuthColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: AuthColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: AuthColors.white,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: AuthColors.text,
  },
  profilePhone: {
    fontSize: 14,
    color: AuthColors.textSecondary,
  },
  profileEmail: {
    fontSize: 13,
    color: AuthColors.textSecondary,
  },
  bioContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: AuthColors.border,
  },
  bioText: {
    fontSize: 14,
    color: AuthColors.textSecondary,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: AuthColors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: AuthColors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: AuthColors.text,
  },
});
