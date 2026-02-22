import { getCreateAssociatedTokenInstructionAsync } from '@solana-program/token';
import client from './client.js';
import feePayer from './getkeypair.js';
import { address, appendTransactionMessageInstruction, createTransactionMessage, getPublicKeyFromAddress, getSignatureFromTransaction, isTransactionMessageWithBlockhashLifetime, isTransactionWithBlockhashLifetime, pipe, sendAndConfirmDurableNonceTransactionFactory, sendAndConfirmTransactionFactory, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, signTransactionMessageWithSigners } from '@solana/kit';

const { rpc, rpcSubscriptions } = await client();

const mintAddress = address("F6VGJZvgeCeeAyd9sgzgW9DFGcf9pGV7X17RYSLahtCb");

const createAtaInstruction = await getCreateAssociatedTokenInstructionAsync({
    payer: feePayer,
    mint: mintAddress,
    owner: feePayer.address
});

const {value: lasteBlockhash} = await rpc.getLatestBlockhash().send();

const transactionMessage = pipe(
    createTransactionMessage({version: 0}),
    (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(lasteBlockhash, tx),
    (tx) => appendTransactionMessageInstruction(createAtaInstruction, tx)
);

const singedTransaction = await signTransactionMessageWithSigners(transactionMessage);

if(!isTransactionWithBlockhashLifetime(singedTransaction)) {
    throw new Error('Transaction Messag Not Signed with Blockhash');
}

await sendAndConfirmTransactionFactory({rpc, rpcSubscriptions})(
    singedTransaction,
    {commitment: 'confirmed'}
);

const transactionForAtaCreation = await getSignatureFromTransaction(singedTransaction);

console.log('Transaction Signature for ATA Creation ', transactionForAtaCreation);
