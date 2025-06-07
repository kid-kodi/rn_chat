import { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export const TypingIndicator = ({ isVisible, userName }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const bounce1 = useRef(new Animated.Value(0)).current;
    const bounce2 = useRef(new Animated.Value(0)).current;
    const bounce3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            const bounceAnimation = () => {
                const createBounce = (animValue, delay) => {
                    return Animated.loop(
                        Animated.sequence([
                            Animated.timing(animValue, {
                                toValue: -8,
                                duration: 400,
                                delay,
                                useNativeDriver: true,
                            }),
                            Animated.timing(animValue, {
                                toValue: 0,
                                duration: 400,
                                useNativeDriver: true,
                            }),
                        ])
                    );
                };

                Animated.parallel([
                    createBounce(bounce1, 0),
                    createBounce(bounce2, 150),
                    createBounce(bounce3, 300),
                ]).start();
            };

            bounceAnimation();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <Animated.View style={[styles.typingContainer, { opacity: fadeAnim }]}>
            <View style={styles.typingBubble}>
                <View style={styles.dotsContainer}>
                    <Animated.View
                        style={[
                            styles.dot,
                            { transform: [{ translateY: bounce1 }] }
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            { transform: [{ translateY: bounce2 }] }
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            { transform: [{ translateY: bounce3 }] }
                        ]}
                    />
                </View>
            </View>
        </Animated.View>
    );
};



const styles = StyleSheet.create({
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    typingBubble: {
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingText: {
        fontSize: 14,
        color: '#4a5568',
        marginRight: 8,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#718096',
        marginHorizontal: 1,
    },
    userTypingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    userTypingDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#718096',
        marginRight: 2,
    },
    userTypingText: {
        fontSize: 12,
        color: '#718096',
        marginLeft: 8,
    }
});