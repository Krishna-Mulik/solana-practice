import { appendTransactionMessageInstructions, createTransactionMessage, generateKeyPairSigner, getSignatureFromTransaction, isTransactionWithBlockhashLifetime, pipe, sendAndConfirmTransactionFactory, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, signTransactionMessageWithSigners } from '@solana/kit';
import client from './client.js'
import feePayer from './getkeypair.js';
import { getInitializeMintInstruction, getMintSize, TOKEN_PROGRAM_ADDRESS } from '@solana-program/token';
import { getCreateAccountInstruction } from '@solana-program/system';

const { rpc, rpcSubscriptions } = await client();

console.log("FeePayer: ", feePayer);

// Mint Wallet
const mint = await generateKeyPairSigner();
console.log(`mint wallet pub: ${mint}`);

// Get Space for Mint Account
const space = BigInt(getMintSize());

// Get Minimum Rent Exempt for Above Mint Space
const rent = await rpc.getMinimumBalanceForRentExemption(space).send();

// Instruction to Creat Account

const createAccountInstruction = getCreateAccountInstruction({
    payer: feePayer,
    newAccount: mint,
    lamports: rent,
    space,
    programAddress: TOKEN_PROGRAM_ADDRESS
});

const initializeMintInstruction = getInitializeMintInstruction({
    mint: mint.address,
    decimals: 9,
    mintAuthority: feePayer.address
});

const instructions = [createAccountInstruction, initializeMintInstruction];

// Lastest Blockhas
const { value: blockhash } = await rpc.getLatestBlockhash().send();

// Transaction Message
const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(blockhash, tx),
    (tx) => appendTransactionMessageInstructions(instructions, tx)
);

const singedTransaction = await signTransactionMessageWithSigners(transactionMessage);

console.log('after signedTransaction');

if (!isTransactionWithBlockhashLifetime(singedTransaction)) {
    throw new Error("Expected blockhash-lifetime transaction");
}

console.log('after block transction blockhas life check');


// Send and Confirm Transaction
await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
    singedTransaction,
    { commitment: 'confirmed' }
);

console.log('after sendandconfirm transaction factory');


const transactionSignature = getSignatureFromTransaction(singedTransaction);

console.log(`Mint Address: ${mint.address}`);
console.log(`\n Transaction Signature: ${transactionSignature}`);

const data = await rpc.getAccountInfo(mint.address).send();
console.log(`Data: ${JSON.stringify(data.value)}`);
