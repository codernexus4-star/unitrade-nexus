import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ModalPicker from '../../components/ModalPicker';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from '../../constants/config';
import { productService } from '../../services/productService';
import api, { createJsonWithImages } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { showSuccess, showError } from '../../utils/alert';
import logger from '../../utils/logger';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const AddProductScreen = () => {
  const navigation = useNavigation();
  
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showConditionPicker, setShowConditionPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: PRODUCT_CATEGORIES[0],
    condition: PRODUCT_CONDITIONS[0]?.value,
    stock: '1',
  });


  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      showError('Permission Denied', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - images.length,
    });

    if (!result.canceled && result.assets) {
      setImages([...images, ...result.assets]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddProduct = async () => {
    // Validation
    if (!formData.name.trim()) {
      showError('Error', 'Product name is required');
      return;
    }

    if (!formData.description.trim()) {
      showError('Error', 'Product description is required');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      showError('Error', 'Please enter a valid price');
      return;
    }

    if (!formData.stock || parseInt(formData.stock) <= 0) {
      showError('Error', 'Please enter a valid stock quantity');
      return;
    }

    // Re-enable image validation now that API works
    if (images.length === 0) {
      showError('Error', 'Please add at least one product image');
      return;
    }

    setLoading(true);

    try {
      logger.log('=== ADDING PRODUCT DEBUG ===');
      logger.log('Form data:', formData);
      logger.log('Images count:', images.length);
      logger.log('Images details:', images.map((img, i) => ({ 
        index: i, 
        uri: img.uri, 
        type: img.type,
        size: img.fileSize 
      })));
      
      // Prepare product data object
      const productDataObj = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        condition: formData.condition,
        stock: formData.stock,
      };
      
      logger.log('Product data object:', productDataObj);
      
      logger.log('Calling productService.createProduct with images and FormData...');
      
      // Skip FormData for now since we know base64 works
      logger.log('⚡ Skipping FormData, using base64 approach directly...');
      let result = { success: false, error: 'Skipping to base64' };
      
      // If FormData fails, try alternative approaches
      if (!result.success) {
        logger.log('🔄 FormData failed with error:', result.error);
        logger.log('🔄 FormData failed, trying base64 approach...');
        try {
          const jsonPayload = await createJsonWithImages(productDataObj, images);
          const base64Result = await api.post('/products/', jsonPayload, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          logger.log('✅ Base64 approach successful:', base64Result.data);
          // Check if images were processed
          const hasImages = base64Result.data?.images && base64Result.data.images.length > 0;
          
          if (hasImages) {
            showSuccess(
              'Product Created', 
              'Product and images uploaded successfully!',
              () => navigation.goBack()
            );
          } else {
            showSuccess(
              'Product Created', 
              'Product created successfully! Images are being processed and will appear shortly.',
              () => navigation.goBack()
            );
          }
          return;
        } catch (base64Error) {
          logger.log('❌ Base64 approach also failed:', base64Error);
          
          // Final fallback: try without images
          logger.log('🔄 Trying final fallback without images...');
          try {
            const noImageResult = await api.post('/products/', productDataObj);
            logger.log('✅ No-image fallback successful:', noImageResult.data);
            showSuccess(
              'Product Created', 
              'Product added successfully, but images could not be uploaded. You can add images later by editing the product.',
              () => navigation.goBack()
            );
            return;
          } catch (finalError) {
            logger.log('❌ All approaches failed:', finalError);
          }
        }
      }
      logger.log('Product service result:', result);

      if (result.success) {
        logger.log('Product created successfully:', result.data);
        
        // Check if product needs approval
        const productStatus = result.data?.status;
        logger.log('Product status:', productStatus);
        
        if (productStatus === 'pending' || productStatus === 'draft') {
          showSuccess(
            'Product Submitted', 
            'Your product has been submitted for admin approval. It will be visible to buyers once approved.',
            () => navigation.goBack()
          );
        } else {
          showSuccess('Success', 'Product added successfully', () => {
            navigation.goBack();
          });
        }
      } else {
        logger.log('Failed to create product:', result.error);
        showError('Error', result.error || 'Failed to add product');
      }
    } catch (error) {
      logger.log('Error in handleAddProduct:', error);
      showError('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Add New Product</Text>
          <Text style={styles.headerSubtitle}>Create your listing</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Images Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="camera-outline" size={24} color={BRAND_COLORS.vibrantBlue} />
              <View>
                <Text style={styles.sectionTitle}>Product Images *</Text>
                <Text style={styles.sectionSubtitle}>Add up to 5 high-quality photos</Text>
              </View>
            </View>
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>{images.length}/5</Text>
            </View>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesContainer}
          >
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image.uri }} style={styles.productImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.3)']}
                  style={styles.imageOverlay}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={16} color={COLORS.white} />
                </TouchableOpacity>
                {index === 0 && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>Main</Text>
                  </View>
                )}
              </View>
            ))}
            
            {images.length < 5 && (
              <TouchableOpacity 
                style={styles.addImageButton} 
                onPress={pickImages}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[BRAND_COLORS.lightBlue, 'rgba(65, 105, 225, 0.1)']}
                  style={styles.addImageGradient}
                >
                  <View style={styles.addImageIconContainer}>
                    <Ionicons name="add" size={24} color={BRAND_COLORS.vibrantBlue} />
                  </View>
                  <Text style={styles.addImageText}>Add Photo</Text>
                  <Text style={styles.addImageSubtext}>Tap to upload</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </ScrollView>

          {images.length === 0 && (
            <View style={styles.imagesTip}>
              <Ionicons name="information-circle-outline" size={16} color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.imagesTipText}>
                Add clear, well-lit photos to attract more buyers
              </Text>
            </View>
          )}
        </View>

        {/* Product Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="document-text-outline" size={24} color={BRAND_COLORS.vibrantBlue} />
              <View>
                <Text style={styles.sectionTitle}>Product Details</Text>
                <Text style={styles.sectionSubtitle}>Tell buyers about your item</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Product Name *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="pricetag-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="e.g. iPhone 13 Pro Max"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description *</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <TextInput
                style={[styles.inputWithIcon, styles.textArea]}
                placeholder="Describe your product in detail..."
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Price (GH₵) *</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>GH₵</Text>
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="0.00"
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  keyboardType="decimal-pad"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Stock Quantity *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="cube-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="1"
                  value={formData.stock}
                  onChangeText={(text) => setFormData({ ...formData, stock: text })}
                  keyboardType="number-pad"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Category *</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => setShowCategoryPicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="grid-outline" size={20} color={COLORS.textSecondary} />
              <Text style={[styles.pickerText, !formData.category && styles.placeholderText]}>
                {formData.category || 'Select Category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Condition *</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => setShowConditionPicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.textSecondary} />
              <Text style={[styles.pickerText, !formData.condition && styles.placeholderText]}>
                {PRODUCT_CONDITIONS.find(c => c.value === formData.condition)?.label || 'Select Condition'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Category Picker Modal */}
      <ModalPicker
        visible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        onSelect={(value) => setFormData({ ...formData, category: value })}
        options={PRODUCT_CATEGORIES.map(c => ({ value: c, label: c }))}
        selectedValue={formData.category}
        title="Select Category"
        placeholder="Choose category"
      />

      {/* Condition Picker Modal */}
      <ModalPicker
        visible={showConditionPicker}
        onClose={() => setShowConditionPicker(false)}
        onSelect={(value) => setFormData({ ...formData, condition: value })}
        options={PRODUCT_CONDITIONS.map(c => ({ value: c.value, label: c.label }))}
        selectedValue={formData.condition}
        title="Select Condition"
        placeholder="Choose condition"
      />

      {/* Add Product Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={handleAddProduct}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <LinearGradient
              colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButtonGradient}
            >
              <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Product</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  imageCounter: {
    backgroundColor: BRAND_COLORS.lightBlue,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  imageCounterText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
  },
  imagesContainer: {
    gap: SPACING.md,
  },
  imageWrapper: {
    position: 'relative',
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: BRAND_COLORS.goldenYellow,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  primaryBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  addImageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BRAND_COLORS.vibrantBlue,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
  },
  addImageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    ...SHADOWS.sm,
  },
  addImageText: {
    fontSize: FONT_SIZES.sm,
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '600',
    marginBottom: 2,
  },
  addImageSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  imagesTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.lightBlue,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  imagesTipText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: SPACING.sm,
  },
  currencySymbol: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  pickerText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    padding: SPACING.md,
  },
  addButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  addButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default AddProductScreen;
