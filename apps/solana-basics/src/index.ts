import {
    airdropFactory,
    appendTransactionMessageInstructions,
    createSolanaRpc,
    createSolanaRpcSubscriptions,
    createTransactionMessage,
    generateKeyPairSigner,
    lamports,
    pipe,
    sendAndConfirmTransactionFactory,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    signTransactionMessageWithSigners,
    isTransactionWithBlockhashLifetime,
    getSignatureFromTransaction
} from '@solana/kit';
import {
    getCreateAccountInstruction
} from '@solana-program/system'
import {
    getInitializeMintInstruction,
    getMintSize,
    TOKEN_PROGRAM_ADDRESS
} from '@solana-program/token'

// Create Connection Local Validators
const rpc = createSolanaRpc('http://127.0.0.1:8899');
const rpcSubscriptions = createSolanaRpcSubscriptions('ws://127.0.0.1:8900');

// Create FeePayer wallet/keypair
const feePayer = await generateKeyPairSigner();

console.log(`feePayer: ${feePayer}`, `address: ${feePayer.address}`);

// Airdrop Solana to feePayer
await airdropFactory({rpc, rpcSubscriptions})({
    recipientAddress: feePayer.address,
    lamports: lamports(1_000_000_000n),
    commitment: "confirmed"
});

// Mint Account Keypair
const mint = await generateKeyPairSigner();

// Get Minimum Space for a Mint Account from @solana-program/token
const space = BigInt(getMintSize());

// Get Minimum Balance for rent exemption from rpc
const rent = await rpc.getMinimumBalanceForRentExemption(space).send();

// Create Instruction for creating an Account,
// use @solana-program/system
// System program creates an account than gives the ownership to TokenProgram
const createAccountInstruction = getCreateAccountInstruction({
    payer: feePayer,
    newAccount: mint,
    lamports: rent,
    space,
    programAddress: TOKEN_PROGRAM_ADDRESS
});

// Instruction to create a Mint Account Data
const initializeMintInstruction = getInitializeMintInstruction({
    mint: mint.address,
    decimals: 9,
    mintAuthority: feePayer.address
});

const instructions = [createAccountInstruction, initializeMintInstruction];

// Get Latest Blockhash to include in transaction
const {value: blockhash} = await rpc.getLatestBlockhash().send();

// Create Transaction Message
const transactionMessage = pipe(
    createTransactionMessage({version: 0}),
    (tx) => setTransactionMessageFeePayerSigner(feePayer, tx) ,
    (tx) => setTransactionMessageLifetimeUsingBlockhash(blockhash, tx),
    (tx) => appendTransactionMessageInstructions(instructions, tx)
);

// Sign Transaction Message with required signers (feePayer and mint)
const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);

if (!isTransactionWithBlockhashLifetime(signedTransaction)) {
  throw new Error("Expected blockhash-lifetime transaction");
}

// Send and Confirm Transaction
await sendAndConfirmTransactionFactory({rpc, rpcSubscriptions})(
    signedTransaction,
    {commitment: "confirmed"}
);

// Get Transaction Signature
const transactionSignature = getSignatureFromTransaction(signedTransaction);

console.log(`Mint Address: ${mint.address}`);
console.log(`\n Transacton Signature: ${transactionSignature}`)