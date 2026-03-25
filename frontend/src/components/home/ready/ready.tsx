import React from "react";
import Image from "next/image";
import MainButton from "@/components/ui/mainbtn";

const ReadySection = () => {
  return (
    <section className="w-full bg-white margin-y ">
      <div className="containerpadding container mx-auto flex flex-col items-center text-center gap-4">
        <Image
          src="/images/your-journey/top.png"
          alt=""
          width={70}
          height={70}
          className="object-contain"
        />

        <h2 className="title font-poppins font-medium text-[#010806] leading-tight max-w-4xl">
          Ready to Begin Your{" "}
          <span
            className="relative inline-block text-[#DB9D30] font-aref-ruqaa-ink font-bold"
          >
            Journey<span className="text-[#010806] font-poppins font-medium">?</span>
          </span>
        </h2>

        <p className="font-poppins text-[#0000008A]/55 text-[18px] sm:text-[22px] md:text-[26px] lg:text-[28px] xl:text-[28px] 2xl:text-[30px] leading-relaxed max-w-3xl">
          Join thousands of families who have found meaningful connections
          through our platform
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
          <MainButton
            px="px-7"
            py="py-2.5"
            className="text-[14px] sm:text-base font-poppins"
            type="button"
          >
            Create Profile
          </MainButton>

          <button
            type="button"
            className="border border-[#397466] text-[#397466] font-semibold px-7 py-2.5 rounded-full text-[14px] sm:text-base font-poppins hover:bg-[#397466]/10 transition-all duration-200"
          >
            View All Plans
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReadySection;
