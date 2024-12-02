"use client"
import { useMemo, useState } from "react";
import { useAccount, useContractRead, useContractWrite } from "@starknet-react/core";
import toast from "react-hot-toast";
import React from 'react';
import { useRouter } from 'next/navigation';
import { SAS, SCHEMA_REGISTRY } from "@/app/utils/constant";
import SchemRegistryAbi from "@/app/abi/schemaRegistry.abi.json";
import AttestationsAbi from "@/app/abi/attestation.abi.json";
import { Contract, RpcProvider, validateAndParseAddress, getChecksumAddress, validateChecksumAddress } from "starknet";
import AttestationsTable from "../MakeAttestations/AttestationsTable";

interface AttestationData {
  [key: string]: string;
}


function AttestationsFlow() {
  const { account, isConnected } = useAccount();

  const [schemaUID, setSchemaUID] = useState('');
  const [recipientWalletAddress, setRecipientWalletAddress] = useState('');
  const [attestationId, setAttestationId] = useState("");
  const [userResponse, setUserResponse] = useState("");
  const [attestationData, setAttestationData] = useState<AttestationData | null>(null);
  const [schemaAttributes, setSchemaAttributes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipientAddressError, setRecipientAddressError] = useState("");
  const router = useRouter();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSchemaUID(event.target.value);
  };

  const handleRecipientWalletAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientWalletAddress(event.target.value);
    handleAttributeChange('RECIPIENT_WALLET_ADDRESS', event.target.value);
  };

  const handleAttributeChange = (attribute: string, value: string) => {
    if (attestationData) {
      setAttestationData({ ...attestationData, [attribute.toUpperCase()]: value });
    }
  };

  const { data, isLoading, error, refetch } = useContractRead({
    address: SCHEMA_REGISTRY,
    abi: SchemRegistryAbi,
    functionName: "get_schema",
    args: [schemaUID],
    watch: false,
  });

  const fetchSchemaDetails = async () => {
    setLoading(true);

    try {
      if (!isConnected || !account) {
        toast.error("Connect wallet to continue");
        setLoading(false);
        return;
      }

      const result = await refetch();

      if (result && result.data) {
        const parsedData: any = result.data;
        if (parsedData[0].uid !== "") {
          const attributes: string[] = parsedData[1].split(',').map((attr: string) => attr.trim());

          setSchemaAttributes(attributes);

          const mockData: AttestationData = {
            ...Object.fromEntries(attributes.map(attr => [attr.split(' ')[1].toUpperCase(), ""])),
          };

          setTimeout(() => {
            setAttestationData(mockData);
            setLoading(false);
          }, 1000);
        } else {
          toast.error("Invalid Schema UID");
          setAttestationData(null);
        }
      } else {
        toast.error("Failed to fetch schema details. Please try again.");
        console.error("Error fetching schema details:", error);
        setAttestationData(null);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to fetch schema details. Please try again.");
      console.error("Error fetching schema details:", error);
    }
  };

  const apiKey = process.env.NEXT_PUBLIC_API_KEY!;
  const provider = useMemo(() => new RpcProvider({ nodeUrl: `https://starknet-sepolia.infura.io/v3/${apiKey}` }), []);
  const contract = useMemo(() => new Contract(AttestationsAbi, SAS, provider), [provider]);

  const validateAddressResolver = (address: string) => {
    try {
      const parsedAddress = validateAndParseAddress(address);
      const checksumAddress = getChecksumAddress(parsedAddress);
      if (validateChecksumAddress(checksumAddress)) {
        setRecipientAddressError("");
        return checksumAddress;
      } else {
        setRecipientAddressError("Invalid recipient address checksum");
        return null;
      }
    } catch (error) {
      setRecipientAddressError("Invalid recipient address format");
      return null;
    }
  };

  const { writeAsync } = useContractWrite({
    calls: useMemo(() => {
      const validRecipientAddress = validateAddressResolver(recipientWalletAddress);
      if (!validRecipientAddress) {
        toast.error("Invalid resolver address");
        return [];
      }

      const expirationTime = BigInt(attestationData?.EXPIRATION_TIME || "");
      const referencedAttestation = BigInt(attestationData?.REFERENCED_ATTESTATION || "");
      const schemaForAttestation = schemaAttributes
        .map(attr => {
          const [type, name] = attr.split(' ');
          const attributeName = name.toUpperCase();
          return `${type} ${attributeName.toLowerCase()} ${attestationData ? attestationData[attributeName] : ''}`;
        })
        .join(', ');

      const attestationRequestData = {
        recipient: validRecipientAddress,
        expirationTime: expirationTime,
        revocable: userResponse,
        refUID: referencedAttestation,
        data: schemaForAttestation,
        value: "0"
      };

      const attestationRequest = {
        schema: schemaUID,
        data: attestationRequestData
      };

      const attestationRequestFormatted = {
        schema: attestationRequest.schema.toString(),
        data: {
          recipient: attestationRequest.data.recipient,
          expirationTime: attestationRequest.data.expirationTime,
          revocable: attestationRequest.data.revocable ? 1 : 0,
          refUID: attestationRequest.data.refUID.toString(),
          data: attestationRequest.data.data,
          value: attestationRequest.data.value.toString()
        }
      };

      return contract.populateTransaction["attest"]!(
        attestationRequestFormatted
      );
    }, [contract, recipientWalletAddress, attestationData, schemaAttributes, userResponse]),
  });

  const handleMakeAttestations = async () => {
    try {
      if (!isConnected || !account) {
        toast.error("Connect wallet to continue");
        return;
      }

      if (!recipientWalletAddress || !userResponse || !attestationData || Object.values(attestationData).some(val => !val)) {
        toast.error("Check all params");
        return;
      }
      toast.loading("Process Transaction......")
      const transactionResult = await writeAsync();

      if (transactionResult) {
        const txReceipt = await provider.waitForTransaction(transactionResult.transaction_hash);
        const listEvents = txReceipt.events;
        const events = contract.parseEvents(txReceipt);
        toast.dismiss();
        toast.success("Attestation Completed!")
       
        setSchemaUID('');
        setAttestationData(null);
        setRecipientWalletAddress('');
        setUserResponse('');
        router.push("/make-attestations")
      } else {
        throw new Error("Transaction failed.");
      }

    } catch (error) {
      setLoading(false);
      toast.error("Failed to make attestations. Please try again.");
      console.error("Error during attestations:", error);
      toast.dismiss();
    }
  };

  const attestationValues = Object.values(attestationData ?? {}).map(val => val ?? undefined);
  const disableButton = !isConnected || !account || !userResponse || !recipientWalletAddress || attestationValues.some(val => !val);

  return (
    <div className="flex flex-col items-center font-sans justify-center w-full min-h-screen bg-gradient-to-b from-gray-100 to-blue-300 dark:from-gray-200 dark:to-blue-400 py-12 mt-10 px-4">
      <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 mb-6 p-8 pb-10 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
        <h1 className="text-4xl font-bold text-center text-blue-600 dark:text-blue-900 mb-8">Make Attestations</h1>

        <div className="flex flex-col md:flex-row items-center gap-10">
          <label className="text-2xl font-bold text-blue-600 dark:text-blue-900 text-left md:text-right" htmlFor="schemaUID">
            Schema UID
          </label>
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-1 w-full">
            <input
              type="text"
              id="schemaUID"
              value={schemaUID}
              onChange={handleInputChange}
              className="flex-1 p-2 rounded-lg border border-gray-300 shadow-sm w-full sm:w-auto text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Schema UID"
            />

            <button
              onClick={fetchSchemaDetails}
              disabled={loading || !schemaUID}
              className={`py-2 px-2 rounded-lg font-semibold transition-all duration-300 ease-in-out transform shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${loading || !schemaUID
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-100'
                }`}
            >
              {loading ? 'Fetching...' : 'View Schema'}
            </button>
          </div>
        </div>

        {loading && <p className="mt-4 text-xl  text-center font-semibold text-gray-500 dark:text-gray-600">
          Fetching Schema Details.......
        </p>}

        {!loading && attestationData && isConnected && (
          <>
            <hr className="my-8 border-t-4 border-gray-500 dark:border-gray-700" />
           
              <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                <label className="block text-gray-800 dark:text-gray-600 text-xl font-medium mb-2" htmlFor="recipientWalletAddress">
                  RECIPIENT
                </label>
                <input
                  type="text"
                  id="recipientWalletAddress"
                  value={recipientWalletAddress}
                  onChange={handleRecipientWalletAddressChange}
                  className="p-3 rounded-md border border-gray-300 w-full mb-2 text-black"
                  placeholder="Enter Recipient Address"
                />

                {schemaAttributes.map((attribute, index) => {
                  const [type, name] = attribute.split(' ');
                  const attributeName = name.toUpperCase();
                  return (
                   
                    <div key={index}>
                      <label className="block text-gray-800 dark:text-gray-600 text-xl font-medium mb-2" htmlFor={attributeName}>
                        {attributeName} | {type}
                      </label>
                      
                      <input
                        type="text"
                        id={attributeName}
                        value={attestationData[attributeName]}
                        onChange={(e) => handleAttributeChange(attributeName, e.target.value)}
                        className="p-3 rounded-md border border-gray-300 w-full mb-2 text-black"
                        placeholder={`Enter ${attributeName}`}
                      />
                    </div>
                    
                  );
                })}
              </div>
            
            <div className="flex flex-row gap-4">
            <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
              <label className="block text-gray-800 dark:text-gray-600 text-xl font-medium mb-2" htmlFor="expirationTime">
                EXPIRATION TIME
              </label>
              <input
                type="text"
                id="expirationTime"
                value={attestationData?.EXPIRATION_TIME || ""}
                onChange={(e) => handleAttributeChange('EXPIRATION_TIME', e.target.value)}
                className="p-3 rounded-md border border-gray-300 w-full mb-2 text-black"
                placeholder="Enter Expiration Time"
              />
            </div>
            <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
              <label className="block text-gray-800 dark:text-gray-600 text-xl font-medium mb-2" htmlFor="referencedAttestation">
                REFERENCED ATTESTATION
              </label>
              <input
                type="text"
                id="referencedAttestation"
                value={attestationData?.REFERENCED_ATTESTATION || ""}
                onChange={(e) => handleAttributeChange('REFERENCED_ATTESTATION', e.target.value)}
                className="p-3 rounded-md border border-gray-300 w-full mb-2 text-black"
                placeholder="Enter Referenced Attestation"
              />
            </div>
            </div>
            
            <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
              <div className="flex items-center mb-6">
                <p className="text-xl mr-4 w-1/4 text-gray-800 dark:text-gray-600 font-medium">IS REVOCABLE</p>
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

            </div>
            <div className="flex flex-row gap-2 justify-center mt-10">
              <button
                onClick={handleMakeAttestations}
                className="bg-blue-600 py-3 px-6 rounded text-gray-100 disabled:text-gray-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:cursor-not-allowed transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                disabled={disableButton}
              >
                Make Attestations
              </button>
              <button
                type="button"
                className="bg-blue-600 py-3 px-8 rounded text-white hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                onClick={() => router.push("/make-attestations")}
              >
                View Attestations
              </button>
            </div>
          </>
        )}
      </div>
      <AttestationsTable />
    </div>
  );
}

export default AttestationsFlow;
