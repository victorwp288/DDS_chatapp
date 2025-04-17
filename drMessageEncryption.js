import * as libsignal from 'signal-protocol-react-native';

async function encryptMessage(message, address) {
  try {
    const sessionCipher = new libsignal.SessionCipher(address);
    const ciphertext = await sessionCipher.encrypt(message);
    console.log('Encrypted message:', ciphertext);
    return ciphertext;
  } catch (error) {
    console.error('Encryption failed:', error);
  }
}

async function decryptMessage(ciphertext, address) {
  try {
    const sessionCipher = new libsignal.SessionCipher(address);
    const plaintext = await sessionCipher.decrypt(ciphertext);
    console.log('Decrypted message:', plaintext);
    return plaintext;
  } catch (error) {
    console.error('Decryption failed:', error);
  }
}