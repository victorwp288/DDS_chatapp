async function sum(number1, number2) {
    //const encoder = new TextEncoder();
    /*const messageToSign = encoder.encode(
      JSON.stringify({
        ciphertext: encryptedMessage.ciphertext,
        iv: encryptedMessage.iv,
        tag: encryptedMessage.tag,
      })
    );*/
    
  
    return await parseInt(number1,10)+parseInt(number2,10);
  }
  async function sub(number1, number2) {
    const num1=parseInt(number1,10);
    const num2=parseInt(number2,10);
    if (num1 < num2) {
      return await num2 - num1;
    }
    else {
        return await num1 - num2;
    }

  }
  async function mult(number1, number2) {

    return await parseInt(number1,10)*parseInt(number2,10);

  }
  export {sum,sub,mult};