export const convertCase = (text: string, caseType: string): string => {
  switch (caseType) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'title':
      return text.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    case 'sentence':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case 'camel':
      return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      ).replace(/\s+/g, '');
    case 'pascal':
      return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => 
        word.toUpperCase()
      ).replace(/\s+/g, '');
    case 'snake':
      return text.replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('_');
    case 'kebab':
      return text.replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('-');
    default:
      return text;
  }
};

export const countWords = (text: string) => {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const lines = text.split('\n').length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  
  return {
    words: words.length,
    characters,
    charactersNoSpaces,
    lines,
    paragraphs
  };
};

export const findAndReplace = (
  text: string,
  find: string,
  replace: string,
  options: { regex?: boolean; caseSensitive?: boolean; global?: boolean } = {}
): string => {
  if (!find) return text;
  
  try {
    if (options.regex) {
      const flags = (options.global ? 'g' : '') + (options.caseSensitive ? '' : 'i');
      const regex = new RegExp(find, flags);
      return text.replace(regex, replace);
    } else {
      const searchValue = options.caseSensitive ? find : find.toLowerCase();
      const sourceText = options.caseSensitive ? text : text.toLowerCase();
      
      if (options.global) {
        let result = text;
        let index = 0;
        while ((index = sourceText.indexOf(searchValue, index)) !== -1) {
          result = result.substring(0, index) + replace + result.substring(index + find.length);
          index += replace.length;
        }
        return result;
      } else {
        const index = sourceText.indexOf(searchValue);
        if (index === -1) return text;
        return text.substring(0, index) + replace + text.substring(index + find.length);
      }
    }
  } catch (error) {
    console.error('Find and replace error:', error);
    return text;
  }
};

export const generateLoremIpsum = (paragraphs: number = 1, wordsPerParagraph: number = 50): string => {
  const words = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];
  
  const result = [];
  
  for (let p = 0; p < paragraphs; p++) {
    const paragraph = [];
    for (let w = 0; w < wordsPerParagraph; w++) {
      const word = words[Math.floor(Math.random() * words.length)];
      paragraph.push(w === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
    }
    result.push(paragraph.join(' ') + '.');
  }
  
  return result.join('\n\n');
};

export const generatePassword = (options: {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}): string => {
  let charset = '';
  
  if (options.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (options.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.includeNumbers) charset += '0123456789';
  if (options.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (options.excludeSimilar) {
    charset = charset.replace(/[il1Lo0O]/g, '');
  }
  
  if (!charset) return '';
  
  let password = '';
  for (let i = 0; i < options.length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};