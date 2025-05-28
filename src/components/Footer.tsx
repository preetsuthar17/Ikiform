"use client";

import Image from "next/image";

const Footer = () => {
  return (
    <>
      <footer className="flex  justify-between max-w-6xl w-[95%] mx-auto py-10 text-sm font-inter flex-wrap gap-8 max-sm:text-center max-sm:items-center max-sm:justify-center max-sm:flex-col">
        <div className="max-w-[90px] ">
          <Image
            src="/text-logo.svg"
            alt="Ikiform"
            width={100}
            height={100}
            className="pointer-events-none"
          />
        </div>
      </footer>
    </>
  );
};

export default Footer;
