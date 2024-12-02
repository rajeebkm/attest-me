import { useEffect, useMemo, useState } from "react";
import { Contract, RpcProvider } from "starknet"; 
import { useAccount, useContractRead } from "@starknet-react/core";
import { SCHEMA_REGISTRY, SAS } from "@/app/utils/constant";
import SchemRegistryAbi from "@/app/abi/schemaRegistry.abi.json";
import AttestationAbi from "@/app/abi/attestation.abi.json";
import Link from "next/link";
import { FiCopy } from "react-icons/fi";
import { toast } from 'react-hot-toast';

interface Schema {
    uid: string;
    revocable: string;
    resolver: string;
    attestations: number;
}

function SchemasTable() {
    const { account, isConnected } = useAccount();
    const [schemas, setSchemas] = useState<Schema[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const apiKey = process.env.NEXT_PUBLIC_API_KEY!;
    const provider = useMemo(() => new RpcProvider({ nodeUrl: `https://starknet-sepolia.infura.io/v3/${apiKey}` }), []);
    const attestationContract = useMemo(() => new Contract(AttestationAbi, SAS, provider), [provider]);
    const schemaRegistryContract = useMemo(() => new Contract(SchemRegistryAbi, SCHEMA_REGISTRY, provider), [provider]);

    const fetchSchemas = async () => {
        try {
            setLoading(true);
            const resultSchemaData = await schemaRegistryContract.get_all_schemas_records();
    
            if (resultSchemaData) {
                const parsedData: any[] = resultSchemaData;
    
                // Fetch attestation count for each schema UID
                const schemasData: Schema[] = await Promise.all(
                    parsedData.map(async (item) => {
                        const uid = `0x${BigInt(item.uid).toString(16)}`;
                        const attestationCount = await attestationContract.getNoOfAttestation(uid);
    
                        return {
                            uid,
                            revocable: item.revocable.toString(),
                            resolver: `0x${BigInt(item.resolver).toString(16)}`,
                            attestations: attestationCount ? parseInt(attestationCount.toString(), 10) : 0,
                        };
                    })
                );
    
                setSchemas(schemasData);
                setLoading(false);
            } else {
                throw new Error("Failed to fetch schema records");
            }
        } catch (error) {
            setLoading(false);
            toast.error("Failed to fetch schema details. Please try again.");
            console.error("Error fetching schema details:", error);
        }
    };

    useEffect(() => {
        if (isConnected) {
            fetchSchemas();
        }
    }, [isConnected, account]);

    const truncateTxHash = (txhash: string) => {
        return `${txhash.slice(0, 6)}...${txhash.slice(-5)}`;
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(schemas.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success("Copied to clipboard!");
        }).catch(() => {
            toast.error("Failed to copy!");
        });
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSchemas = schemas.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="flex flex-col font-sans w-full max-w-6xl rounded-lg mt-6 p-4 px-5 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
            {!isConnected ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                    <svg
                        className="w-16 h-16 text-blue-600 dark:text-blue-900 animate-bounce"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h11M9 21V3m5 5l7 7m-7 0l7-7"
                        />
                    </svg>
                    <p className="mt-4 text-2xl font-semibold text-blue-600 dark:text-blue-900">
                        Connect Your Wallet
                    </p>
                    <p className="text-lg text-gray-600 dark:text-gray-600 mt-2">
                        To view Schema details, Please connect your wallet.
                    </p>
                </div>
            ) : loading ? (
                <div className="flex justify-center items-center py-10">
                    <svg
                        className="w-16 h-16 text-blue-600 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h11M9 21V3m5 5l7 7m-7 0l7-7"
                        />
                    </svg>
                    <p className="mt-4 text-xl font-semibold text-blue-600 dark:text-blue-900">Loading Schemas...</p>
                </div>
            ) : (
                <>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="border-b p-4 text-gray-800 dark:text-gray-600">UID</th>
                                <th className="border-b p-4 text-gray-800 dark:text-gray-600">Resolver</th>
                                <th className="border-b p-4 text-gray-800 dark:text-gray-600">Revocable</th>
                                <th className="border-b p-4 text-gray-800 dark:text-gray-600">Attestations</th>
                                <th className="border-b p-4 text-gray-800 dark:text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSchemas.map((schema) => (
                                <tr key={schema.uid}>
                                    <td className="border-b p-4 text-gray-800 dark:text-gray-600 flex items-center">
                                        {truncateTxHash(schema.uid)}
                                        <FiCopy
                                            className="ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
                                            onClick={() => handleCopy(schema.uid)}
                                        />
                                    </td>

                                    <td className="border-b p-4 text-gray-800 dark:text-gray-600">{truncateTxHash(schema.resolver)}</td>
                                    <td className="border-b p-4 text-gray-800 dark:text-gray-600">{schema.revocable}</td>
                                    <td className="border-b p-4 text-gray-800 dark:text-gray-600">{schema.attestations}</td>
                                    <td className="border-b p-4 text-gray-800 dark:text-gray-600">
                                        <Link href='/schemas-view' legacyBehavior>
                                            <a className="text-blue-600 hover:underline">View Schema</a>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-between mt-4">
                        <button
                            type="button"
                            className="bg-blue-600 py-2 px-4 rounded disabled:text-gray-600 text-white hover:bg-blue-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            className="bg-blue-600 py-2 px-4 rounded disabled:text-gray-600 text-white hover:bg-blue-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            onClick={handleNextPage}
                            disabled={currentPage === Math.ceil(schemas.length / itemsPerPage)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default SchemasTable;
