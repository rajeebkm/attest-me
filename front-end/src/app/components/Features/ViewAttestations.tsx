"use client";
import UpRightArrowIcon from "@/app/svg/UpRightArrowIcon";
const ViewAttestations = () => {
    return (
        <div className="flex flex-col md:flex-row-reverse md:items-center gap-8 feature">
            <div className="px-2 md:px-8">
                <h2 className="flex font-sans text-blue-600 dark:text-blue-800 items-center gap-2 text-2xl font-semibold">
                    <span>View Attestations</span>
                    <span>
                        <UpRightArrowIcon />
                    </span>
                </h2>
                <p className="text-lg text-gray-800 dark:text-gray-800 font-serif opacity-75">
                The View Attestations feature allows you to effortlessly access and manage all the attestations you have created. It provides a centralized and organized view, enabling you to review, track, and verify attestations with ease, ensuring transparency and reliability in your data management.
                </p>
            </div>
            <div className="md:p-4 grid grid-cols-1 grid-rows-1 feat-img-left" aria-hidden>
                <div className="relative col-start-1 row-start-1 w-90 rounded-[8px] shadow-lg overflow-hidden">
                    <img
                        src="/view-attestation.png"
                        alt="/attestations"
                        className="w-full h-full object-cover dark-img"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
            </div>
        </div>
    );
};

export default ViewAttestations;

