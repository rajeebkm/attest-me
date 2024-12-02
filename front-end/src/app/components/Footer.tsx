import Link from "next/link";
import { BiChevronRight } from "react-icons/bi";
import Image from "next/image";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaDribbble,
} from "react-icons/fa";

function Footer() {
  return (
    <>
      <div className="flex max-sm:flex-col justify-between items-center p-4 mb-auto font-semibold text-center bg-gradient-to-b from-gray-100 to-blue-300 dark:from-gray-300 dark:to-blue-300">
        <span>
          <a href="/">
            <div className="p-2">
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
        <div className="text-base text-blue-900 px-7">
          © 2024-2025 AttestMe™. All Rights Reserved.
        </div>
        <div className="flex justify-center items-center gap-4">
          <a href="https://x.com/stark_attestme" target="_blank" rel="noreferrer">
            <FaTwitter className="text-xl cursor-pointer text-blue-900 hover:text-blue-500 transition duration-300" />
          </a>
          <a href="https://dribbble.com" target="_blank" rel="noreferrer">
            <FaDribbble className="text-xl cursor-pointer text-blue-900 hover:text-blue-500 transition duration-300" />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <FaFacebook className="text-xl cursor-pointer text-blue-900 hover:text-blue-500 transition duration-300" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <FaInstagram className="text-xl cursor-pointer text-blue-900 hover:text-purple-500 transition duration-300" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">
            <FaLinkedin className="text-xl cursor-pointer text-blue-900 hover:text-blue-500 transition duration-300" />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer">
            <FaYoutube className="text-xl cursor-pointer text-blue-900 hover:text-red-500 transition duration-300" />
          </a>
        </div>
      </div>
    </>
  );
}

export default Footer;
