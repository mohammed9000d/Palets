import configService from '../services/configService';

// Helper function to get the correct image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Use dynamic storage URL if config is available
  if (configService.isInitialized()) {
    return configService.getStorageFileUrl(imagePath);
  }
  
  // Fallback to relative path
  return `/storage/${imagePath}`;
};

export default getImageUrl;
