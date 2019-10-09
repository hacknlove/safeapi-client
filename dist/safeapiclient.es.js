import { set, waitUntil, registerPlugin } from 'onget';
import jose from 'node-jose';
import fetchHelper from '@hacknlove/fetchhelper';
import shajs from 'sha.js';
import jwt from 'jsonwebtoken';
import seedrandom from 'seedrandom';
import saveAs from 'file-saver';

set('dotted://UUID', '');

const creation = {
  RS256: ['RSA', 256],
  RS384: ['RSA', 384],
  RS512: ['RSA', 512],
  PS256: ['RSA', 256],
  PS384: ['RSA', 384],
  PS512: ['RSA', 512],
  ES256: ['EC', 'P-256'],
  ES384: ['EC', 'P-384'],
  ES512: ['EC', 'P-512']
};

const conf = {
  algorithm: 'ES384',
  expiresIn: 120,
  checkInterval: 300,
  getInterval: 300,
  server: ''
};

const credentials = {
  // uuid
  // algorithm
  // pem (public)
};

const secret = {
  // password
  // pem (private)
};

async function createKey (data, alg) {
  const newAlgorithm = alg || conf.algorithm;

  const key = await jose.JWK.createKey(...creation[newAlgorithm]);
  const newPublicKey = key.toPEM(false);

  var [uuid, error] = await fetchHelper(`${conf.server}key`, {
    method: 'POST',
    json: {
      ...data,
      pem: newPublicKey
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (uuid) {
    credentials.pem = newPublicKey;
    secret.pem = key.toPEM(true);
    credentials.algorithm = newAlgorithm;
    credentials.uuid = uuid;
    set('dotted://uuid', uuid);
  }

  return [uuid, error]
}

async function decrypt (text, password) {
  const key = await jose.JWK.asKey({
    kty: 'oct',
    k: password
  });

  const decrypted = await jose.JWE.createDecrypt(key).decrypt(text).catch(e => console.warn(e) || {
    error: e
  });

  if (decrypted.error) {
    throw decrypted.error
  }
  return JSON.parse(decrypted.payload.toString())
}

async function encrypt (object, password) {
  const key = await jose.JWK.asKey({
    kty: 'oct',
    k: password
  });

  return jose.JWE.createEncrypt({
    format: 'compact'
  }, key).update(JSON.stringify(object)).final()
}

async function fromText (text) {
  const { pem, uuid, algorithm } = await decrypt(text, secret.password);
  secret.pem = pem;

  credentials.pem = await jose.JWK.asKey(pem, 'pem').then(key => key.toPEM(false));

  credentials.uuid = uuid;
  credentials.algorithm = algorithm;
  set('dotted://uuid', uuid);
  return uuid
}

async function fromFile () {
  const text = await new Promise((resolve, reject) => {
    const clean = setTimeout(() => {
      reject(new Error('TimedOut'));
    }, 60000);

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.key';
    input.click();
    input.onchange = e => {
      var file = e.target.files[0];
      var reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = readerEvent => {
        clearTimeout(clean);
        resolve(readerEvent.target.result);
      };
    };
  });
  return fromText(text)
}

conf.server = 'https://example.com';

function hash (request) {
  const {
    method,
    url,
    body
  } = request;

  const parsedUrl = new URL(url, conf.server);

  return shajs('sha256').update(JSON.stringify({
    body,
    hostname: parsedUrl.hostname,
    method,
    originalUrl: parsedUrl.pathname + parsedUrl.search,
    protocol: parsedUrl.protocol.replace(/:$/, '')
  })).digest('base64')
}

function logout (reason) {
  credentials.uuid = '';
  credentials.pem = '';
  secret.pem = '';
  secret.password = '';
  set('dotted://uuid');
}

async function sign (options) {
  const {
    method,
    body = {},
    url
  } = options;

  return jwt.sign({
    iss: credentials.uuid,
    sub: hash({
      body,
      method,
      url
    })
  }, secret.pem, {
    algorithm: credentials.algorithm,
    expiresIn: options.expiresIn || conf.expiresIn
  })
}

async function sFetch (url, options = {}) {
  if (!secret.pem) {
    await waitUntil('dotted://uuid');
  }

  var {
    method = 'GET',
    body,
    headers
  } = options;

  const Authorization = await sign({
    method,
    url,
    body
  });

  const [res, error] = await fetchHelper([
    `${conf.server}${url}`, {
      method,
      headers: {
        Authorization,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    }
  ]);
  if (options.onAuthErrorLogout && error && error.authError) {
    logout();
  }
  return [res, error]
}

async function renewKey (data = {}, alg) {
  const algorithm = alg || credentials.algorithm || conf.algorithm;

  const key = await jose.JWK.createKey(...creation[algorithm]);
  const publicKey = key.toPEM(false);

  const [res, err] = await sFetch(`key/${publicKey.uuid}`, {
    method: 'PUT',
    body: {
      ...data,
      pem: publicKey
    }
  });

  if (res) {
    secret.pem = key.toPEM(true);
    credentials.pem = key.toPEM(false);
    credentials.algorithm = algorithm;
  }

  return [res, err]
}

var mybtoa;

if (process.browser) {
  mybtoa = btoa;
} else {
  mybtoa = text => Buffer.from(text).toString('base64');
}

function passToKey (password) {
  const rnd = seedrandom(password);
  const buffer = new ArrayBuffer(32);
  const view = new Uint8Array(buffer);

  for (let i = 32; --i;) {
    view[i] = rnd.int32() % 256;
  }
  return mybtoa(String.fromCharCode.apply(null, view))
}

function setPlainPassword (pass = '') {
  secret.password = passToKey(pass);
  return secret.password
}

async function toText () {
  return encrypt({
    random: Math.random(),
    algorithm: credentials.algorithm,
    uuid: credentials.uuid,
    pem: secret.pem
  }, secret.password)
}

async function toFile () {
  const signedCredentials = await toText();

  var blob = new Blob([signedCredentials], { type: 'text/plain;charset=utf-8' });

  saveAs(blob, `${credentials.uuid}.${(new Date()).toISOString().substr(0, 19).replace(/[^0-9]/g, '')}.key`, undefined, true);
}

const PROTOCOL_LENGTH = 'safeapi://'.length;

const plugin = {
  name: 'safeapi',
  regex: /^safeapi:\/\/./,
  checkInterval: 30000,
  threshold: 500,
  getEndpoint (endpoint) {
    endpoint.realurl = endpoint.url.substr(PROTOCOL_LENGTH);
  },
  refresh (endpoint, eventHandler) {
    return sFetch(endpoint.realurl)
      .then(response => {
        response.json()
          .then(eventHandler)
          .catch(() => {
            response.text()
              .then(eventHandler)
              .catch(eventHandler);
          });
      })
      .catch(eventHandler)
  }
};

registerPlugin(plugin);

export { conf, createKey, credentials, fromFile, fromText, hash, logout, renewKey, sFetch, secret, setPlainPassword, sign, toFile, toText };
