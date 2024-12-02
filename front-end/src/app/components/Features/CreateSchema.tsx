"use client";
import UpRightArrowIcon from "@/app/svg/UpRightArrowIcon";

const CreateSchema = () => {
    return (
        <div className="flex flex-col md:flex-row md:items-center gap-8 feature">
            <div className="px-2 md:px-8">
                <h2 className="flex font-sans text-blue-600 dark:text-blue-800 items-center text-2xl font-semibold gap-2">
                    <span>Create Schemas</span>
                    <span>
                        <UpRightArrowIcon />
                    </span>
                </h2>
                <p className="text-lg text-gray-800 dark:text-gray-800 font-sans opacity-75">
                Schemas are critical to the EAS ecosystem, serving as blueprints for defining the structure and attributes of attestations. By adhering to schemas, developers can create reliable and standardized attestations that are easy to validate and integrate into various platforms, fostering interoperability and trust within the ecosystem.
                </p>
            </div>
            <div
                className="md:p-4 grid grid-cols-1 grid-rows-1 feat-img-right"
                aria-hidden
            >
                <div className="relative col-start-1 row-start-1 w-100 rounded-[8px] shadow-lg overflow-hidden">
                    <img
                        src="/create-schema.png"
                        alt="/schemas"
                        className="w-full h-full object-cover dark-img"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
            </div>

        </div>
    );
};

export default CreateSchema;
