"use client"
import { useRouter } from 'next/navigation';
import AttestationsTable from "./AttestationsTable";

function MakeAttestations() {
    const router = useRouter();
    return (
        <div className="flex flex-col items-center font-sans justify-center w-full min-h-screen bg-gradient-to-b from-gray-100 to-blue-300 dark:from-gray-200 dark:to-blue-400 py-12 px-4">
            <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-5 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-col justify-between items-left mb-1">
                        <h1 className="text-4xl font-bold  text-gray-800 dark:text-blue-800">Attestations</h1>
                        <p className="text-lg text-gray-800  dark:text-gray-600 mb-3">Showing the most recent attestations</p>
                    </div>
                    <button
                        type="button"
                        className="bg-blue-600 py-3 px-6 rounded text-white hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        onClick={() => router.push("/attestations-flow")}
                    >
                        <div className="flex flex-row gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff"><path d="M12 5V19M5 12H19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                            Make Attestation
                        </div>
                    </button>
                </div>
            </div>
            <AttestationsTable />
        </div>
    );
}

export default MakeAttestations;
