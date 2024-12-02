// Declare a contract.
// launch with npx ts-node src/scripts/9.declareContract.ts
// Coded with Starknet.js v5.16.0, Starknet-devnet-rs v0.1.0

import { Account, json, RpcProvider, Contract } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


async function main(classHash: string) {
    // const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" }); // only for starknet-devnet-rs
    // const provider = new RpcProvider({ nodeUrl: `https://starknet-sepolia.infura.io/v3/${process.env.STARKNET_API_KEY}` }); // only for starknet-devnet-rs
    const provider = new RpcProvider({ nodeUrl: `https://starknet-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_STARKNET_API_KEY}` });
    console.log("Provider connected");

    // initialize existing predeployed account 0 of Devnet
    const privateKey = process.env.PRIVATE_KEY ?? "";
    const accountAddress: string = process.env.ACCOUNT_ADDRESS ?? "";
    const account = new Account(provider, accountAddress, privateKey, '1');
    // const account = new Account(provider, accountAddress, privateKey);
    console.log("Account connected\n");

    // Deploy Test contract in specified network (Sepolia)
    // ClassHash of the already declared contract
    // const classHash = '0x2eaf260499a8d4d9237e83340a1c79c3f7b523b7238ef8ecf09fcd15c1ac697';
    // const classHash = declareResponse.class_hash;

    // const deployResponse = await account.deployContract({ classHash: classHash });
    const deployResponse = await account.deployContract({ classHash: classHash, constructorCalldata: ["0x044c3161d3f2f03d171646142a3f26c81ba483351e617a1c2ef34e4dfdf937bf"] });
    await provider.waitForTransaction(deployResponse.transaction_hash);

    // read abi of Test contract
    const { abi: testAbi } = await provider.getClassByHash(classHash);
    if (testAbi === undefined) {
        throw new Error('no abi.');
    }

    // Connect the new contract instance:
    const myTestContract = new Contract(testAbi, deployResponse.contract_address, provider);
    console.log('✅ Test Contract connected at =', myTestContract.address);
}

// const classHash_SchemaRegistry = "0x048e323ae4da6ee2ad8e8a7f5a103feca28681b1086b6a7f5a39c8b9e3e6af46"; // SchemaRegistry
const classHash_SAS = "0x07e88b0f4e3455295330dd8f921e917dcce8efc0ac6bb41237378b39bce9b168"; // SAS
// const classHash_RecipientResolver = "0x18cdcbee521e009d6c1dc68deefb25a70d7e4c45e5dcbbe8346c63af1eb5e25"; // RecipientResolver
main(classHash_SAS)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// Contrat addresses (Starknet Sepolia)
// 0x044c3161d3f2f03d171646142a3f26c81ba483351e617a1c2ef34e4dfdf937bf - SchemaRegistry
// 0x4dc69fbd4e3e5d22f0c8146add6f1804f7c16cf85aa3473117ee587c9e7853e - EAS