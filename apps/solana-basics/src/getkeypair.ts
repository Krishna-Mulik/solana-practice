import { airdropFactory, createKeyPairFromBytes, createSignerFromKeyPair, lamports } from '@solana/kit';
import keypairJson from '../keypair.json';
import client from './client.js';

// console.log(keypairJson);

const secretKey = Uint8Array.from(
    keypairJson
)
// console.log(secretKey);

const keypair = await createKeyPairFromBytes(secretKey)

const feePayer = await createSignerFromKeyPair(keypair)
console.log('address: ', feePayer.address.toString())

export default feePayer;