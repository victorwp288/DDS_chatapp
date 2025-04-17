import * as libsignal from 'signal-protocol-react-native';
import { getIdentityKeyPair } from './keyGeneration';

async function initiateX3DH() {
  try {
    const aliceKeys = await getIdentityKeyPair();
    // Simulate Bob's keys (in a real app, fetch from server)
    const bobKeys = await libsignal.KeyHelper.generateIdentityKeyPair();
    const bobSignedPreKey = await libsignal.KeyHelper.generateSignedPreKey(bobKeys, 1);
    const bobPreKey = await libsignal.KeyHelper.generatePreKey(2);

    // Initialize SessionBuilder (X3DH)
    const address = new libsignal.ProtocolAddress('bob', 1);
    const sessionBuilder = new libsignal.SessionBuilder(address);

    // Process Bob's key bundle
    await sessionBuilder.processPreKey({
      identityKey: bobKeys.pubKey,
      signedPreKey: {
        keyId: bobSignedPreKey.keyId,
        publicKey: bobSignedPreKey.keyPair.pubKey,
        signature: bobSignedPreKey.signature,
      },
      preKey: {
        keyId: bobPreKey.keyId,
        publicKey: bobPreKey.keyPair.pubKey,
      },
    });

    console.log('X3DH session initialized');
  } catch (error) {
    console.error('X3DH failed:', error);
  }
}

initiateX3DH();