"use client";
import { useEffect, useState } from "react";
import { SAS } from "@/app/utils/constant";
import AttestationAbi from "@/app/abi/attestation.abi.json";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { FiCopy } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAccount, useContractRead } from "@starknet-react/core";

interface Attestation {
    uid: string;
    from: string;
    to: string;
    type: string;
    age: number;
}

function AttestationsTable() {
    const { account, isConnected } = useAccount();
    const [attestation, setSAttestation] = useState<Attestation[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const router = useRouter();

    const {
        data: allAttestationData,
        isLoading: allAttestationLoading,
        error: allAttestationError,
        refetch: refetchAllAttestation
    } = useContractRead({
        address: SAS,
        abi: AttestationAbi,
        functionName: "getAllAttestations",
        watch: false,
    });

    const fetchAttestations = async () => {
        try {
            setLoading(true);
            const result = await refetchAllAttestation();

            if (result && result.data) {
                const parsedData: any = result.data;
                console.log("parsedData: ", parsedData);

                const attestationData: Attestation[] = parsedData.map((item: any, index: number) => ({
                    uid: `0x${item.uid.toString(16)}`,
                    from: `0x${item.attester.toString(16)}`,
                    to: `0x${item.recipient.toString(16)}`,
                    type: "onchain",
                    age: item.time.toString()
                })
                );
                setSAttestation(attestationData);
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            toast.error("Failed to fetch attestation details. Please try again.");
            console.error("Error fetching attestation details:", error);
        }
    }

    useEffect(() => {
        if (isConnected) {
            fetchAttestations();
        }
    }, [isConnected, account]);

    const truncateTxHash = (txhash: string) => {
        return `${txhash.slice(0, 6)}...${txhash.slice(-5)}`;
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(attestation.length / itemsPerPage)) {
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
    const currentAttestation = attestation.slice(indexOfFirstItem, indexOfLastItem);

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
                        To view Attestations details, please connect your wallet.
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
                    <p className="mt-4 text-xl font-semibold text-blue-600 dark:text-blue-900">Loading Attestations...</p>
                </div>
            ) : (
                <>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="border-b p-4 text-gray-800 dark:text-gray-600">UID</th>
                                <th className="border-b p-4 text-gray-800 dark:text-gray-600">From</th>
                                <th className="border-b p-4 text-gray-800 dark:text-gray-600">To</th>
                                <th className="border-b p-4 text-gray-800 dark:text-gray-600">Type</th>
                                <th className="border-b p-4 text-gray-800 dark:text-gray-600">Age</th>
                                <th className="border-b p-4 text-gray-800 dark:text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAttestation.map((attestations) => (
                                <tr key={attestations.uid}>
                                    <td className="border-b p-4 text-gray-800 dark:text-gray-600 flex items-center">
                                        {truncateTxHash(attestations.uid)}
                                        <FiCopy
                                            className="ml-2 text-blue-600 cursor-pointer"
                                            onClick={() => handleCopy(attestations.uid)}
                                        />
                                    </td>
                                    <td className="border-b p-4 text-gray-800 dark:text-gray-600">{truncateTxHash(attestations.from)}</td>
                                    <td className="border-b p-4 text-gray-800 dark:text-gray-600">{truncateTxHash(attestations.to)}</td>
                                    <td className="border-b p-4 text-gray-800 dark:text-gray-600">{attestations.type}</td>
                                    <td className="border-b p-4 text-gray-800 dark:text-gray-600">{attestations.age}</td>
                                    <td className="border-b p-4 text-gray-800 dark:text-gray-600">
                                        <Link href="/attestations-view" legacyBehavior>
                                            <a className="text-blue-600 hover:underline">View Attestation</a>
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
                            disabled={currentPage === Math.ceil(attestation.length / itemsPerPage)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default AttestationsTable;
