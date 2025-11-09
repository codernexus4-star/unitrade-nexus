import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from '../../constants/config';
import { productService } from '../../services/productService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showSuccess, showError } from '../../utils/alert';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const EditProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: PRODUCT_CATEGORIES[0],
    condition: PRODUCT_CONDITIONS[0],
    stock: '1',
    status: 'active',
  });

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    const result = await productService.getProduct(productId);
    if (result.success) {
      const prod = result.data;
      setProduct(prod);
      setFormData({
        name: prod.name,
        description: prod.description,
        price: prod.price.toString(),
        category: prod.category,
        condition: prod.condition,
        stock: prod.stock.toString(),
        status: prod.status || 'active',
      });
      setExistingImages(prod.images || []);
    } else {
      showError('Error', 'Failed to load product', () => navigation.goBack());
    }
    setLoading(false);
  };

  const pickImages = async () => {
    const totalImages = existingImages.length + newImages.length;
    if (totalImages >= 5) {
      showError('Limit Reached', 'Maximum 5 images allowed');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      showError('Permission Denied', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - totalImages,
    });

    if (!result.canceled && result.assets) {
      setNewImages([...newImages, ...result.assets]);
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleUpdateProduct = async () => {
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

    if (!formData.stock || parseInt(formData.stock) < 0) {
      showError('Error', 'Please enter a valid stock quantity');
      return;
    }

    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) {
      showError('Error', 'Please add at least one product image');
      return;
    }

    setSaving(true);

    try {
      // Create FormData for multipart/form-data
      const productData = new FormData();
      productData.append('name', formData.name);
      productData.append('description', formData.description);
      productData.append('price', formData.price);
      productData.append('category', formData.category);
      productData.append('condition', formData.condition);
      productData.append('stock', formData.stock);
      productData.append('status', formData.status);

      // Add existing image IDs (to keep them)
      existingImages.forEach((image) => {
        productData.append('existing_images', image.id);
      });

      // Add new images
      newImages.forEach((image, index) => {
        productData.append('images', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `product_${index}.jpg`,
        });
      });

      const result = await productService.updateProduct(productId, productData);

      if (result.success) {
        showSuccess('Success', 'Product updated successfully', () => {
          navigation.goBack();
        });
      } else {
        showError('Error', result.error || 'Failed to update product');
      }
    } catch (error) {
      showError('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Background Pattern */}
      <View style={styles.headerPattern}>
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
      </View>

      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <View style={styles.backButtonContainer}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Edit Product</Text>
          <Text style={styles.headerSubtitle}>Update your listing details</Text>
        </View>
        
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => {/* Preview product */}}
          activeOpacity={0.8}
        >
          <View style={styles.headerActionContainer}>
            <Ionicons name="eye-outline" size={24} color={COLORS.white} />
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
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
              <View style={styles.sectionIcon}>
                <Ionicons name="camera-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Product Images *</Text>
                <Text style={styles.sectionSubtitle}>
                  {existingImages.length + newImages.length}/5 images • First image will be the main photo
                </Text>
              </View>
            </View>
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>{existingImages.length + newImages.length}</Text>
            </View>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesContainer}
          >
            {/* Existing Images */}
            {existingImages.map((image, index) => (
              <View key={`existing-${index}`} style={styles.imageWrapper}>
                <Image source={{ uri: image.image }} style={styles.productImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeExistingImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}

            {/* New Images */}
            {newImages.map((image, index) => (
              <View key={`new-${index}`} style={styles.imageWrapper}>
                <Image source={{ uri: image.uri }} style={styles.productImage} />
                <View style={styles.newImageBadge}>
                  <Text style={styles.newImageText}>NEW</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeNewImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
            
            {existingImages.length + newImages.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImages} activeOpacity={0.8}>
                <LinearGradient
                  colors={[BRAND_COLORS.lightBlue, 'rgba(65, 105, 225, 0.1)']}
                  style={styles.addImageGradient}
                >
                  <View style={styles.addImageIconContainer}>
                    <Ionicons name="camera" size={28} color={BRAND_COLORS.vibrantBlue} />
                  </View>
                  <Text style={styles.addImageText}>Add Photo</Text>
                  <Text style={styles.addImageSubtext}>
                    {5 - (existingImages.length + newImages.length)} remaining
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Product Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionIcon}>
                <Ionicons name="document-text-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Product Details</Text>
                <Text style={styles.sectionSubtitle}>Fill in your product information</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputLabelContainer}>
              <Ionicons name="pricetag-outline" size={16} color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.inputLabel}>Product Name *</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="e.g. iPhone 13 Pro Max"
                placeholderTextColor={COLORS.textLight}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputLabelContainer}>
              <Ionicons name="document-outline" size={16} color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.inputLabel}>Description *</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your product in detail..."
                placeholderTextColor={COLORS.textLight}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <View style={styles.inputLabelContainer}>
                <Ionicons name="cash-outline" size={16} color={BRAND_COLORS.goldenYellow} />
                <Text style={styles.inputLabel}>Price (GH₵) *</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textLight}
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <View style={styles.inputLabelContainer}>
                <Ionicons name="cube-outline" size={16} color={BRAND_COLORS.vibrantBlue} />
                <Text style={styles.inputLabel}>Stock *</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor={COLORS.textLight}
                  value={formData.stock}
                  onChangeText={(text) => setFormData({ ...formData, stock: text })}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputLabelContainer}>
              <Ionicons name="grid-outline" size={16} color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.inputLabel}>Category *</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                style={styles.picker}
              >
                {PRODUCT_CATEGORIES.map((category) => (
                  <Picker.Item key={category} label={category} value={category} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputLabelContainer}>
              <Ionicons name="star-outline" size={16} color={BRAND_COLORS.goldenYellow} />
              <Text style={styles.inputLabel}>Condition *</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
                style={styles.picker}
              >
                {PRODUCT_CONDITIONS.map((condition) => (
                  <Picker.Item key={condition.value} label={condition.label} value={condition.value} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputLabelContainer}>
              <Ionicons name="toggle-outline" size={16} color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.inputLabel}>Status *</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                style={styles.picker}
              >
                <Picker.Item label="Active" value="active" />
                <Picker.Item label="Hidden" value="hidden" />
                <Picker.Item label="Sold" value="sold" />
              </Picker>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Update Button */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <TouchableOpacity
            style={[styles.updateButton, saving && styles.updateButtonDisabled]}
            onPress={handleUpdateProduct}
            disabled={saving}
            activeOpacity={0.9}
          >
            {saving ? (
              <View style={styles.loadingButton}>
                <ActivityIndicator size="small" color={COLORS.white} />
                <Text style={styles.loadingButtonText}>Updating...</Text>
              </View>
            ) : (
              <LinearGradient
                colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.updateButtonGradient}
              >
                <View style={styles.updateButtonIcon}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
                </View>
                <Text style={styles.updateButtonText}>Update Product</Text>
                <View style={styles.updateButtonArrow}>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </View>
              </LinearGradient>
            )}
          </TouchableOpacity>
          
          <Text style={styles.footerHint}>
            Changes will be visible to buyers immediately
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -30,
    right: -30,
  },
  patternCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(253, 185, 19, 0.1)',
    bottom: -20,
    left: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  backButton: {
    padding: SPACING.xs,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  headerAction: {
    padding: SPACING.xs,
  },
  headerActionContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
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
    flex: 1,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
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
    backgroundColor: BRAND_COLORS.vibrantBlue,
    borderRadius: BORDER_RADIUS.full,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCounterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
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
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  newImageBadge: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    backgroundColor: BRAND_COLORS.goldenYellow,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  newImageText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.sm,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  addImageGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BRAND_COLORS.vibrantBlue,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
  },
  addImageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(65, 105, 225, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  addImageText: {
    fontSize: FONT_SIZES.sm,
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '600',
    textAlign: 'center',
  },
  addImageSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  inputWrapper: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  input: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: 'transparent',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  picker: {
    height: 56,
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    ...SHADOWS.lg,
  },
  footerContent: {
    alignItems: 'center',
  },
  updateButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
    width: '100%',
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: BRAND_COLORS.vibrantBlue,
    gap: SPACING.sm,
  },
  loadingButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  updateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  updateButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  updateButtonArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

export default EditProductScreen;
