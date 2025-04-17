import { Crypto } from '@peculiar/webcrypto';
const crypto = {
  subtle: new Crypto().subtle,
  getRandomValues: new Crypto().getRandomValues.bind(new Crypto()),
};
export default crypto;