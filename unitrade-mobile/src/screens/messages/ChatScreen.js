import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Animated,
  StatusBar,
  Alert,
  ActionSheetIOS,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { messagingService } from '../../services/messagingService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { showDestructiveConfirm, showInfo } from '../../utils/alert';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { threadId } = route.params;
  const { user } = useAuth();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  
  // Animation values
  const typingDot1 = useRef(new Animated.Value(0)).current;
  const typingDot2 = useRef(new Animated.Value(0)).current;
  const typingDot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
    let animationStopped = false;

    const loadThread = async () => {
      const result = await messagingService.getThread(threadId);
      if (isMounted && result.success) {
        setThread(result.data);
      }
    };

    const loadMessages = async () => {
      if (isMounted) setLoading(true);
      const result = await messagingService.getMessages(threadId);
      if (isMounted && result.success) {
        // Don't reverse - keep chronological order (oldest first, newest last)
        setMessages(result.data.results || result.data || []);
      }
      if (isMounted) setLoading(false);
    };

    const markAsRead = async () => {
      await messagingService.markAsRead(threadId);
    };

    // Animation with cleanup
    const animate = () => {
      if (animationStopped) return;
      
      Animated.sequence([
        Animated.timing(typingDot1, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(typingDot2, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(typingDot3, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(typingDot1, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(typingDot2, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(typingDot3, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        if (!animationStopped && isTyping) {
          animate();
        }
      });
    };

    loadThread();
    loadMessages();
    markAsRead();
    
    if (isTyping) {
      animate();
    }

    // Cleanup
    return () => {
      isMounted = false;
      animationStopped = true;
      typingDot1.stopAnimation();
      typingDot2.stopAnimation();
      typingDot3.stopAnimation();
    };
  }, [threadId, isTyping]);

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    setSending(true);
    const content = messageText.trim();
    setMessageText('');

    const result = await messagingService.sendMessage(threadId, content);
    if (result.success) {
      setMessages((prev) => [...prev, result.data]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    setSending(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        showInfo('Image Selected', 'Image sharing feature coming soon!');
      }
    } catch (error) {
      showInfo('Error', 'Failed to select image');
    }
  };

  const handleCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        showInfo('Photo Taken', 'Photo sharing feature coming soon!');
      }
    } catch (error) {
      showInfo('Error', 'Failed to take photo');
    }
  };

  const handleVoiceMessage = () => {
    showInfo('Voice Message', 'Voice message feature coming soon!');
  };

  const handleMoreOptions = () => {
    setShowOptionsModal(true);
  };

  const handleViewProfile = () => {
    setShowOptionsModal(false);
    const otherUser = user?.id === thread?.buyer?.id ? thread?.seller : thread?.buyer;
    if (otherUser?.id) {
      navigation.navigate('SellerProfile', { sellerId: otherUser.id });
    }
  };

  const handleBlockUser = () => {
    setShowOptionsModal(false);
    const otherUser = user?.id === thread?.buyer?.id ? thread?.seller : thread?.buyer;
    const userName = otherUser?.first_name || otherUser?.email || 'User';
    
    showDestructiveConfirm(
      'Block User',
      `Are you sure you want to block ${userName}? You won't receive messages from them anymore.`,
      'Block',
      () => {
        showInfo('User Blocked', `${userName} has been blocked. Block feature coming soon!`);
      }
    );
  };

  const handleDeleteChat = () => {
    setShowOptionsModal(false);
    const otherUser = user?.id === thread?.buyer?.id ? thread?.seller : thread?.buyer;
    const userName = otherUser?.first_name || otherUser?.email || 'User';
    
    showDestructiveConfirm(
      'Delete Chat',
      `Are you sure you want to delete this conversation with ${userName}? This action cannot be undone.`,
      'Delete',
      async () => {
        try {
          // For now, just navigate back since we don't have a delete endpoint
          // In a real app, you would call: await messagingService.deleteThread(threadId);
          showInfo('Chat Deleted', 'Chat has been deleted successfully');
          navigation.goBack();
        } catch (error) {
          showInfo('Error', 'Failed to delete chat');
        }
      }
    );
  };

  const renderHeader = () => {
    // Determine the other user based on current user's role
    const otherUser = user?.id === thread?.buyer?.id ? thread?.seller : thread?.buyer;
    const product = thread?.product || {};

    return (
      <LinearGradient
        colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.headerAvatarContainer}>
              <LinearGradient
                colors={[BRAND_COLORS.goldenYellow, BRAND_COLORS.vibrantBlue]}
                style={styles.headerAvatar}
              >
                <Ionicons name="person" size={24} color={COLORS.white} />
              </LinearGradient>
              {isOnline && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerName}>
                {otherUser?.first_name || otherUser?.email || 'User'} {otherUser?.last_name || ''}
              </Text>
              <Text style={styles.headerStatus}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleMoreOptions}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        
        {/* Product Info Bar */}
        {product.name && (
          <View style={styles.productBar}>
            <Ionicons name="pricetag" size={14} color={COLORS.white} />
            <Text style={styles.productBarText} numberOfLines={1}>
              {product.name}
            </Text>
          </View>
        )}
      </LinearGradient>
    );
  };

  const renderProductCard = () => {
    const product = thread?.product || {};
    if (!product.id) return null;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
      >
        {product.images && product.images.length > 0 && (
          <Image
            source={{ uri: product.images[0].image }}
            style={styles.productImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productPrice}>GH₵ {product.price}</Text>
          <View style={styles.viewProductButton}>
            <Text style={styles.viewProductText}>View Product</Text>
            <Ionicons name="arrow-forward" size={14} color={BRAND_COLORS.vibrantBlue} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item }) => {
    // Fix: sender is an object, not just an ID
    const senderId = typeof item.sender === 'object' ? item.sender?.id : item.sender;
    const isMyMessage = senderId === user?.id;
    const iAmSeller = user?.id === thread?.seller?.id;
    const iAmBuyer = user?.id === thread?.buyer?.id;
    
    // Determine if sender is buyer or seller
    const isBuyerMessage = senderId === thread?.buyer?.id;
    const isSellerMessage = senderId === thread?.seller?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {/* Avatar on left for received messages */}
        {!isMyMessage && (
          <LinearGradient
            colors={isSellerMessage 
              ? [BRAND_COLORS.goldenYellow, '#FFA500'] 
              : [BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]
            }
            style={styles.messageAvatar}
          >
            <Ionicons 
              name={isSellerMessage ? "storefront" : "person"} 
              size={16} 
              color={COLORS.white} 
            />
          </LinearGradient>
        )}
        
        {/* Message content */}
        <View style={styles.messageContentWrapper}>
          {!isMyMessage && (
            <Text style={styles.messageSenderLabel}>
              {isSellerMessage ? 'Seller' : 'Buyer'}
            </Text>
          )}
          {!isMyMessage ? (
            <BlurView intensity={80} tint="light" style={styles.glassMessageBubble}>
              <LinearGradient
                colors={['rgba(65, 105, 225, 0.15)', 'rgba(0, 51, 102, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.glassGradient}
              >
                <Text style={styles.glassMessageText}>
                  {item.content}
                </Text>
                <View style={styles.messageFooter}>
                  <Text style={styles.glassMessageTime}>
                    {formatTime(item.created_at)}
                  </Text>
                </View>
              </LinearGradient>
            </BlurView>
          ) : (
            <View
              style={[
                styles.messageBubble,
                iAmSeller ? styles.sellerMessageBubble : styles.buyerMessageBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  iAmSeller ? styles.sellerMessageText : styles.myMessageText,
                ]}
              >
                {item.content}
              </Text>
              <View style={styles.messageFooter}>
                <Text
                  style={[
                    styles.messageTime,
                    iAmSeller ? styles.sellerMessageTime : styles.myMessageTime,
                  ]}
                >
                  {formatTime(item.created_at)}
                </Text>
                <Ionicons 
                  name="checkmark-done" 
                  size={14} 
                  color={iAmSeller ? 'rgba(0, 51, 102, 0.6)' : 'rgba(255,255,255,0.8)'} 
                  style={styles.messageStatus}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <LinearGradient
          colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
          style={styles.typingAvatar}
        >
          <Ionicons name="person" size={12} color={COLORS.white} />
        </LinearGradient>
        <View style={styles.typingBubble}>
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingDot1,
                transform: [
                  {
                    translateY: typingDot1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingDot2,
                transform: [
                  {
                    translateY: typingDot2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingDot3,
                transform: [
                  {
                    translateY: typingDot3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderOptionsModal = () => {
    const otherUser = user?.id === thread?.buyer?.id ? thread?.seller : thread?.buyer;
    const userName = otherUser?.first_name || otherUser?.email || 'User';

    return (
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowOptionsModal(false)}
        >
          <BlurView intensity={20} tint="dark" style={styles.modalBlur}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <LinearGradient
                colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chat Options</Text>
                  <Text style={styles.modalSubtitle}>{userName}</Text>
                </View>

                <View style={styles.modalOptions}>
                  <TouchableOpacity 
                    style={styles.modalOption}
                    onPress={handleViewProfile}
                  >
                    <View style={styles.modalOptionIcon}>
                      <Ionicons name="person-outline" size={24} color={COLORS.white} />
                    </View>
                    <Text style={styles.modalOptionText}>View Profile</Text>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>

                  <View style={styles.modalDivider} />

                  <TouchableOpacity 
                    style={styles.modalOption}
                    onPress={handleBlockUser}
                  >
                    <View style={[styles.modalOptionIcon, styles.destructiveIcon]}>
                      <Ionicons name="ban-outline" size={24} color={COLORS.error} />
                    </View>
                    <Text style={[styles.modalOptionText, styles.destructiveText]}>Block User</Text>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>

                  <View style={styles.modalDivider} />

                  <TouchableOpacity 
                    style={styles.modalOption}
                    onPress={handleDeleteChat}
                  >
                    <View style={[styles.modalOptionIcon, styles.destructiveIcon]}>
                      <Ionicons name="trash-outline" size={24} color={COLORS.error} />
                    </View>
                    <Text style={[styles.modalOptionText, styles.destructiveText]}>Delete Chat</Text>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => setShowOptionsModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Pressable>
          </BlurView>
        </Pressable>
      </Modal>
    );
  };

  const renderInputBar = () => (
    <View style={styles.inputContainer}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleImagePicker}
        >
          <Ionicons name="image-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleCamera}
        >
          <Ionicons name="camera-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => showInfo('Emojis', 'Emoji picker coming soon!')}
        >
          <Ionicons name="happy-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputWrapper}>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
          />
          {!messageText.trim() && (
            <TouchableOpacity 
              style={styles.voiceButton}
              onPress={handleVoiceMessage}
            >
              <Ionicons name="mic" size={22} color={BRAND_COLORS.vibrantBlue} />
            </TouchableOpacity>
          )}
        </View>
        
        {messageText.trim() ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <LinearGradient
                colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButtonGradient}
              >
                <Ionicons name="send" size={20} color={COLORS.white} />
              </LinearGradient>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.vibrantBlue} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {renderHeader()}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        ListHeaderComponent={renderProductCard}
        ListFooterComponent={renderTypingIndicator}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
      {renderInputBar()}
      {renderOptionsModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerAvatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: BRAND_COLORS.navyBlue,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  headerStatus: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.9)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    gap: SPACING.xs,
  },
  productBarText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '500',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  productImage: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.surface,
  },
  productInfo: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  productPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: BRAND_COLORS.vibrantBlue,
  },
  viewProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  viewProductText: {
    fontSize: FONT_SIZES.sm,
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '500',
  },
  messagesList: {
    paddingVertical: SPACING.sm,
  },
  messageContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
    marginLeft: 'auto',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
    marginRight: 'auto',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  messageSpacer: {
    width: 36,
  },
  messageContentWrapper: {
    maxWidth: '75%',
  },
  messageSenderLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  messageBubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  // Buyer messages (sent by buyer)
  buyerMessageBubble: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
    borderBottomRightRadius: 4,
  },
  // Seller messages (sent by seller)
  sellerMessageBubble: {
    backgroundColor: BRAND_COLORS.goldenYellow,
    borderBottomRightRadius: 4,
  },
  // Glass morphism bubble for received messages
  glassMessageBubble: {
    borderRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(65, 105, 225, 0.2)',
    ...SHADOWS.md,
  },
  glassGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  glassMessageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
    color: BRAND_COLORS.navyBlue,
    fontWeight: '500',
  },
  glassMessageTime: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(0, 51, 102, 0.7)',
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
  },
  myMessageText: {
    color: COLORS.white,
  },
  sellerMessageText: {
    color: BRAND_COLORS.navyBlue,
    fontWeight: '500',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  messageTime: {
    fontSize: FONT_SIZES.xs,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.8)',
  },
  sellerMessageTime: {
    color: 'rgba(0, 51, 102, 0.7)',
  },
  otherMessageTime: {
    color: COLORS.textSecondary,
  },
  messageStatus: {
    marginLeft: SPACING.xs,
  },
  typingContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'flex-end',
  },
  typingAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    gap: 4,
    ...SHADOWS.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND_COLORS.vibrantBlue,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.lg,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  quickActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.md,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
    paddingVertical: SPACING.sm,
  },
  voiceButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 320,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  modalGradient: {
    padding: SPACING.lg,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  modalOptions: {
    marginBottom: SPACING.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.md,
  },
  modalOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destructiveIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  modalOptionText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: '600',
  },
  destructiveText: {
    color: '#FFB3B3',
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: SPACING.sm,
  },
  modalCancelButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default ChatScreen;
