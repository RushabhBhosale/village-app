export const en = {
  // App
  appName: 'Village App',

  // Language Select
  chooseLanguage: 'Choose Your Language',
  selectPreferredLanguage: 'Select your preferred language to continue',
  english: 'English',
  marathi: 'मराठी',
  continueBtn: 'Continue',

  // Login
  loginTagline: 'Connect with your community',
  welcomeBack: 'Welcome back',
  signInToContinue: 'Sign in to continue',
  phoneNumber: 'Phone Number',
  enterPhoneNumber: 'Enter your phone number',
  enterYourPin: 'Enter Your PIN',
  signIn: 'Sign In',
  dontHaveAccount: "Don't have an account? ",
  register: 'Register',
  loginFailed: 'Login failed. Please try again.',
  invalidPhoneOrPin: 'Invalid phone number or PIN.',
  accountNotFound: 'Account not found. Please register again.',

  // Register
  createYourAccount: 'Create your account',
  joinYourVillage: 'Join your village',
  fewSteps: 'Just a few steps to get started',
  fullName: 'Full Name',
  enterFullName: 'Enter your full name',
  yourLocation: 'Your Location',
  autoDetect: '📍  Auto-detect my district',
  loadingDistricts: 'Loading districts…',
  district: 'District',
  selectDistrict: 'Select district',
  taluka: 'Taluka',
  loadingTalukas: 'Loading talukas…',
  selectTaluka: 'Select taluka',
  village: 'Village',
  loadingVillages: 'Loading villages…',
  selectVillage: 'Select village',
  continueBtnLabel: 'Continue',
  alreadyHaveAccount: 'Already have an account? ',
  search: 'Search…',
  done: 'Done',
  noResults: 'No results found',
  fullNameRequired: 'Full name is required',
  selectVillageError: 'Please select your village',

  // Validation
  phoneRequired: 'Phone number is required',
  invalidPhone: 'Enter a valid 10-digit phone number',
  mpinRequired: 'PIN is required',
  mpinLength: 'PIN must be exactly 4 digits',

  // Setup MPIN
  almostDone: 'Almost done!',
  setYourPin: 'Set Your PIN',
  create4DigitPin: 'Create a 4-digit PIN to secure your account',
  enterPin: 'Enter PIN',
  confirmPin: 'Confirm PIN',
  createAccount: 'Create Account',
  goBack: '← Go Back',
  pinsDoNotMatch: 'PINs do not match',
  registrationFailed: 'Registration failed. Please try again.',
  phoneAlreadyRegistered: 'This phone number is already registered. Please sign in.',

  // Home
  welcomeGreeting: 'Welcome back,',
  yourVillage: 'Your Village',
  yourProfile: 'Your Profile',

  // Settings
  settings: 'Settings',
  account: 'Account',
  providerSection: 'Provider',
  transportProvider: 'Transport Provider',
  shopOwner: 'Shop Owner',
  active: 'Active',
  vehicleLabel: 'Vehicle',
  modelLabel: 'Model',
  numberLabel: 'Number',
  shopName: 'Shop Name',
  category: 'Category',
  becomeProvider: 'Become a Provider',
  appSection: 'App',
  version: 'Version',
  languageLabel: 'Language',
  signOut: 'Sign Out',
  signOutConfirm: 'Are you sure you want to sign out?',
  cancel: 'Cancel',

  // Explore
  community: 'Community',
  comingSoon: 'Coming soon',

  // Provider: Choose Type
  becomeProviderTitle: 'Become a Provider',
  whatDoYouOffer: 'What do you offer?',
  chooseServiceType: 'Choose the type of service you want to provide to your village community.',
  transport: 'Transport',
  offerRidesDeliveries: 'Offer rides or\ndeliveries',
  shop: 'Shop',
  sellProducts: 'Sell products or\nservices',

  // Provider: Choose Vehicle
  transportTitle: 'Transport',
  whatVehicle: 'What vehicle do you have?',
  selectVehicleType: 'Select your vehicle type to continue.',
  car: 'Car',
  fourWheeler: '4-wheeler\nvehicle',
  bike: 'Bike',
  twoWheeler: '2-wheeler\nvehicle',

  // Provider: Vehicle Details
  carDetails: 'Car Details',
  bikeDetails: 'Bike Details',
  yourCar: 'Your Car',
  yourBike: 'Your Bike',
  enterVehicleDetails: 'Enter your vehicle details',
  carNumber: 'Car Number',
  bikeNumber: 'Bike Number',
  carModel: 'Car Model',
  bikeModel: 'Bike Model',
  saveAndBecomeProvider: 'Save & Become Provider',
  vehicleNumberRequired: 'Vehicle number is required',
  vehicleModelRequired: 'Vehicle model is required',
  couldNotSave: 'Could not save your details. Please try again.',
  error: 'Error',

  // Provider: Shop Details
  shopDetails: 'Shop Details',
  yourShop: 'Your Shop',
  tellAboutShop: 'Tell us about your shop',
  shopNamePlaceholder: 'e.g. Ramesh General Store',
  categoryPlaceholder: 'e.g. Grocery, Pharmacy, Hardware...',
  shopNameRequired: 'Shop name is required',
  categoryRequired: 'Category is required',

  // Modal
  close: 'Close',
};

export type TranslationKeys = keyof typeof en;
