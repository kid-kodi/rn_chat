import KYText from './KYText';
import { useTheme } from '../contexts/ThemeProvider';
import useIsRTL from '../hooks/useIsRTL';
import { Colors } from '../styles/colors';
import fontFamily from '../styles/fontFamily';
import { moderateScale } from '../styles/scaling';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { secureStorage } from '../helpers/secureStorage';
import KYModal from './KYModal';
import KYButton from './KYButton';
import Icon from 'react-native-vector-icons/Feather';

const KYHeader = ({
    title,
    showBack = true,
    customStyle,
}) => {
    const navigation = useNavigation();
    const { theme, toggleTheme } = useTheme();
    const isRTL = useIsRTL();
    const styles = useRTLStyles(isRTL, theme);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const colors = Colors[theme];

    const { defaultTheme } = "light";
    const { isFirstTime } = "";

    const handleBackPress = () => {
        navigation.goBack();
    };

    const changedTheme = async () => {
        const newTheme = defaultTheme.myTheme === 'light' ? 'dark' : 'light';
        await secureStorage.setItem('THEME', newTheme);
        toggleTheme();
        closeModal();
    }

    const changedLanguage = (language) => {

        closeModal();
    }

    const closeModal = () => {
        setIsModalVisible(false);
    }

    const onLogout = () => {
        closeModal();
        setTimeout(() => {
            clearDataAction();
        }, 400);
    }

    return (
        <View style={[styles.container, customStyle]}>
            {showBack ?
                <TouchableOpacity
                    onPress={handleBackPress}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Icon name='arrow-left' size={30} />
                </TouchableOpacity>
                : <View />}

            {title && (
                <KYText
                    text={title}
                    style={styles.titleText}
                />
            )}

            <Pressable onPress={() => setIsModalVisible(true)}>
                <Icon name='settings' size={30} />
            </Pressable>

            <KYModal isVisible={isModalVisible} onClose={closeModal}>
                <View style={styles.modalContainer}>
                    <KYText
                        text="SETTINGS"
                        style={styles.modalTitle}
                    />
                    <View style={styles.section}>
                        <KYText
                            text="LANGUAGE"
                            style={styles.sectionTitle}
                        />
                        <View style={styles.optionRow}>
                            <TouchableOpacity
                                style={[styles.optionButton, isRTL && styles.optionButtonActive]}
                                onPress={() => changedLanguage({ name: 'Arabic', sortName: 'ar' })}
                            >
                                <KYText text="Arabic" isDynamic style={[
                                    styles.optionText,
                                    isRTL && styles.optionTextActive
                                ]} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.optionButton, !isRTL && styles.optionButtonActive]}
                                onPress={() => changedLanguage({ name: 'English', sortName: 'en' })}
                            >
                                <KYText text="English" isDynamic style={[
                                    styles.optionText,
                                    !isRTL && styles.optionTextActive
                                ]} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <KYText
                            text="THEME"
                            style={styles.sectionTitle}
                            isDynamic={false}
                        />
                        <View style={styles.optionRow}>
                            <TouchableOpacity
                                style={[styles.optionButton, theme === 'light' && styles.optionButtonActive]}
                                onPress={changedTheme}
                            >
                                <KYText text="LIGHT" style={[
                                    styles.optionText,
                                    theme === 'light' && styles.optionTextActive
                                ]} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.optionButton, theme === 'dark' && styles.optionButtonActive]}
                                onPress={changedTheme}
                            >
                                <KYText text="DARK" style={[
                                    styles.optionText,
                                    theme === 'dark' && styles.optionTextActive
                                ]} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {isFirstTime ? <KYButton title="LOGOUT" onPress={onLogout} /> : null}

                </View>
            </KYModal>
        </View>
    );
};


const useRTLStyles = (isRTL, theme) => {
    const colors = Colors[theme];
    return StyleSheet.create({
        container: {
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingHorizontal: moderateScale(16),
        },

        titleText: {
            fontSize: moderateScale(18),
            fontFamily: fontFamily.medium,
        },

        modalContainer: {
            backgroundColor: colors.background,
            minHeight: moderateScale(100),
        },

        modalTitle: {
            fontSize: moderateScale(24),
            fontFamily: fontFamily.bold,
            marginBottom: moderateScale(24),
            textAlign: 'center',
        },

        section: {
            marginBottom: moderateScale(24),
        },

        sectionTitle: {
            fontSize: moderateScale(16),
            fontFamily: fontFamily.medium,
            marginBottom: moderateScale(12),
            opacity: 0.8,
        },

        optionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: moderateScale(12),
        },

        optionButton: {
            flex: 1,
            padding: moderateScale(12),
            borderRadius: moderateScale(12),
            backgroundColor: colors.surface,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.inputBorder,
        },

        optionButtonActive: {
            backgroundColor: colors.text,
            borderColor: colors.text,
        },

        optionText: {
            fontSize: moderateScale(16),
            fontFamily: fontFamily.medium,
            color: colors.text,
        },

        optionTextActive: {
            color: colors.background,
        },

        logoutText: {
            fontSize: moderateScale(16),
            fontFamily: fontFamily.medium,
            color: colors.text,
        },
    });
};

export default KYHeader;