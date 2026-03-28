// Utility functions to transform data between API format (snake_case) and frontend format (camelCase)

export const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

export const transformKeys = (obj: any, transformFn: (key: string) => string): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item, transformFn));
  }
  if (typeof obj !== 'object') return obj;
  
  const transformed: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = transformFn(key);
      transformed[newKey] = transformKeys(obj[key], transformFn);
    }
  }
  return transformed;
};

export const snakeToCamel = (obj: any): any => {
  return transformKeys(obj, toCamelCase);
};

export const camelToSnake = (obj: any): any => {
  return transformKeys(obj, toSnakeCase);
};
