import { airdropFactory, generateKeyPair, lamports } from "@solana/kit";
import createClient from "./client.js";
import feePayer from "./getkeypair.js";

const {rpc, rpcSubscriptions}= createClient();

console.log(feePayer.address, 'public key');

await airdropFactory({rpc, rpcSubscriptions})(
    {
        recipientAddress: feePayer.address,
        lamports: lamports(1_000_000_000n),
        commitment: 'confirmed'
    }
)

await new Promise(r => setTimeout(r, 15000));

const {value:  balance} = await rpc.getBalance(feePayer.address).send();

console.log(`Balance: ${balance} lamports.`);
