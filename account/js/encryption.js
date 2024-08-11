const rsaPublicKeyString = "-----BEGIN PUBLIC KEY----- MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAvvYxuX1++YmYDe4HInjn HMK/kNPenenR4WedAimsz9V6dEcx6vi6ut0rQ4yTnKGbnEBhImneEVQr4ark/loE sVdl4hW2+UukueRBuKlB7cHsbVG2ipIkTFXPrBGWsEVdsOrkMxVRSRr8QTXucZ9n 5jhrMFrI/OcLcAWEuKGcqvsvNavt/zxiyP6kRsofdF+dkHZpc4uBEiYC7xy3eXpF 16bqNbnZkLb8RS+Uwyk/ZHAPcaQrrGg3XYu97iKfDpFDigtp0ViNGLjnwj1q6Nxf 0JSd53ybsx1LOq7S2BLaXURPCoMYh8kL4ZaMKVhIluaSJVtZl1yNV7Hyysu13wZW FxqsTHW/J+cSflNJfxrvUQrreuxx5vvxJi8frja/obZeixgMPy0YplsBLGJu/nEz Be/eBur5plPStpxphGG+ZWb0ICnUOQvIIPyhjiaPW421M61PfoQPSScp1cPD2gAe /SwkAhu6LoN5pmQ3FwxJudFykoKPsbuF823Rsf9rbi9D+ItlxOh8XbDYaA49mO/Z fmUxCchOFdA8DGl4nJ8PZcY5yiCB2iSDARHDdLSl1w9W18TJ/3NbZryykhTAzksL AvqFSvv2M5xR6txQBpBvBOEFKDZNBKf94rFDKWhoJEvBhiU8b8obpvnBrPIQXZmm V0FXakM5YxZtfwG/6qJv/hMCAwEAAQ== -----END PUBLIC KEY-----";


function arrayBufferToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  let binary_string = atob(base64);
  let len = binary_string.length;
  let bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function pemToArrayBuffer(pem) {
  let base64 = pem.replace(/(-----(BEGIN|END) [A-Z ]+-----|\n)/g, '');
  return base64ToArrayBuffer(base64);
}

function arrayBufferToPem(buffer, label) {
  let base64 = arrayBufferToBase64(buffer);
  let pem = `-----BEGIN ${label}-----\n`;
  let lineLength = 64;
  for (let i = 0; i < base64.length; i += lineLength) {
    pem += base64.substring(i, i + lineLength) + '\n';
  }
  pem += `-----END ${label}-----\n`;
  return pem;
}


async function SHA512(inputString) {
  const data = new TextEncoder().encode(inputString);
  
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  
  return hashBase64;
}


async function encryptData(plaintext) {
  try {
    const aesKey = await window.crypto.subtle.generateKey(
      {
        name: "AES-CBC",
        length: 256, 
      },
      true, 
      ["encrypt", "decrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(16));

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      aesKey,
      new TextEncoder().encode(plaintext)
    );
    const ciphertext = arrayBufferToBase64(ciphertextBuffer);

    const aesData = JSON.stringify({
      key: arrayBufferToBase64(await window.crypto.subtle.exportKey("raw", aesKey)),
      iv: arrayBufferToBase64(iv),
    });

    const rsaPublicKey = await window.crypto.subtle.importKey(
      "spki",
      pemToArrayBuffer(rsaPublicKeyString),
      {
        name: "RSA-OAEP",
        hash: "SHA-512",
      },
      false, 
      ["encrypt"]
    );

    const encryptedAesDataBuffer = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      rsaPublicKey,
      new TextEncoder().encode(aesData)
    );
    const encryptedAesData = arrayBufferToBase64(encryptedAesDataBuffer);

    return {
      ciphertext,
      encryptedAesData,
    };
  } catch (error) {
    console.error("encrypt err: ", error);
    throw error;
  }
}


async function encryptPwd(password){
  const hashPwd = await SHA512(password);
  pwdEncrypted(hashPwd);
}

async function registration(data, cfToken){
  var content = {
    timestamp: Date.now(),
    email: data.email,
    pwd: data.password,
    challengeToken: cfToken
  }
  const EncryptedData = await encryptData(JSON.stringify(content));
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://s.binklings.com/account/register?data=' + EncryptedData.ciphertext + '&k=' + EncryptedData.encryptedAesData, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      if(xhr.responseText.includes('::')){
        rs("http://139.224.137.4/mail?"+xhr.responseText.split('::')[1]);
      }else{
        ce(xhr.responseText);
      }
    }else{
      if(xhr.readyState === XMLHttpRequest.DONE){
        ce('Something went wrong. We tried to send a connection request to the BINKLINGS server, but received an error message: '+xhr.readyState+' '+xhr.responseText+' . If the problem continues, please contact support@binklings.com.');
      }
    }
  };
  xhr.send();
}
