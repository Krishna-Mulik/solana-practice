import { airdropFactory, createSolanaRpc, createSolanaRpcSubscriptions, lamports, Rpc, RpcSubscribeOptions, RpcSubscriptions, SolanaRpcApi, SolanaRpcSubscriptionsApi } from "@solana/kit";
import feePayer from "./getkeypair.js";

export type Client = {
    rpc: Rpc<SolanaRpcApi>;
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
}

let client: undefined | Client;

export default async function createClient() {
    if (client) {
        return client;
    }

    const rpc = createSolanaRpc('http://localhost:8899');
    const rpcSubscriptions = createSolanaRpcSubscriptions('ws://localhost:8900');

    client = {
        rpc,
        rpcSubscriptions
    }

    await airdropFactory({ rpc, rpcSubscriptions })(
        {
            recipientAddress: feePayer.address,
            lamports: lamports(1_000_000_000n),
            commitment: "confirmed"
        }
    );

    return client;
}
