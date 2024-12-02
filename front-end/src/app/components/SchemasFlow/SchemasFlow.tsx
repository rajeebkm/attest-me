"use client"
import { useMemo, useState } from "react";
import { useAccount, useContractWrite } from "@starknet-react/core";
import toast from "react-hot-toast";
import { SCHEMA_REGISTRY } from "@/app/utils/constant";
import SchemRegistryAbi from "@/app/abi/schemaRegistry.abi.json";
import { Contract, RpcProvider, validateAndParseAddress, getChecksumAddress, validateChecksumAddress } from "starknet";
import { useRouter } from 'next/navigation';
import trash from "../../../../public/assets/deleteIcon.svg";
import Image from "next/image";

function SchemasFlow() {
    const { account, isConnected } = useAccount();
    const [addressResolver, setAddressResolver] = useState("");
    const [argumentsList, setArgumentsList] = useState([{ value: "", type: "felt252" }]);
    const [argumentError, setArgumentError] = useState("");
    const [userResponse, setUserResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [resolverAddressError, setResolverAddressError] = useState("");
    const router = useRouter();

    // const DEFAULT_RESOLVER_ADDRESS = "0x0000000000000000000000000000000000000000000000000000";

    const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const newArgumentsList = [...argumentsList];
        newArgumentsList[index].value = event.target.value;
        setArgumentsList(newArgumentsList);
    };

    const handleTypeChange = (index: number, event: React.ChangeEvent<HTMLSelectElement>) => {
        const newArgumentsList = [...argumentsList];
        newArgumentsList[index].type = event.target.value;
        setArgumentsList(newArgumentsList);
    };

    const handleAddArgument = async () => {
        try {
            if (!isConnected || !account) {
                toast.error("Connect wallet to continue");
                return;
            }
            if (argumentsList[argumentsList.length - 1].value === "") {
                setArgumentError(
                    "Input an argument value in the previous field before adding another!"
                );
                return;
            }
            setArgumentsList([...argumentsList, { value: "", type: "felt252" }]);
            setArgumentError("");
        } catch (error) {
            console.error("Error while adding schema fields", error);
        }
    };

    const handleDeleteArgument = (index: number) => {
        if (argumentsList.length === 1) {
            setArgumentError("At least one schema field is required.");
            return;
        }
        const newArgumentsList = [...argumentsList];
        newArgumentsList.splice(index, 1);
        setArgumentsList(newArgumentsList);
        setArgumentError("");
    };

    const apiKey = process.env.NEXT_PUBLIC_API_KEY!;
    const provider = useMemo(() => new RpcProvider({ nodeUrl: `https://starknet-sepolia.infura.io/v3/${apiKey}`}), []);
    const contract = useMemo(() => new Contract(SchemRegistryAbi, SCHEMA_REGISTRY, provider), [provider]);

    const validateAddressResolver = (address: string) => {
        try {
            const parsedAddress = validateAndParseAddress(address);
            const checksumAddress = getChecksumAddress(parsedAddress);
            if (validateChecksumAddress(checksumAddress)) {
                setResolverAddressError("");
                return checksumAddress;
            } else {
                setResolverAddressError("Invalid resolver address checksum");
                return null;
            }
        } catch (error) {
            setResolverAddressError("Invalid resolver address format");
            return null;
        }
    };

    const { writeAsync } = useContractWrite({
        calls: useMemo(() => {
            const validResolverAddress = validateAddressResolver(addressResolver);

            if (!validResolverAddress) {
                toast.error("Invalid resolver address");
                return [];
            }
            if (
                !argumentsList.every((arg) => arg.value) ||
                !validResolverAddress ||
                !userResponse
            )
                return [];
            const formattedArgs = argumentsList
                .map((arg) => `${arg.type} ${arg.value}`)
                .join(", ");
            return contract.populateTransaction["register"]!(
                formattedArgs,
                validResolverAddress,
                userResponse
            );
        }, [contract, argumentsList, addressResolver, userResponse]),
    });

    const handleDeploy = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!userResponse) {
                throw new Error("User response not found");
            }
            if (!isConnected || !account) {
                throw new Error("Connect wallet to continue");
            }
            for (let arg of argumentsList) {
                if (!arg.value) {
                    throw new Error("All argument values must be filled");
                }
            }

            setLoading(true);
            toast.loading("Process Transaction......")
            const transactionResult = await writeAsync();

            if (transactionResult) {
                const txReceipt = await provider.waitForTransaction(transactionResult.transaction_hash);
                const listEvents = txReceipt.events;
                const events = contract.parseEvents(txReceipt);
                toast.dismiss();
                toast.success("Schema Created");
                router.push("/create-schemas")
            } else {
                throw new Error("Transaction failed.");
            }
        } catch (e) {
            console.error("DEPLOYER ERROR", e);
            toast.dismiss();
            toast.error("An error occurred during deployment.");
        } finally {
            setLoading(false);
            setAddressResolver("");
            setArgumentsList([{ value: "", type: "felt252" }]);
            setUserResponse("");
        }
    };

    const disableButton = loading || !isConnected || !account || !argumentsList.every(arg => arg.value) || !userResponse;

    return (
        <div className="flex flex-col items-center font-sans justify-center w-full min-h-screen bg-gradient-to-b from-gray-100 to-blue-300 dark:from-gray-200 dark:to-blue-400 py-12 mt-10 px-4">
            <div className="w-full max-w-4xl mt-6 md:p-2 feature hover:shadow-xl group rounded-lg px-5 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                <div className="flex flex-col items-center pt-10">
                    <h1 className="text-4xl font-bold text-center text-blue-600 dark:text-blue-900 mb-8">
                        Create Schemas
                    </h1>
                    <form onSubmit={handleDeploy} className="w-full max-w-3xl">
                        <div className="mb-8">
                            <div className="flex flex-col gap-y-4 rounded-lg bg-gradient-to-b from-gray-100 to-blue-300 dark:from-gray-200 dark:to-blue-400 py-6 px-4 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                                {argumentsList.map((arg, index) => (
                                    <div key={index} className="flex items-center gap-x-4">
                                        <h4 className="text-2xl font-medium w-1/4 text-blue-600 dark:text-blue-800">
                                            Schema Field : {index + 1}
                                        </h4>
                                        <div className="flex flex-1 items-center">
                                            <input
                                                type="text"
                                                placeholder="Enter Schema Field"
                                                value={arg.value}
                                                className="p-3 rounded-md border border-gray-200 w-full text-black"
                                                onChange={(event) => handleInputChange(index, event)}
                                            />
                                            <select
                                                value={arg.type}
                                                onChange={(event) => handleTypeChange(index, event)}
                                                className="p-3 rounded-md border border-gray-200 w-1/3 text-black ml-4 "
                                            >
                                                <option value="felt252">felt252</option>
                                                <option value="ContractAddress">ContractAddress</option>
                                                <option value="u256">u256</option>
                                                <option value="i256">i256</option>
                                                <option value="bool">bool</option>
                                            </select>
                                            {argumentsList.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteArgument(index)}
                                                    className="ml-4"
                                                    name="sierra"
                                                >
                                                    <Image src={trash} alt="trash icon" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {argumentError && (
                                    <h6 className="text-red-600 text-sm mt-2">{argumentError}</h6>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleAddArgument}
                                disabled={argumentsList[argumentsList.length - 1].value === ""}
                                className="mt-6 bg-blue-600 py-3 px-6 rounded disabled:dark:text-gray-600 dark:text-white disabled:bg-gray-100 hover:bg-blue-700  disabled:cursor-not-allowed shadow-2xl bg-opacity-80 dark:bg-opacity-80"
                            >
                                Add Schema Field
                            </button>
                        </div>
                        <div className="flex flex-row items-center mb-6">
                            <h1 className="text-2xl font-bold mb-6 w-1/2 text-blue-600 dark:text-blue-900">Resolver Address</h1>
                            <input
                                type="text"
                                className="mb-6 p-3 rounded border border-gray-200 w-full text-black"
                                placeholder="Enter Resolver Address"
                                onChange={(e) => setAddressResolver(e.target.value)}
                                value={addressResolver}
                            />
                        </div>
                        <div className="flex items-center mb-6">
                            <p className="text-2xl font-bold mr-4 w-1/4 text-blue-600 dark:text-blue-900">Is Recoverable</p>
                            <div className="flex">
                                <button
                                    type="button"
                                    onClick={() => setUserResponse(userResponse === "true" ? "" : "true")}
                                    disabled={userResponse === "true"}
                                    className={`relative rounded-full w-12 h-12 flex items-center justify-center border-2 border-transparent focus:outline-none transition-colors duration-300 ${userResponse === "true" ? "bg-green-700 text-white" : "bg-gray-100 hover:bg-green-600 hover:text-white"}`}
                                >
                                    <span className="text-lg">Yes</span>
                                    {userResponse === "true" && (
                                        <span className="absolute top-0 right-0 bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center transform translate-x-1 -translate-y-1">✓</span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUserResponse(userResponse === "false" ? "" : "false")}
                                    disabled={userResponse === "false"}
                                    className={`relative rounded-full w-12 h-12 flex items-center justify-center border-2 border-transparent focus:outline-none ml-2 transition-colors duration-300 ${userResponse === "false" ? "bg-red-700 text-white" : "bg-gray-100 hover:bg-red-600 hover:text-white"}`}
                                >
                                    <span className="text-lg">No</span>
                                    {userResponse === "false" && (
                                        <span className="absolute top-0 right-0 bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center transform translate-x-1 -translate-y-1">✓</span>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="flex p-10 flex-row gap-2 justify-center">
                            <button
                                type="submit"
                                disabled={disableButton}
                                className="bg-blue-600 py-3 px-6 rounded disabled:dark:text-gray-600 dark:text-white hover:bg-blue-700 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-2xl bg-opacity-80 dark:bg-opacity-80"
                            >
                                Create Schema
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                className="bg-blue-600 py-3 px-6 rounded  text-white hover:bg-blue-700 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-2xl bg-opacity-80 dark:bg-opacity-80"
                                onClick={() => router.push("/create-schemas")}
                            >
                                View Schemas
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SchemasFlow;
