// validatePhone — used in register + login
export function validatePhone(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return 'Phone number is required';
  if (cleaned.length < 10) return 'Enter a valid 10-digit phone number';
  return null;
}

// validateMpin — used in setup-mpin + login
export function validateMpin(mpin: string): string | null {
  if (!mpin) return 'MPIN is required';
  if (mpin.length < 4) return 'PIN must be exactly 4 digits';
  return null;
}
