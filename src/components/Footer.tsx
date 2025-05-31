"use client";

import Image from "next/image";

const Footer = () => {
  return (
    <>
      <footer className="flex  justify-between max-w-6xl w-[90%] mx-auto py-10 text-sm font-inter flex-wrap gap-8 max-sm:text-center max-sm:items-center max-sm:justify-center max-sm:flex-col">
        <div className="max-w-[90px] ">
          <Image
            src="/text-logo.svg"
            alt="Ikiform"
            width={100}
            height={100}
            className="pointer-events-none"
          />
        </div>
        <div>
          <p className="text-gray-500 font-medium">
            Star us on{" "}
            <a
              href="https://github.com/preetsuthar17/Ikiform"
              className="underline text-black"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>{" "}
            and follow us on{" "}
            <a
              href="https://x.com/preetsuthar17"
              className="underline text-black"
              target="_blank"
              rel="noopener noreferrer"
            >
              X (Twitter)
            </a>
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
