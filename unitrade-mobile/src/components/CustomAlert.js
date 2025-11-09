import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const ALERT_TYPES = {
  success: {
    icon: 'checkmark-circle',
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
  },
  error: {
    icon: 'close-circle',
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
  },
  warning: {
    icon: 'warning',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
  },
  info: {
    icon: 'information-circle',
    color: BRAND_COLORS.vibrantBlue,
    gradient: [BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue],
  },
  confirm: {
    icon: 'help-circle',
    color: BRAND_COLORS.vibrantBlue,
    gradient: [BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue],
  },
};

class CustomAlert {
  static alertInstance = null;

  static setAlertInstance(instance) {
    this.alertInstance = instance;
  }

  static show({
    type = 'info',
    title,
    message,
    buttons = [],
    cancelable = true,
  }) {
    if (this.alertInstance) {
      this.alertInstance.show({ type, title, message, buttons, cancelable });
    }
  }

  static alert(title, message, buttons = [], options = {}) {
    this.show({
      type: options.type || 'info',
      title,
      message,
      buttons: buttons.length > 0 ? buttons : [{ text: 'OK' }],
      cancelable: options.cancelable !== false,
    });
  }
}

class CustomAlertComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      type: 'info',
      title: '',
      message: '',
      buttons: [],
      cancelable: true,
    };
    this.scaleValue = new Animated.Value(0);
  }

  componentDidMount() {
    CustomAlert.setAlertInstance(this);
  }

  show = ({ type, title, message, buttons, cancelable }) => {
    this.setState(
      {
        visible: true,
        type,
        title,
        message,
        buttons,
        cancelable,
      },
      () => {
        Animated.spring(this.scaleValue, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }).start();
      }
    );
  };

  hide = () => {
    Animated.timing(this.scaleValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      this.setState({ visible: false });
    });
  };

  handleButtonPress = (button) => {
    this.hide();
    if (button.onPress) {
      setTimeout(() => button.onPress(), 300);
    }
  };

  render() {
    const { visible, type, title, message, buttons, cancelable } = this.state;
    const alertConfig = ALERT_TYPES[type] || ALERT_TYPES.info;

    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => {
          if (cancelable) {
            this.hide();
          }
        }}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={() => {
              if (cancelable) {
                this.hide();
              }
            }}
          />
          <Animated.View
            style={[
              styles.alertContainer,
              {
                transform: [{ scale: this.scaleValue }],
              },
            ]}
          >
            {/* Icon Header */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={alertConfig.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <Ionicons name={alertConfig.icon} size={48} color={COLORS.white} />
              </LinearGradient>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              {title && <Text style={styles.title}>{title}</Text>}
              {message && <Text style={styles.message}>{message}</Text>}
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              {buttons.map((button, index) => {
                const isDestructive = button.style === 'destructive';
                const isCancel = button.style === 'cancel';
                const isPrimary = !isDestructive && !isCancel;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      buttons.length === 1 && styles.buttonSingle,
                      isCancel && styles.buttonCancel,
                    ]}
                    onPress={() => this.handleButtonPress(button)}
                  >
                    {isPrimary ? (
                      <LinearGradient
                        colors={alertConfig.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.buttonTextPrimary}>
                          {button.text || 'OK'}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View
                        style={[
                          styles.buttonSolid,
                          isDestructive && styles.buttonDestructive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            isDestructive && styles.buttonTextDestructive,
                          ]}
                        >
                          {button.text || 'OK'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  iconContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  button: {
    flex: 1,
    overflow: 'hidden',
  },
  buttonSingle: {
    borderRightWidth: 0,
  },
  buttonCancel: {
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
  },
  buttonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSolid: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  buttonDestructive: {
    backgroundColor: COLORS.white,
  },
  buttonTextPrimary: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  buttonTextDestructive: {
    color: COLORS.error,
    fontWeight: '700',
  },
});

export { CustomAlert, CustomAlertComponent };
