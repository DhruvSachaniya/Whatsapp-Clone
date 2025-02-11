import * as CryptoJS from 'crypto-js';

export class CyptoSecurity {
    constructor() {}

    // Encryption function
    encrypt = (data: string, password: string): string => {
        // Generate a random salt
        const salt = CryptoJS.lib.WordArray.random(128 / 8).toString(
            CryptoJS.enc.Hex,
        );

        // Derive the key using PBKDF2
        const key = CryptoJS.PBKDF2(password, salt, {
            keySize: 192 / 32, // 192 bits = 24 bytes
            iterations: 1,
        });

        // Generate a random IV
        const iv = CryptoJS.lib.WordArray.random(128 / 8);

        // Encrypt the data
        const encrypted = CryptoJS.AES.encrypt(data, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        // Combine salt, IV, and encrypted data into a single string
        return `${salt}|${iv.toString(CryptoJS.enc.Hex)}|${encrypted.toString()}`;
    };

    // Decryption function
    decrypt = (encryptedData: string, password: string): string => {
        const [salt, ivHex, encrypted] = encryptedData.split('|');

        if (!salt || !ivHex || !encrypted) {
            throw new Error('Invalid encrypted data');
        }

        // Derive the key using PBKDF2
        const key = CryptoJS.PBKDF2(password, salt, {
            keySize: 192 / 32, // 192 bits = 24 bytes
            iterations: 1,
        });

        // Convert IV from hex to WordArray
        const iv = CryptoJS.enc.Hex.parse(ivHex);

        // Decrypt the data
        const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        // Convert the decrypted data to a UTF-8 string
        return decrypted.toString(CryptoJS.enc.Utf8);
    };
}

// Example usage
const crypto = new CyptoSecurity();
const password = 'Password is used to generate key';
const data = 'Hello, this is a secret message!';

// Encrypt
const encrypted = crypto.encrypt(data, password);
// console.log('Encrypted:', encrypted);

// Decrypt
const decrypted = crypto.decrypt(encrypted, password);
// console.log('Decrypted:', decrypted);
