"use client";
import AddressBar, { UserModal } from "./AddressBar";
import { useEffect, useRef, useState } from "react";
import { useConnect, useAccount } from "@starknet-react/core";
import useTheme from "../hooks/useTheme";
import ThemeSwitch from "./Theme";
import NetworkSwitcher from "./NetworkSwitcher";
import ConnectModal from "./ConnectModal";
import Image from "next/image";

const Header = () => {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const [openConnectModal, setOpenConnectModal] = useState(false);
  const [openConnectedModal, setOpenConnectedModal] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleModal = () => {
    setOpenConnectModal((prev) => !prev);
  };

  const toggleMenu = () => {
    setOpenMenu((prev) => !prev);
  };

  const toggleUserModal = () => {
    setOpenConnectedModal((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    const closeOnEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toggleModal();
      }
    };
    document.body.addEventListener("keydown", closeOnEscapeKey);
    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKey);
    };
  }, []);

  useEffect(() => {
    const lastUsedConnector = localStorage.getItem("lastUsedConnector");
    if (lastUsedConnector) {
      connect({
        connector: connectors.find(
          (connector) => connector.name === lastUsedConnector,
        ),
      });
    }
  }, [connectors]);

  useEffect(() => {
    if (openConnectModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openConnectModal]);

  const { theme, changeTheme } = useTheme();

  return (
    <>
      <header
        ref={dropdownRef}
        className="w-full fixed backdrop-blur-2xl font-sans font-semibold dark:border-neutral-800 lg:bg-gray-200 lg:dark:bg-zinc-800/50 left-0 top-0 z-10 flex flex-wrap gap-2 py-2 px-2 md:py-4 md:px-10 justify-between items-center"
      >
        <span>
          <a href="/">
              <div className="p-1">
                <Image
                  className="border border-transparent"
                  src="/logo.png"
                  alt="starknet logo"
                  width={180}
                  height={180}
                />
              </div>
          </a>
        </span>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-6 items-center">
          <a href="/" className="text-gray-700 text-xl hover:underline hover:text-blue-600 dark:text-gray-200 dark:hover:text-white">
            About
          </a>
          <a href="/create-schemas" className="text-gray-700 text-xl hover:underline hover:text-blue-600 dark:text-gray-200 dark:hover:text-white">
          Schemas
          </a>
          <a href="/make-attestations" className="text-gray-700 text-xl hover:underline hover:text-blue-600 dark:text-gray-200 dark:hover:text-white">
          Attestations
          </a>
          <a href="/" className="text-gray-700 text-xl hover:underline hover:text-blue-600 dark:text-gray-200 dark:hover:text-white">
            Learn
          </a>
          <a href="https://x.com/stark_attestme" className="text-gray-700 text-xl hover:underline hover:text-blue-600 dark:text-gray-200 dark:hover:text-white">
            Engage
          </a>

          {/* Wallet Connection */}
          {address ? (
            <div className="flex justify-end">
              <AddressBar setOpenConnectedModal={setOpenConnectedModal} />
            </div>
          ) : (
            <button
              onClick={toggleModal}
              className="bg-blue-600 hover:bg-blue-800 text-white text-bold py-2 px-4 rounded-full transition duration-300"
            >
              Connect Wallet
            </button>
          )}
          <NetworkSwitcher />

          <ThemeSwitch
            className="flex md:hidden lg:hidden sm:hidden dark:transform-none transform dark:translate-none transition-all duration-500 ease-in-out"
            action={changeTheme}
            theme={theme}
            openMenu={openMenu}
          />
        </div>

        {/* Mobile Menu Toggle and Menu */}
        <div className="flex items-center md:hidden gap-8">
          <ThemeSwitch
            className="flex md:hidden dark:transform-none transform dark:translate-none transition-all duration-500 ease-in-out"
            action={changeTheme}
            theme={theme}
            openMenu={openMenu}
          />

          <button
            title="toggle menu"
            onClick={toggleMenu}
            className="flex flex-col gap-2 md:hidden"
          >
            <div
              className={`w-[1.5em] h-[2px] ${theme === "dark" ? "bg-[#ffffff]" : "bg-[#000000]"
                } rounded-full transition-all duration-300 ease-in-out ${openMenu
                  ? "rotate-45 translate-y-[0.625em]"
                  : "rotate-0 translate-y-0"
                }`}
            ></div>
            <div
              className={`w-[1.5em] h-[2px] ${theme === "dark" ? "bg-[#ffffff]" : "bg-[#000000]"
                } rounded-full transition-all duration-300 ease-in-out ${openMenu ? "opacity-0" : "opacity-100"
                }`}
            ></div>
            <div
              className={`w-[1.5em] h-[2px] ${theme === "dark" ? "bg-[#ffffff]" : "bg-[#000000]"
                } rounded-full transition-all duration-300 ease-in-out ${openMenu
                  ? "-rotate-45 translate-y-[-0.625em]"
                  : "rotate-0 translate-y-0"
                }`}
            ></div>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`w-screen transition-all duration-300 ease-in-out grid ${openMenu
            ? "min-h-[4rem] grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
            } md:hidden`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-4 p-4">
              <a href="/" className="text-gray-700 text-xl hover:underline hover:text-blue-600 dark:text-gray-300 dark:hover:text-white">
                About
              </a>
              <a href="/create-schemas" className="text-gray-700 text-xl hover:underline hover:text-blue-600 dark:text-gray-300 dark:hover:text-white">
                Schemas
              </a>
              <a href="/make-attestations" className="text-gray-700 text-xl hover:underline hover:text-blue-600 dark:text-gray-300 dark:hover:text-white">
                Attestations
              </a>
              <a href="/" className="text-gray-700 text-xl hover:underline hover:text-blue-600 dark:text-gray-300 dark:hover:text-white">
                Learn
              </a>
              <a href="https://x.com/stark_attestme" className="text-gray-700 text-xl hover:underline hover:text-blue-600 dark:text-gray-300 dark:hover:text-white">
                Engage
              </a>
             

              {/* Wallet Connection for Mobile */}
              {address ? (
                <div className="flex justify-end">
                  <AddressBar setOpenConnectedModal={setOpenConnectedModal} />
                </div>
              ) : (
                <button
                  onClick={toggleModal}
                  className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded-full transition duration-300"
                >
                  Connect Wallet
                </button>
              )}
              <NetworkSwitcher />
            </div>
          </div>
        </div>
      </header>

      <ConnectModal isOpen={openConnectModal} onClose={toggleModal} />

      <UserModal
        openConnectedModal={openConnectedModal}
        closeConnectedModal={toggleUserModal}
        address={address ? address : ""}
      />
    </>
  );
};

export default Header;
