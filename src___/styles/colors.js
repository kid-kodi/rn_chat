// Common colors that don't change with theme
export const commonColors = {
    // Brand Colors
    primary: '#00A13A',
    secondary: '#CD0105',

    // Status Colors
    success: '#00A13A',
    error: '#FF0000',
    warning: '#FFA500',
    info: '#0077FF',

    // Grayscale
    black: '#000000',
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#EFF0F6',
    gray200: '#CCCCCC',
    gray300: '#9E9E9E',
    gray400: '#666666',
    gray500: '#454545',
    gray600: '#2C2C2C',
    gray700: '#1A1A1A',

    // Opacity
    blackOpacity60: 'rgba(0, 0, 0, 0.6)',
    whiteOpacity60: 'rgba(255, 255, 255, 0.6)',

    // Transparent
    transparent: 'transparent',
};

const lightColors = {
    // Base
    background: commonColors.white,
    surface: commonColors.white,
    text: commonColors.black,
    textSecondary: commonColors.gray500,

    // Components
    inputBackground: commonColors.white,
    inputBorder: commonColors.gray100,
    inputPlaceholder: commonColors.blackOpacity60,
    inputText: commonColors.black,
    statusBar: 'dark-content',

    // Buttons
    buttonPrimary: commonColors.primary,
    buttonSecondary: commonColors.secondary,
    buttonDisabled: commonColors.gray200,

    // Icons
    iconPrimary: commonColors.gray500,
    iconSecondary: commonColors.gray300,
};

const darkColors = {
    // Base
    background: commonColors.gray700,
    surface: commonColors.gray600,
    text: commonColors.white,
    textSecondary: commonColors.gray300,
    statusBar: 'light-content',

    // Components
    inputBackground: commonColors.gray600,
    inputBorder: commonColors.gray500,
    inputPlaceholder: commonColors.whiteOpacity60,

    // Buttons
    buttonPrimary: commonColors.primary,
    buttonSecondary: commonColors.secondary,
    buttonDisabled: commonColors.gray500,

    // Icons
    iconPrimary: commonColors.gray300,
    iconSecondary: commonColors.gray400,
};

export const Colors = {
    light: lightColors,
    dark: darkColors,
};