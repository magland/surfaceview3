import crypto from 'crypto';
import { elapsedSince, FeedId, JSONObject, KeyPair, NodeId, PrivateKey, PrivateKeyHex, PublicKey, PublicKeyHex, Signature, Timestamp } from './kacheryTypes';
import kacheryP2PSerialize from './kacheryP2PSerialize';

const ed25519PubKeyPrefix = "302a300506032b6570032100";
const ed25519PrivateKeyPrefix = "302e020100300506032b657004220420";

export const getSignature = (obj: Object, keyPair: KeyPair): Signature => {
    try {
        return crypto.sign(null, kacheryP2PSerialize(obj), keyPair.privateKey.toString()).toString('hex') as any as Signature;
    }
    catch(err) {
        /* istanbul ignore next */
        throw Error('Exception when creating signature.');
    }
}

export const getSignatureJson = (obj: JSONObject, keyPair: KeyPair): Signature => {
    try {
        return crypto.sign(null, Buffer.from(JSONStringifyDeterministic(obj)), keyPair.privateKey.toString()).toString('hex') as any as Signature;
    }
    catch(err) {
        /* istanbul ignore next */
        throw Error('Exception when creating signature Json.');
    }
}

export const verifySignatureJson = (obj: JSONObject & {timestamp?: Timestamp}, signature: Signature, publicKey: PublicKey, opts: {checkTimestamp: boolean}={checkTimestamp: false}) => {
    /* istanbul ignore next */
    if (opts.checkTimestamp) {
        if (!obj.timestamp) {
            return false;
        }
        const elapsed = elapsedSince(obj.timestamp)
        // needs to be less than 30 minutes old
        const numMinutes = 30;
        if (elapsed > numMinutes * 60 * 1000) {
            return false;
        }
    }
    try {
        return crypto.verify(null, Buffer.from(JSONStringifyDeterministic(obj)), publicKey.toString(), Buffer.from(signature.toString(), 'hex'));
    }
    catch(err) {
        /* istanbul ignore next */
        return false;
    }
}

export const verifySignature = (obj: Object & {timestamp?: Timestamp}, signature: Signature, publicKey: PublicKey, opts={checkTimestamp: false}): boolean => {
    /* istanbul ignore next */
    if (opts.checkTimestamp) {
        if (!obj.timestamp) {
            return false;
        }
        const elapsed = elapsedSince(obj.timestamp)
        // needs to be less than 30 minutes old
        const numMinutes = 30;
        if (elapsed > numMinutes * 60 * 1000) {
            return false;
        }
    }
    try {
        const verified = crypto.verify(null, kacheryP2PSerialize(obj), publicKey.toString(), Buffer.from(signature.toString(), 'hex')) 
        // why does typescript think that verified is a buffer? it should be boolean!
        return verified as any as boolean
    }
    catch(err) {
        /* istanbul ignore next */
        return false;
    }
}

export const publicKeyToHex = (publicKey: PublicKey): PublicKeyHex => {
    const x = publicKey.split('\n');
    /* istanbul ignore next */
    if (x[0] !== '-----BEGIN PUBLIC KEY-----') {
        throw Error('Problem in public key format.');
    }
    /* istanbul ignore next */
    if (x[2] !== '-----END PUBLIC KEY-----') {
        throw Error('Problem in public key format.');
    }
    const ret = Buffer.from(x[1], 'base64').toString('hex');
    /* istanbul ignore next */
    if (!ret.startsWith(ed25519PubKeyPrefix)) {
        throw Error('Problem in public key format.');
    }
    return ret.slice(ed25519PubKeyPrefix.length) as any as PublicKeyHex;
}

export const publicKeyHexToFeedId = (publicKeyHex: PublicKeyHex): FeedId => {
    return publicKeyHex as any as FeedId
}

export const privateKeyToHex = (privateKey: PrivateKey): PrivateKeyHex => {
    const x = privateKey.split('\n');
    /* istanbul ignore next */
    if (x[0] !== '-----BEGIN PRIVATE KEY-----') {
        throw Error('Problem in private key format.');
    }
    /* istanbul ignore next */
    if (x[2] !== '-----END PRIVATE KEY-----') {
        /* istanbul ignore next */
        throw Error('Problem in private key format.');
    }
    const ret = Buffer.from(x[1], 'base64').toString('hex');
    /* istanbul ignore next */
    if (!ret.startsWith(ed25519PrivateKeyPrefix)) {
        throw Error('Problem in private key format.');
    }
    return ret.slice(ed25519PrivateKeyPrefix.length) as any as PrivateKeyHex;
}

export const hexToPublicKey = (x: PublicKeyHex): PublicKey => {
    /* istanbul ignore next */
    if (!x) {
        throw Error('Error in hexToPublicKey. Input is empty.');
    }
    return `-----BEGIN PUBLIC KEY-----\n${Buffer.from(ed25519PubKeyPrefix + x, 'hex').toString('base64')}\n-----END PUBLIC KEY-----\n` as any as PublicKey;
}

export const hexToPrivateKey = (x: PrivateKeyHex): PrivateKey => {
    /* istanbul ignore next */
    if (!x) {
        throw Error('Error in hexToPrivateKey. Input is empty.');
    }
    return `-----BEGIN PRIVATE KEY-----\n${Buffer.from(ed25519PrivateKeyPrefix + x, 'hex').toString('base64')}\n-----END PRIVATE KEY-----\n` as any as PrivateKey;
}

// Conversion between types
export const nodeIdToPublicKey = (nodeId: NodeId): PublicKey => {
    // NOTE INCONSISTENCY: Our example keys do not end with a newline, but this function adds one.
    return hexToPublicKey(nodeId.toString() as any as PublicKeyHex);
}
export const feedIdToPublicKeyHex = (feedId: FeedId): PublicKeyHex => {
    return feedId as any as PublicKeyHex;
}
export const publicKeyHexToNodeId = (x: PublicKeyHex) : NodeId => {
    return x as any as NodeId;
}

export const createKeyPair = () => {
    const {publicKey, privateKey} = crypto.generateKeyPairSync('ed25519', {
        // modulusLength: 1024,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
            // cipher: 'aes-256-cbc',
            // passphrase: 'top secret'
        }
    });
    return {
        publicKey: publicKey as any as PublicKey,
        privateKey: privateKey as any as PrivateKey
    }
}

// Thanks: https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify
export const JSONStringifyDeterministic = ( obj: Object, space: string | number | undefined =undefined ) => {
    var allKeys: string[] = [];
    JSON.stringify( obj, function( key, value ){ allKeys.push( key ); return value; } )
    allKeys.sort();
    return JSON.stringify( obj, allKeys, space );
}
