"use client";
import Image from "next/image";
import Header from "~/Header";
import Footer from "~/Footer";
import Link from "next/link";
import GithubIcon from "./svg/GithubIcon";
import UpRightArrowIcon from "./svg/UpRightArrowIcon";
import { useAccount } from "@starknet-react/core";
import toast from "react-hot-toast";
import { useEffect } from "react";
import Features from "./components/Features/Features";

const options = [
  { title: "Identity Verifications", description: "Aggregate DID, VC, and offchain identities." },
  { title: "Ticketing", description: "Issue and verify tickets to events." },
  { title: "Trust Networks", description: "Reputation systems & trust scores onchain." },
  { title: "Social Networks", description: "Verified and user-controlled social networks free from bots." },
  { title: "Voting Systems", description: "Voting for local, national, & global communities." },
  { title: "Oracles", description: "Attest to real-world outcomes and offchain information." },
  { title: "Under-collateralized Loans", description: "Credit scores and financial status." },
  { title: "Land Registries", description: "Verified titles & deeds to property." },
  { title: "Signing Documents", description: "Digital notary and signing services." },
  { title: "Proof of Provenance", description: "Know the origination of the goods you buy." },
  { title: "Prediction Markets", description: "Verify the accuracy of data sources and ensure transparency." },
  { title: "Carbon Credits", description: "create an immutable record of carbon credit issuance, transfer, and retirement." },
];

const teamMembers = [
  {
    name: "Rajeeb Kumar Malik",
    role: "Senior Blockchain Engineer",
    description:
      "Core contributor to Starknet protocols and Cairo tooling, with expertise in scaling solutions and decentralized systems.",
    imageSrc: "/rajeeb-image.jpeg",
    borderColor: "border-orange-300",
  },
  {
    name: "Jitendra Kumar",
    role: "Full Stack Blockchain Developer",
    description:
      "Developer in the Starknet ecosystem, specializing in building decentralized applications using Cairo and Starknet.js.",
    imageSrc: "/jitendra-image.jpeg",
    borderColor: "border-cyan-300",
  },
];

export default function Home() {
  const { account, isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected || !account) {
      toast.error("Connect Your Wallet!");
      return;
    }
    if (isConnected && account) {
      toast.success("Wallet Connected!");
      return;
    }

  }, [isConnected]);

  return (
    <main className="">
      <Header />

      <div className="flex min-h-screen flex-col font-sans items-center justify-center py-12 px-4 bg-gradient-to-b from-gray-100 to-blue-300 dark:from-gray-100 dark:to-blue-500">
        <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-6xl gap-16 text-center lg:text-left">
          <div className="flex flex-col gap-6 w-full lg:w-1/2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-800 animate-fadeIn transition duration-700 ease-in-out transform hover:scale-105">
              Welcome to
            </h1>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-pink-400 dark:text-pink-500 animate-bounce transition duration-700 ease-in-out transform hover:scale-105">
              Attest Me
            </h2>
            <p className="text-lg md:text-2xl lg:text-2xl text-gray-600 dark:text-gray-100 animate-fadeInDelay transition duration-700 ease-in-out transform hover:scale-105">
              A simple tool for seamlessly attesting documents to Starknet
              testnet and mainnet
            </p>
            <div className="flex gap-4">
              <Link href="https://github.com/rajeebkm/attest-me" legacyBehavior>
                <a className="flex justify-center items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md font-medium border-2 border-blue-600 shadow-md hover:bg-blue-800 hover:shadow-lg active:bg-blue-800 active:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-700 ease-in-out">
                  <span>Welcome to SAS </span>
                  <span>
                    <GithubIcon />
                  </span>
                </a>
              </Link>
              <Link href="/schemas-table" legacyBehavior>
                <a className="flex justify-center items-center gap-2 px-4 py-2 text-sm bg-white text-black rounded-md font-medium border-2 dark:border-gray-200 shadow-md hover:bg-blue-800 hover:shadow-lg active:bg-white active:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-700 ease-in-out">
                  <span>Start Exploring</span>
                  <span><UpRightArrowIcon /></span>
                </a>
              </Link>
            </div>
          </div>
          <div className="flex w-full lg:w-1/2 justify-center lg:justify-end">
            <Image
              className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] transition duration-700 ease-in-out transform hover:scale-105"
              src="/starknetlogo.png"
              alt="Starknet logo"
              width={600}
              height={150}
              priority
            />
          </div>
        </div>

        <div className="mb-32 grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center lg:text-left lg:max-w-8xl group">
          <a
            href="/create-schemas"
            className="group rounded-lg px-5 py-4 transition-colors hover:bg-gray-100 hover:text-gray-500  dark:hover:bg-gray-200 dark:hover:text-gray-700 group-hover:animate-none shadow-2xl bg-opacity-20 dark:bg-opacity-20"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="flex justify-center items-center gap-2 mb-3 text-2xl font-semibold">Create Schemas{" "} <UpRightArrowIcon /> </h2>
            <p className="text-sm-2 opacity-75">
              Schemas are foundational to the EAS ecosystem. They ensure that
              attestations are consistent, verifiable, and meaningful.{" "}
            </p>
          </a>
          <a
            href="/schemas-view"
            className="group rounded-lg px-5 py-4 transition-colors hover:bg-gray-100 hover:text-gray-500  dark:hover:bg-gray-200 dark:hover:text-gray-700 group-hover:animate-none shadow-2xl bg-opacity-20 dark:bg-opacity-20"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="flex justify-center items-center gap-2 mb-3 text-2xl font-semibold">View Schemas <UpRightArrowIcon /> </h2>
            <p className="text-sm-2 opacity-75">
              View Schemas feature allows you to easily access and manage all the schemas you have created.{" "}
            </p>
          </a>
          <a
            href="/attestations-table"
            className="group rounded-lg px-5 py-4 transition-colors hover:bg-gray-100 hover:text-gray-500  dark:hover:bg-gray-200 dark:hover:text-gray-700 group-hover:animate-none shadow-2xl bg-opacity-20 dark:bg-opacity-20"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="flex justify-center items-center gap-2 mb-3 text-2xl font-semibold">Make Attestations{" "} <UpRightArrowIcon /></h2>
            <p className="text-sm-2 opacity-75">
              Attestations serve as a bridge between the digital and physical
              worlds, providing a mechanism to verify and validate claims in
              various scenarios.{" "}
            </p>
          </a>

          <a
            href="/attestations-view"
            className="group rounded-lg px-5 py-4 transition-colors hover:bg-gray-100 hover:text-gray-500  dark:hover:bg-gray-200 dark:hover:text-gray-700 group-hover:animate-none shadow-2xl bg-opacity-20 dark:bg-opacity-20"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className=" flex justify-center items-center gap-2 mb-3 text-2xl font-semibold">View Attestations{" "} <UpRightArrowIcon /> </h2>
            <p className="text-sm-2 opacity-75">
              View Attestations feature enables you to easily access and manage all the attestations you have issued or received.{" "}
            </p>
          </a>
        </div>

      </div>
      <Features />
      <div className="flex min-h-screen flex-col items-center justify-center font-sans py-12 px-4 bg-gradient-to-b from-gray-100 to-blue-300 dark:from-gray-200 dark:to-blue-400">
   
        <h1 className="text-4xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-800 mb-4 drop-shadow-md text-center">
          What will you build?
        </h1>
        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Get inspired. The opportunities the attestation layer creates are endless.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {options.map((option, index) => (
            <div
              key={index}
              className="p-6 md:p-8 feature hover:shadow-xl duration-300 ease-in-out transform hover:scale-105 group rounded-lg px-5 py-4 transition-colors hover:bg-gray-100 hover:text-gray-500  dark:hover:bg-gray-200 dark:hover:text-gray-700 group-hover:animate-none shadow-2xl bg-opacity-20 dark:bg-opacity-20 items-center justify-center text-center "
            >
              <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-800 mb-3">
                {option.title}
              </h2>
              <p className="text-gray-600">
                {option.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center font-sans py-12 px-4 bg-gradient-to-b from-gray-100 to-blue-300 dark:from-gray-200 dark:to-blue-400">
        <h1 className="text-4xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-800 mb-4 drop-shadow-md text-center">
          Meet Our Starknet Attestation Service Team
        </h1>
        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-600 text-center max-w-2xl mx-auto mb-12">
          We are passionate builders in the Starknet ecosystem, driving innovation with zk-rollups, Cairo smart contracts, and decentralized solutions.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 w-full max-w-6xl justify-center items-center text-center">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="flex flex-col p-6 md:p-15 feature hover:shadow-xl duration-300 ease-in-out transform hover:scale-105 group rounded-lg px-5 py-4 transition-colors hover:bg-gray-100 hover:text-gray-500  dark:hover:bg-gray-200 dark:hover:text-gray-700 group-hover:animate-none shadow-2xl bg-opacity-20 dark:bg-opacity-20 items-center justify-center text-center"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                <Image
                  src={member.imageSrc}
                  alt={member.name}
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-blue-600">{member.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-600 font-medium">{member.role}</p>
              <p className="text-sm text-gray-500 dark:text-gray-600 mt-2">{member.description}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
