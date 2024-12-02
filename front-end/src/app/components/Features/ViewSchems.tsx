"use client";
import UpRightArrowIcon from "@/app/svg/UpRightArrowIcon";
const ViewSchemas = () => {
    return (
        <div className="flex flex-col md:flex-row-reverse md:items-center gap-8 feature">
            <div className="px-2 md:px-8">
                <h2 className="flex font-sans text-blue-600 dark:text-blue-800 items-center gap-2 text-2xl font-semibold">
                    <span>View Schemas</span>
                    <span>
                        <UpRightArrowIcon />
                    </span>
                </h2>
                <p className="text-lg font-sans text-gray-800 dark:text-gray-800 opacity-75">
                The View Schemas feature allows you to effortlessly access and manage all the schemas you have created. It provides a streamlined interface to review, organize, and update your schemas, ensuring consistency and ease of use within your ecosystem.
                </p>
            </div>
            <div className=" md:p-4 grid grid-cols-1 grid-rows-1 feat-img-left" aria-hidden>
                <div className="relative col-start-1 row-start-1 w-100 rounded-[8px] shadow-lg overflow-hidden">
                    <img
                        src="/view-schema.png"
                        alt="/schemas"
                        className="w-full h-full object-cover dark-img"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
            </div>

        </div>
    );
};

export default ViewSchemas;

