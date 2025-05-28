"use client";

import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="flex justify-between flex-wrap items-center gap-8 max-w-6xl w-[95%] mx-auto py-10 text-sm font-inter max-sm:flex-col max-sm:text-center max-sm:items-center max-sm:justify-center">
      <div className="max-w-[90px]">
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
    </nav>
  );
};

export default Navbar;
