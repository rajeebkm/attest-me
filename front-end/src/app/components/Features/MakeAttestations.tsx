"use client";
import UpRightArrowIcon from "@/app/svg/UpRightArrowIcon";

const MakeAttestations = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-8 feature">
      <div className="px-2 md:px-8">
        <h2 className="flex font-sans text-blue-600 dark:text-blue-800 items-center text-2xl font-semibold gap-2">
          <span>Make Attestations</span>
          <span>
            <UpRightArrowIcon />
          </span>
        </h2>
        <p className="text-lg text-gray-800 dark:text-gray-800 font-serif opacity-75">
        The Make Attestation feature acts as a bridge between the digital and physical worlds, enabling you to create verifiable and validated claims for various scenarios. It ensures trust and authenticity in a seamless and efficient manner.
        </p>
      </div>
      <div
        className="md:p-4 grid grid-cols-1 grid-rows-1 feat-img-right"
        aria-hidden
      >
        <div className="relative col-start-1 row-start-1 w-100 rounded-[8px] shadow-lg overflow-hidden">
          <img
            src="/make-attestation.png"
            alt="/attestations"
            className="w-full h-full object-cover dark-img"
          />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default MakeAttestations;
