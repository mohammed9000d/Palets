import { useEffect } from 'react';
import { useThemeSettings } from '../hooks/useThemeSettings';

const FaviconUpdater = () => {
  const { favicon, siteName } = useThemeSettings();

  useEffect(() => {
    // Update favicon
    if (favicon) {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll("link[rel*='icon']");
      existingLinks.forEach(link => link.remove());

      // Add new favicon
      const link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = favicon;
      document.getElementsByTagName('head')[0].appendChild(link);

      // Also add apple-touch-icon for mobile devices
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = favicon;
      document.getElementsByTagName('head')[0].appendChild(appleLink);
    }
  }, [favicon]);

  useEffect(() => {
    // Update document title - just use site name for now
    // Page-specific titles will be handled by individual components
    if (siteName) {
      document.title = siteName;
    }
  }, [siteName]);

  return null; // This component doesn't render anything
};

export default FaviconUpdater;
