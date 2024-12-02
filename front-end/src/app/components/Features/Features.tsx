"use client";
import CreateSchemas from "./CreateSchema";
import ViewSchemas from "./ViewSchems";
import MakeAttestations from "./MakeAttestations"
import ViewAttestations from "./ViewAttestations";

import { useEffect } from "react";

const Features = () => {
  useEffect(() => {
    const options = {
      rootMargin: "0px",
      threshold: 0.2,
    };
    const targets = document.querySelectorAll(".feature");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const rightChild = entry.target.querySelector(".feat-img-right");
          rightChild && rightChild.classList.add("in-view");
          const leftChild = entry.target.querySelector(".feat-img-left");
          leftChild && leftChild.classList.add("in-view");
        }
      });
    }, options);
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion:reduce)"
    ).matches;

    if (targets && prefersReducedMotion === false)
      targets.forEach((target) => {
        observer.observe(target);
      });
    return () => {
      if (targets && prefersReducedMotion === false)
        targets.forEach((target) => {
          observer.unobserve(target);
        });
    };
  }, []);

  return (
    <section className="px-6 py-16 md:py-20 md:px-20 flex flex-col gap-12 font-sans items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-gray-100 to-blue-300 dark:from-gray-200 dark:to-blue-400">
      <div className="text-center">
        <h2 className="text-4xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-800 mb-2 drop-shadow-lg">
          Explore Our Features
        </h2>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-600 max-w-3xl mx-auto mb-8">
          Discover the various tools and options we offer to make your experience exceptional. Navigate seamlessly between different features designed to cater to your needs.
        </p>
      </div>

      {/* Individual Feature Sections */}
      <div className="p-6 md:p-2 feature hover:shadow-xl duration-300 ease-in-out transform hover:scale-105 group rounded-lg px-5 py-4 transition-colors hover:bg-gray-100 hover:text-gray-500  dark:hover:bg-gray-200 dark:hover:text-gray-700 group-hover:animate-none shadow-2xl bg-opacity-20 dark:bg-opacity-20">
        <CreateSchemas />
      </div>

      <div className="p-6 md:p-2 feature hover:shadow-xl duration-300 ease-in-out transform hover:scale-105 group rounded-lg px-5 py-4 transition-colors hover:bg-gray-100 hover:text-gray-500  dark:hover:bg-gray-200 dark:hover:text-gray-700 group-hover:animate-none shadow-2xl bg-opacity-20 dark:bg-opacity-20">
        <ViewSchemas />
      </div>

      <div className="p-6 md:p-2 feature hover:shadow-xl duration-300 ease-in-out transform hover:scale-105 group rounded-lg px-5 py-4 transition-colors hover:bg-gray-100 hover:text-gray-500  dark:hover:bg-gray-200 dark:hover:text-gray-700 group-hover:animate-none shadow-2xl bg-opacity-20 dark:bg-opacity-20">
        <MakeAttestations />
      </div>
      <div className="p-6 md:p-2 feature hover:shadow-xl duration-300 ease-in-out transform hover:scale-105 group rounded-lg px-5 py-4 transition-colors hover:bg-gray-100 hover:text-gray-500  dark:hover:bg-gray-200 dark:hover:text-gray-700 group-hover:animate-none shadow-2xl bg-opacity-20 dark:bg-opacity-20">
        <ViewAttestations />
      </div>
    </section>
  );
};

export default Features;
