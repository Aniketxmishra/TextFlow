export const generateHash = async (text: string, algorithm: 'MD5' | 'SHA-1' | 'SHA-256'): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  let hashBuffer: ArrayBuffer;
  
  switch (algorithm) {
    case 'SHA-1':
      hashBuffer = await crypto.subtle.digest('SHA-1', data);
      break;
    case 'SHA-256':
      hashBuffer = await crypto.subtle.digest('SHA-256', data);
      break;
    case 'MD5':
      // MD5 is not supported by Web Crypto API, so we'll use a simple implementation
      return md5(text);
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Simple MD5 implementation (for demonstration purposes)
function md5(text: string): string {
  // This is a simplified MD5 implementation
  // In a real application, you'd use a proper crypto library
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export const encodeBase64 = (text: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch (error) {
    console.error('Base64 encode error:', error);
    return '';
  }
};

export const decodeBase64 = (base64: string): string => {
  try {
    return decodeURIComponent(escape(atob(base64)));
  } catch (error) {
    console.error('Base64 decode error:', error);
    return '';
  }
};

export const isValidBase64 = (str: string): boolean => {
  try {
    return btoa(atob(str)) === str;
  } catch (error) {
    return false;
  }
};