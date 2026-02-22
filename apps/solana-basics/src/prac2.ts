import { findAssociatedTokenPda, TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";
import { address } from "@solana/kit";

const ata = await findAssociatedTokenPda({
    mint: address("F6VGJZvgeCeeAyd9sgzgW9DFGcf9pGV7X17RYSLahtCb"),
    owner: address("CVWiq7rHauHqEb8bdkwK8pBefPd3yCCsjKhWy2muRTD9"),
    tokenProgram: TOKEN_PROGRAM_ADDRESS
});

console.log(ata);

