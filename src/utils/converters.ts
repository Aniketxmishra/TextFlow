export const convertUnits = (value: number, fromUnit: string, toUnit: string, category: string): number => {
  const conversions: Record<string, Record<string, number>> = {
    length: {
      mm: 1,
      cm: 10,
      m: 1000,
      km: 1000000,
      in: 25.4,
      ft: 304.8,
      yd: 914.4,
      mi: 1609344
    },
    weight: {
      mg: 1,
      g: 1000,
      kg: 1000000,
      oz: 28349.5,
      lb: 453592
    },
    temperature: {
      // Special handling needed for temperature
    },
    area: {
      'mm²': 1,
      'cm²': 100,
      'm²': 1000000,
      'km²': 1000000000000,
      'in²': 645.16,
      'ft²': 92903.04,
      'yd²': 836127.36,
      'mi²': 2589988110336
    },
    volume: {
      ml: 1,
      l: 1000,
      'gal(US)': 3785.41,
      'gal(UK)': 4546.09,
      qt: 946.353,
      pt: 473.176,
      cup: 236.588,
      'fl oz': 29.5735
    }
  };

  if (category === 'temperature') {
    return convertTemperature(value, fromUnit, toUnit);
  }

  const categoryConversions = conversions[category];
  if (!categoryConversions) return value;

  const fromFactor = categoryConversions[fromUnit];
  const toFactor = categoryConversions[toUnit];
  
  if (!fromFactor || !toFactor) return value;

  // Convert to base unit, then to target unit
  const baseValue = value * fromFactor;
  return baseValue / toFactor;
};

const convertTemperature = (value: number, from: string, to: string): number => {
  if (from === to) return value;
  
  // Convert to Celsius first
  let celsius = value;
  if (from === 'fahrenheit') {
    celsius = (value - 32) * 5/9;
  } else if (from === 'kelvin') {
    celsius = value - 273.15;
  }
  
  // Convert from Celsius to target
  if (to === 'fahrenheit') {
    return celsius * 9/5 + 32;
  } else if (to === 'kelvin') {
    return celsius + 273.15;
  }
  
  return celsius;
};

export const formatCurrency = (amount: number, currency: string): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

export const convertTimezone = (date: Date, fromTimezone: string, toTimezone: string): Date => {
  // This is a simplified implementation
  // In a real app, you'd use a library like date-fns-tz or moment-timezone
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  
  // Mock timezone offsets (in reality, you'd use a proper timezone library)
  const timezoneOffsets: Record<string, number> = {
    'UTC': 0,
    'EST': -5,
    'CST': -6,
    'MST': -7,
    'PST': -8,
    'GMT': 0,
    'CET': 1,
    'JST': 9,
    'AEST': 10
  };
  
  const fromOffset = timezoneOffsets[fromTimezone] || 0;
  const toOffset = timezoneOffsets[toTimezone] || 0;
  
  const offsetDiff = (toOffset - fromOffset) * 3600000; // Convert hours to milliseconds
  
  return new Date(utc + offsetDiff);
};