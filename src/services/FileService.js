import DocumentPicker from 'react-native-document-picker';
import { Platform } from 'react-native';

/**
 * Generic file picker with include/exclude capabilities
 * @param {Object} options - Configuration options
 * @param {Array} [options.include] - Array of types to include (overrides exclude)
 * @param {Array} [options.exclude] - Array of types to exclude
 * @param {boolean} [options.multiple=false] - Allow multiple file selection
 * @param {Array} [options.extensions] - Specific file extensions to allow
 * @returns {Promise<Array>} Array of selected files
 */
export const filePicker = async ({
  include,
  exclude,
  multiple = false,
  extensions,
} = {}) => {
  try {
    // Define all available categories
    const allTypes = {
      // Documents
      pdf: DocumentPicker.types.pdf,
      doc: DocumentPicker.types.doc,
      docx: DocumentPicker.types.docx,
      xls: DocumentPicker.types.xls,
      xlsx: DocumentPicker.types.xlsx,
      ppt: DocumentPicker.types.ppt,
      pptx: DocumentPicker.types.pptx,
      text: DocumentPicker.types.plainText,
      csv: DocumentPicker.types.csv,
      rtf: DocumentPicker.types.rtf,
      
      // Images
      images: DocumentPicker.types.images,
      jpg: 'image/jpeg',
      png: 'image/png',
      
      // Videos
      videos: DocumentPicker.types.video,
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      
      // Audio
      audio: DocumentPicker.types.audio,
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      
      // Archives
      zip: DocumentPicker.types.zip,
      gzip: 'application/gzip',
    };

    // If extensions are provided, map them to MIME types
    if (extensions) {
      const extensionMap = {
        // Document extensions
        '.pdf': allTypes.pdf,
        '.doc': allTypes.doc,
        '.docx': allTypes.docx,
        '.xls': allTypes.xls,
        '.xlsx': allTypes.xlsx,
        '.txt': allTypes.text,
        '.csv': allTypes.csv,
        
        // Image extensions
        '.jpg': allTypes.jpg,
        '.jpeg': allTypes.jpg,
        '.png': allTypes.png,
        
        // Video extensions
        '.mp4': allTypes.mp4,
        '.mov': allTypes.mov,
        
        // Audio extensions
        '.mp3': allTypes.mp3,
        '.wav': allTypes.wav,
      };

      include = extensions.map(ext => extensionMap[ext.toLowerCase()]).filter(Boolean);
    }

    // Determine which types to use
    let selectedTypes = [];
    
    if (include && include.length > 0) {
      // Use only included types
      selectedTypes = include.map(type => 
        typeof allTypes[type] !== 'undefined' ? allTypes[type] : type
      );
    } else {
      // Start with all types
      selectedTypes = Object.values(allTypes);
      
      // Exclude specified types
      if (exclude && exclude.length > 0) {
        selectedTypes = selectedTypes.filter(type => {
          const typeKey = Object.keys(allTypes).find(key => allTypes[key] === type);
          return !exclude.includes(typeKey) && !exclude.includes(type);
        });
      }
    }

    // Handle platform-specific MIME types
    if (Platform.OS === 'android') {
      // Android needs explicit MIME types
      selectedTypes = selectedTypes.map(type => {
        if (typeof type === 'string') return type;
        return DocumentPicker.types[type];
      });
    }

    // Pick files
    const result = await DocumentPicker.pick({
      type: selectedTypes,
      allowMultiSelection: multiple,
    });

    return Array.isArray(result) ? result : [result];
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      console.log('User cancelled file picker');
      return [];
    }
    console.error('File picker error:', err);
    throw err;
  }
};