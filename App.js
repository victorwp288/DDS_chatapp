import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { initializeKeys } from './keyGeneration';

export default function App() {
  const [keys, setKeys] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchKeys() {
      try {
        const result = await initializeKeys();
        setKeys(result);
      } catch (err) {
        setError(err);
      }
    }
    fetchKeys();
  }, []);

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (!keys) {
    return <Text>Loading keys...</Text>;
  }

  return (
    <View>
      <Text>Keys initialized: {JSON.stringify({
        identityKeyPair: {
          publicKeyLength: keys.identityKeyPair.pubKey.byteLength,
          privateKeyLength: keys.identityKeyPair.privKey.byteLength,
        },
        signedPreKey: {
          keyId: keys.signedPreKey.keyId,
          publicKeyLength: keys.signedPreKey.keyPair.pubKey.byteLength,
          privateKeyLength: keys.signedPreKey.keyPair.privKey.byteLength,
          signatureLength: keys.signedPreKey.signature.byteLength,
        },
        preKeys: keys.preKeys.map(preKey => ({
          keyId: preKey.keyId,
          publicKeyLength: preKey.keyPair.pubKey.byteLength,
          privateKeyLength: preKey.keyPair.privKey.byteLength,
        })),
      }, null, 2)}</Text>
    </View>
  );
}