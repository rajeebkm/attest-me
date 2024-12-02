"use client";
import toast from "react-hot-toast";
import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Contract, RpcProvider } from "starknet";
import { useAccount, useContractRead } from "@starknet-react/core";
import { SCHEMA_REGISTRY, SAS } from "@/app/utils/constant";
import SchemRegistryAbi from "@/app/abi/schemaRegistry.abi.json";
import AttestationAbi from "@/app/abi/attestation.abi.json";
import SchemasTable from "../CreateSchemas/SchemasTable";

interface AttestationCount {
  onchain: number;
}

interface SchemaData {
  schemaId: string;
  resolverContract: string;
  revocable: string;
  attestationCount: AttestationCount;
  rawSchema: string;
}

function SchemasView() {
  const { account, isConnected } = useAccount();
  const [schemaUID, setSchemaUID] = useState("");
  const [schemaData, setSchemaData] = useState<SchemaData | null>(null);
  const [loading, setLoading] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_API_KEY!;
  const provider = useMemo(
    () =>
      new RpcProvider({
        nodeUrl: `https://starknet-sepolia.infura.io/v3/${apiKey}`,
      }),
    []
  );
  const attestationContract = useMemo(
    () => new Contract(AttestationAbi, SAS, provider),
    [provider]
  );
  const schemaRegistryContract = useMemo(
    () => new Contract(SchemRegistryAbi, SCHEMA_REGISTRY, provider),
    [provider]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSchemaUID(event.target.value);
  };

  const fetchSchemaDetails = async () => {
    setLoading(true);
    try {
      if (!isConnected || !account) {
        toast.error("Connect wallet to continue");
        setLoading(false);
        return;
      }

      const resultSchemaData =
        await schemaRegistryContract.get_schema(schemaUID);
      console.log("resultSchemaData", resultSchemaData);
      const attestationCountResult =
        await attestationContract.getNoOfAttestation(schemaUID);
      console.log("attestationCountResult: ", attestationCountResult);

      if (resultSchemaData) {
        console.log("1");
        const parsedData: any = resultSchemaData;
        if (parsedData[0].uid != "") {
          console.log("1");
          const schemaId = `0x${parsedData[0].uid.toString(16)}`;
          const resolverContract = `0x${parsedData[0]?.resolver.toString(16)}`;
          const revocable = parsedData[0]?.revocable.toString();
          const rawSchema = parsedData[1].toString();
          const attestationCount = attestationCountResult
            ? parseInt(attestationCountResult.toString(), 10)
            : 0;
          const mockData: SchemaData = {
            schemaId,
            resolverContract,
            revocable,
            attestationCount: {
              onchain: attestationCount,
            },
            rawSchema,
          };

          setSchemaData(mockData);
        } else {
          toast.error("Invalid Schema UID");
          setSchemaData(null);
        }
      } else {
        toast.error("Failed to fetch schema details. Please try again.");
        console.error("Error fetching schema details:", resultSchemaData);
        setSchemaData(null);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to fetch schema details. Please try again.");
      console.error("Error fetching schema details:", error);
    }
  };

  return (
    <div className="flex flex-col items-center font-sans justify-center w-full min-h-screen bg-gradient-to-b from-gray-100 to-blue-300 dark:from-gray-200 dark:to-blue-400 py-12 mt-10 px-4">
      <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 mb-6 p-8 pb-10 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
        <h1 className="text-4xl font-bold text-center text-blue-600 dark:text-blue-900 mb-8">
          View Schemas
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-10">
          <label
            htmlFor="schemaUID"
            className="text-2xl font-bold text-blue-600 dark:text-blue-900 text-left md:text-right"
          >
            Schema UID
          </label>
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-1 w-full">
            <input
              type="text"
              id="schemaUID"
              value={schemaUID}
              onChange={handleInputChange}
              placeholder="Enter Schema UID"
              className="flex-1 p-2 rounded-lg border border-gray-300 shadow-sm w-full sm:w-auto text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchSchemaDetails}
              disabled={loading || !schemaUID}
              className={`py-2 px-2 rounded-lg font-semibold transition-all duration-300 ease-in-out transform shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                loading || !schemaUID
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-100"
              }`}
            >
              {loading ? "Fetching..." : "View Schema"}
            </button>
          </div>
        </div>

        {loading && (
          <p className="mt-4 text-xl  text-center font-semibold text-gray-500 dark:text-gray-600">
            Fetching Schema Details.......
          </p>
        )}
        {!loading && schemaData && isConnected && (
          <>
            <hr className="my-8 border-t-4 border-gray-500 dark:border-gray-700" />
            <div className="flex flex-row gap-4">
              <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-600">
                  Schema UID:
                </h2>
                <p className="text-gray-600 dark:text-gray-500">
                  {schemaData.schemaId}
                </p>
              </div>
              <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-600">
                  Revocable Attestations:
                </h2>
                <p className="text-gray-600 dark:text-gray-500">
                  {schemaData.revocable}
                </p>
              </div>
            </div>

            <div className="flex flex-row gap-4">
              <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-600">
                  Resolver Contract:
                </h2>
                <p className="text-gray-600 dark:text-gray-500">
                  {schemaData.resolverContract}
                </p>
              </div>

              <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-600">
                  Attestation Count:
                </h2>
                <p className="text-gray-600 dark:text-gray-500">
                  Onchain: {schemaData.attestationCount.onchain}
                </p>
              </div>
            </div>

            <div className="flex flex-col w-full max-w-6xl rounded-lg mt-6 p-4 px-10 py-4 transition-colors dark:text-gray-700 dark:hover:text-gray-700 shadow-2xl bg-opacity-20 dark:bg-opacity-20">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-600">
                Raw Schema:
              </h2>
              <p className="text-gray-600 dark:text-gray-500">
                {schemaData.rawSchema}
              </p>
            </div>
          </>
        )}
      </div>

      <SchemasTable />
    </div>
  );
}

export default SchemasView;
