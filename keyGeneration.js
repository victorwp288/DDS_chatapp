import * as SecureStore from 'expo-secure-store';
import * as libsignal from 'signal-protocol-react-native';
import { Buffer } from 'buffer';

// Utility to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer) => {
  try {
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    console.error('Error in arrayBufferToBase64:', error);
    throw error;
  }
};

// Utility to convert Base64 to ArrayBuffer
const base64ToArrayBuffer = (base64) => {
  try {
    return Buffer.from(base64, 'base64').buffer;
  } catch (error) {
    console.error('Error in base64ToArrayBuffer:', error);
    throw error;
  }
};

// Generate Identity Key Pair (for X3DH)
async function generateIdentityKeyPair() {
  try {
    const keyPair = await libsignal.KeyHelper.generateIdentityKeyPair();
    const publicKey = keyPair.pubKey;
    const privateKey = keyPair.privKey;

    console.log('Identity Key Pair:', {
      publicKeyLength: publicKey.byteLength,
      privateKeyLength: privateKey.byteLength,
    });

    await SecureStore.setItemAsync(
      'identityKeyPair',
      JSON.stringify({
        publicKey: arrayBufferToBase64(publicKey),
        privateKey: arrayBufferToBase64(privateKey),
      })
    );

    return keyPair;
  } catch (error) {
    console.error('Error generating identity key pair:', error);
    throw error;
  }
}

// Generate Signed Pre-Key (for X3DH)
async function generateSignedPreKey(identityKeyPair) {
  try {
    const keyId = Math.floor(Math.random() * 10000);
    const signedPreKeyPair = await libsignal.KeyHelper.generateSignedPreKey(
      identityKeyPair,
      keyId
    );

    console.log('Signed Pre-Key:', {
      keyId: signedPreKeyPair.keyId,
      publicKeyLength: signedPreKeyPair.keyPair.pubKey.byteLength,
      privateKeyLength: signedPreKeyPair.keyPair.privKey.byteLength,
      signatureLength: signedPreKeyPair.signature.byteLength,
    });

    await SecureStore.setItemAsync(
      `signedPreKey_${keyId}`,
      JSON.stringify({
        keyId: signedPreKeyPair.keyId,
        publicKey: arrayBufferToBase64(signedPreKeyPair.keyPair.pubKey),
        privateKey: arrayBufferToBase64(signedPreKeyPair.keyPair.privKey),
        signature: arrayBufferToBase64(signedPreKeyPair.signature),
      })
    );

    return signedPreKeyPair;
  } catch (error) {
    console.error('Error generating signed pre-key:', error);
    throw error;
  }
}

// Generate Pre-Keys (one-time keys for X3DH)
async function generatePreKeys(count = 10) {
  try {
    const preKeys = [];
    for (let i = 0; i < count; i++) {
      const keyId = Math.floor(Math.random() * 10000) + i;
      const preKey = await libsignal.KeyHelper.generatePreKey(keyId);

      console.log(`Pre-Key ${keyId}:`, {
        publicKeyLength: preKey.keyPair.pubKey.byteLength,
        privateKeyLength: preKey.keyPair.privKey.byteLength,
      });

      await SecureStore.setItemAsync(
        `preKey_${keyId}`,
        JSON.stringify({
          keyId: preKey.keyId,
          publicKey: arrayBufferToBase64(preKey.keyPair.pubKey),
          privateKey: arrayBufferToBase64(preKey.keyPair.privKey),
        })
      );

      preKeys.push(preKey);
    }
    return preKeys;
  } catch (error) {
    console.error('Error generating pre-keys:', error);
    throw error;
  }
}

// Retrieve Identity Key Pair from SecureStore
async function getIdentityKeyPair() {
  try {
    const credentials = await SecureStore.getItemAsync('identityKeyPair');
    if (credentials) {
      const { publicKey, privateKey } = JSON.parse(credentials);
      return {
        pubKey: base64ToArrayBuffer(publicKey),
        privKey: base64ToArrayBuffer(privateKey),
      };
    }
    return null;
  } catch (error) {
    console.error('Error retrieving identity key pair:', error);
    throw error;
  }
}

// Example usage
async function initializeKeys() {
  try {
    const identityKeyPair = await generateIdentityKeyPair();
    const signedPreKey = await generateSignedPreKey(identityKeyPair);
    const preKeys = await generatePreKeys(10);

    console.log('Keys initialized:', {
      identityKeyPair: {
        publicKeyLength: identityKeyPair.pubKey.byteLength,
        privateKeyLength: identityKeyPair.privKey.byteLength,
      },
      signedPreKey: {
        keyId: signedPreKey.keyId,
        publicKeyLength: signedPreKey.keyPair.pubKey.byteLength,
        privateKeyLength: signedPreKey.keyPair.privKey.byteLength,
        signatureLength: signedPreKey.signature.byteLength,
      },
      preKeys: preKeys.map(preKey => ({
        keyId: preKey.keyId,
        publicKeyLength: preKey.keyPair.pubKey.byteLength,
        privateKeyLength: preKey.keyPair.privKey.byteLength,
      })),
    });

    return { identityKeyPair, signedPreKey, preKeys };
  } catch (error) {
    console.error('Error initializing keys:', error);
    throw error;
  }
}

export {
  generateIdentityKeyPair,
  generateSignedPreKey,
  generatePreKeys,
  getIdentityKeyPair,
  initializeKeys,
};