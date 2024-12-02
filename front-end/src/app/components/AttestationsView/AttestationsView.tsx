"use client";

import React, { useState } from "react";
import { useAccount, useContractRead } from "@starknet-react/core";
import toast from "react-hot-toast";
import RevokeModal from './RevokeModal';
import AttestationsAbi from "@/app/abi/attestation.abi.json";
import { SAS } from "@/app/utils/constant";
import AttestationsTable from "../MakeAttestations/AttestationsTable";

interface DecodedSchema {
    type: string;
    name: string;
    value: string;
}

interface AttestationData {
    id: string;
    from: string;
    to: string;
    schemaUID: string;
    created: string;
    expiration: string;
    revoked: string;
    revocable: string;
    attestedData: string
}

function AttestationsView() {
    const { account, isConnected } = useAccount();
    const [attestationUID, setAttestationUID] = useState('');
    const [attestationData, setAttestationData] = useState<AttestationData | null>(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isRawDataExpanded, setIsRawDataExpanded] = useState(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAttestationUID(event.target.value);
    };
    const { data, isLoading, error, refetch } = useContractRead({
        address: SAS,
        abi: AttestationsAbi,
        functionName: "getAttestation",
        args: [attestationUID],
        watch: false,
    });

    const fetchAttestationsDetails = async () => {
        setLoading(true);
        try {
            if (!isConnected || !account) {
                toast.error("Connect your wallet");
                setLoading(false);
                return;
            }

            const result = await refetch();
            if (result && result.data) {
                const parsedData: any = result.data;
                if (parsedData.uid != "") {
                    const mockData: AttestationData = {
                        id: `0x${parsedData.uid.toString(16)}`,
                        schemaUID: `0x${parsedData.schema.toString(16)}`,
                        from: `0x${parsedData.attester.toString(16)}`,
                        to: `0x${parsedData.recipient.toString(16)}`,
                        created: parsedData.time.toString(),
                        expiration: parsedData.expirationTime.toString(),
                        revoked: "No",
                        revocable: parsedData.revocable.toString(),
                        attestedData: parsedData.data.toString(),
                    };
                    setTimeout(() => {
                        setAttestationData(mockData);
                        setLoading(false);
                    }, 1000);
                } else {
                    toast.error("Invalid attestations UID");
                    setAttestationData(null);
                }
            } else {
                toast.error("Failed to fetch attestations details. Please try again.");
                console.error("Error fetching attestations details:", error);
                setAttestationData(null);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error("Failed to fetch attestations details. Please try again.");
            console.error("Error fetching attestations details:", error);
        }
    };

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const handleRevoke = () => {
        toast.success("Attestation revoked successfully!");
        closeModal();
    };

    const toggleRawData = () => {
        setIsRawDataExpanded(!isRawDataExpanded);
    };

    return (
        <div className="flex flex-col items-center font-sans justify-center w-full min-h-screen bg-gradient-to-b from-gray-100 to-blue-300 dark:from-gray-200 dark:to-blue-400 py-12 mt-10 px-4">
            <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 mb-6 p-8 pb-10 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                <h1 className="text-4xl font-bold text-center text-blue-600 dark:text-blue-900 mb-8">View Attestations</h1>

                <div className="flex flex-col md:flex-row items-center gap-10">
                    <label className="text-2xl font-bold text-blue-600 dark:text-blue-900 text-left md:text-right">
                        Attestation UID
                    </label>
                    <div className="flex flex-1 flex-col sm:flex-row items-center gap-1 w-full">
                    <input
                        type="text"
                        id="attestationUID"
                        value={attestationUID}
                        onChange={handleInputChange}
                        className="flex-1 p-2 rounded-lg border border-gray-300 shadow-sm w-full sm:w-auto text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter Attestation UID"
                    />
                    <button
                        onClick={fetchAttestationsDetails}
                        disabled={loading || !attestationUID}
                        className={`py-2 px-3 rounded-lg font-semibold transition-all duration-300 ease-in-out transform shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${loading || !attestationUID
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-100'
                            }`}
                    >
                        {loading ? 'Fetching...' : 'View Attestation'}
                    </button>
                    </div>
                </div>

                {loading && <p className="mt-4 text-xl  text-center font-semibold text-gray-500 dark:text-gray-600">
                    Fetching Attestations Details.......
                </p>}

                {!loading && attestationData && isConnected && (
                    <>
                        <hr className="my-8 border-t-4 border-gray-500 dark:border-gray-700" />
                        <div className="flex flex-row gap-4">
                            <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-600">Attestation UID:</h2>
                                <p className="text-gray-600 dark:text-gray-500">{attestationData.id}</p>
                            </div>

                            <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-600">Created:</h2>
                                <p className="text-gray-600 dark:text-gray-500">{attestationData.created}</p>
                            </div>
                        </div>

                        <div className="flex flex-row gap-4">
                            <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-600">Schema UID:</h2>
                                <p className="text-gray-600 dark:text-gray-500">{attestationData.schemaUID}</p>
                            </div>
                            <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-600">Expiration:</h2>
                                <p className="text-gray-600 dark:text-gray-500">{attestationData.expiration}</p>
                            </div>
                        </div>


                        <div className="flex flex-row gap-4">
                            <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-600">FROM:</h2>
                                <p className="text-gray-600 dark:text-gray-500">{attestationData.from}</p>
                            </div>
                            <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-600">Revoked:</h2>
                                <p className="text-gray-600 dark:text-gray-500">{attestationData.revoked}</p>
                            </div>
                        </div>

                        <div className="flex flex-row gap-4">
                            <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-600">TO:</h2>
                                <p className="text-gray-600 dark:text-gray-500">{attestationData.to}</p>
                            </div>
                            <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-600">Revocable:</h2>
                                <p className="text-gray-600 dark:text-gray-500">{attestationData.revocable}</p>
                            </div>
                        </div>
                       
                        <div className="mb-4 relative flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-600">Attested Schema Data:</h2>
                            <div
                                className={`text-gray-600 dark:text-gray-500 overflow-auto max-h-80 ${isRawDataExpanded ? 'max-h-full' : ''}`}
                                style={{ whiteSpace: "pre-wrap", width: "100%", minWidth: "20rem" }}
                            >
                                {attestationData.attestedData}
                            </div>
                            {!isRawDataExpanded && (
                                <button
                                    onClick={toggleRawData}
                                    className="absolute bottom-0 right-0 mt-2 mr-2 text-blue-600 dark:text-blue-600 hover:underline focus:outline-none"
                                >
                                    Show more
                                </button>
                            )}
                        </div>

                        <div className="justify-center text-center mt-10">
                            <button
                                onClick={openModal}
                                className="bg-blue-600 py-3 px-6 rounded text-white hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                disabled={!isConnected || !account || account.address !== attestationData?.from || attestationData?.revocable !== "true" || attestationData?.revoked !== "No"}
                            >
                                Revoke Attestation

                            </button>
                            
                        </div>
                    </>
                )}
            </div>
            <AttestationsTable />
            <RevokeModal isOpen={showModal} onClose={closeModal} onConfirm={handleRevoke} />
        </div>
    );
}

export default AttestationsView;
