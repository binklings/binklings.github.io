var publicKey;
(async () => {
  const RSA_Public_Key = "-----BEGIN PUBLIC KEY----- MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA7kZIw4McwsEwlhtXAZMC jvczX97awUH/1PvSWMskO5fjqr1Nmaezqq3zd7+7ynFaUiylgZAQWt++FzR9/013 XGqLg5RHhxw6OEKlB7y0/5bDD/Q9o2tUuWcXOtoJPT7b6z+3RQhJu0/aB98EmSBp Zc7UduoxCnQKkVNJYbRS/C6jTyvEcT0rK+/0pAPKG0o4xFHR+YEykcKJY5Wlj+22 Us10obS9yrUCAMYBYDjrjj4TPT8qcPeNBFApt6DoD8bLg1GEvIoD0yiZT2rxzXMI mpfagc8BXQfIRK6+rohHjnAkErWvmdoUYKmVKLf10LFGDXJtDwWOfQCHjy3Yhoa0 eBFn/AcI1oFQG+I4C4dyWR/zduJ1eAUCDeN+VWa5N+O1t786+smM9ykCGFRN7JQr Y4BAr3KW7BBuR3oofbgo16KIASpz+FiuclLP24EpNWqYdIu4ZDTZOOEbWB5sr+6C tIJaXgUTth7naPGq0lHYqRnaletiKh8oEAn3z2pJbPhl8SdRSkEwKfxSNdJp/G5g vNQHbBRASweXOHqEsJzT4pokFpj3p42bQ/tJHhL0wdVTHZ051LcQQEjctfjSu90W PdI/NSu56ScqyJo/eojDac2oPetQN0iRvrFt6bzFpujVOvwgxzJqfqFC7l1/bCBI +U1I0LKBuvlFXpXREkVulP0CAwEAAQ== -----END PUBLIC KEY-----";
  publicKey = await importPublicKey(RSA_Public_Key);
})();


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

async function generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey({
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: {name: "SHA-512"}
    }, true, ["encrypt", "decrypt"]);

    const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    const publicKeyPem = arrayBufferToPem(publicKey, "PUBLIC KEY");
    const privateKeyPem = arrayBufferToPem(privateKey, "PRIVATE KEY");

    return {publicKeyPem, privateKeyPem};
}

async function importPublicKey(pem) {
    const binaryDer = pemToArrayBuffer(pem);
    return crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-512"
        },
        true,
        ["encrypt"]
    );
}

async function importPrivateKey(pem) {
    const binaryDer = pemToArrayBuffer(pem);
    return crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-512"
        },
        true,
        ["decrypt"]
    );
}

async function encryptData(publicKey, data) {
    const encodedData = new TextEncoder().encode(data);
    const encrypted = await crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        publicKey,
        encodedData
    );
    return arrayBufferToBase64(encrypted);
}

async function decryptData(privateKey, encryptedData) {
    const binaryData = base64ToArrayBuffer(encryptedData);
    const decrypted = await crypto.subtle.decrypt(
        {
            name: "RSA-OAEP"
        },
        privateKey,
        binaryData
    );
    return new TextDecoder().decode(decrypted);
}

async function SHA256(inputString) {
  const data = new TextEncoder().encode(inputString);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  
  return hashBase64;
}





async function encryptPwd(password){
  const hashPwd = await SHA256(password);
  pwdEncrypted(hashPwd);
}

async function registration(data, cfToken){
  const content = {
    timestamp: Date.now(),
    email: data.email,
    pwd: data.password,
    //challengeToken: cfToken
  }
  const EncryptedData = await encryptData(publicKey, JSON.stringify(content));
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://s.binklings.com/account/register?data=' + EncryptedData, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      if(xhr.responseText == 'done'){
        rs();
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