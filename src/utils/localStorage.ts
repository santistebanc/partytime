/**
 * LocalStorage utility functions that handle JSON serialization/deserialization automatically
 */

export class LocalStorageUtils {
  /**
   * Get a value from localStorage and parse it as JSON
   * @param key - The localStorage key
   * @param defaultValue - Default value if key doesn't exist or parsing fails
   * @returns The parsed value or default value
   */
  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set a value in localStorage with JSON serialization
   * @param key - The localStorage key
   * @param value - The value to store
   */
  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }

  /**
   * Remove a key from localStorage
   * @param key - The localStorage key to remove
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }

  /**
   * Check if a key exists in localStorage
   * @param key - The localStorage key to check
   * @returns True if the key exists, false otherwise
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Clear all localStorage data
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Get all keys from localStorage
   * @returns Array of all localStorage keys
   */
  static keys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Get the size of localStorage in bytes (approximate)
   * @returns Approximate size in bytes
   */
  static size(): number {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          total += key.length + value.length;
        }
      }
    }
    return total;
  }
}

// Convenience functions for common operations
export const localstorage = {
  /**
   * Get a value from localStorage with JSON parsing
   */
  get: LocalStorageUtils.get,
  
  /**
   * Set a value in localStorage with JSON serialization
   */
  set: LocalStorageUtils.set,
  
  /**
   * Remove a key from localStorage
   */
  remove: LocalStorageUtils.remove,
  
  /**
   * Check if a key exists in localStorage
   */
  has: LocalStorageUtils.has,
  
  /**
   * Clear all localStorage data
   */
  clear: LocalStorageUtils.clear,
  
  /**
   * Get all localStorage keys
   */
  keys: LocalStorageUtils.keys,
  
  /**
   * Get localStorage size in bytes
   */
  size: LocalStorageUtils.size,
};

// Export the class as default
export default LocalStorageUtils;
