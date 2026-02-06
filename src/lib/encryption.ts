import * as CryptoJS from 'crypto-js'

// Get encryption key from environment or use a default (should be in .env in production)
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secret-encryption-key-change-this-in-production'

/**
 * Encrypts a password using AES-256 encryption
 * @param password - The plain text password to encrypt
 * @returns The encrypted password as a string
 */
export function encryptPassword(password: string): string {
    try {
        const encrypted = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString()
        return encrypted
    } catch (error) {
        console.error('Encryption error:', error)
        throw new Error('Failed to encrypt password')
    }
}

/**
 * Decrypts an encrypted password
 * @param encryptedPassword - The encrypted password string
 * @returns The decrypted plain text password
 */
export function decryptPassword(encryptedPassword: string): string {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY)
        const plainText = decrypted.toString(CryptoJS.enc.Utf8)

        if (!plainText) {
            throw new Error('Decryption failed - invalid key or corrupted data')
        }

        return plainText
    } catch (error) {
        console.error('Decryption error:', error)
        throw new Error('Failed to decrypt password')
    }
}

/**
 * Encrypts a PIN using AES-256 encryption
 * @param pin - The plain text PIN to encrypt
 * @returns The encrypted PIN as a string
 */
export function encryptPin(pin: string): string {
    try {
        const encrypted = CryptoJS.AES.encrypt(pin, ENCRYPTION_KEY).toString()
        return encrypted
    } catch (error) {
        console.error('PIN encryption error:', error)
        throw new Error('Failed to encrypt PIN')
    }
}

/**
 * Decrypts an encrypted PIN
 * @param encryptedPin - The encrypted PIN string
 * @returns The decrypted plain text PIN
 */
export function decryptPin(encryptedPin: string): string {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedPin, ENCRYPTION_KEY)
        const plainText = decrypted.toString(CryptoJS.enc.Utf8)

        if (!plainText) {
            throw new Error('PIN decryption failed - invalid key or corrupted data')
        }

        return plainText
    } catch (error) {
        console.error('PIN decryption error:', error)
        throw new Error('Failed to decrypt PIN')
    }
}

/**
 * Verifies if a plain text PIN matches an encrypted PIN
 * @param plainPin - The plain text PIN to verify
 * @param encryptedPin - The encrypted PIN to compare against
 * @returns True if the PIN matches, false otherwise
 */
export function verifyPin(plainPin: string, encryptedPin: string): boolean {
    try {
        // Try to decrypt the stored PIN
        const decrypted = decryptPin(encryptedPin)
        return plainPin === decrypted
    } catch (error) {
        // If decryption fails (e.g. legacy plain text PIN), compare directly
        console.warn('PIN decryption failed, attempting direct comparison for legacy data')
        return plainPin === encryptedPin
    }
}
