"use client";

import { useRouter } from "next/navigation";
import { ChevronsRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";

interface SectionWrapperProps {
  title: string;
  seeAllUrl: string;
  children: React.ReactNode;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  title,
  seeAllUrl,
  children,
}) => {
  const router = useRouter();

  return (
    <section className="font-mono mb-20">
      <div className="flex justify-between items-end gap-4 mb-5 italic">
        <div className="flex items-center gap-x-3">
          <h2 className="text-2xl tracking-wider">{title}</h2>
          <div className="h-1.5 w-20 bg-[#C02628] transform -skew-x-12"></div>
        </div>

        <Link
          className="text-sm hidden sm:flex items-center gap-x-1"
          href={seeAllUrl}
        >
          <span className="hover:text-gray-600">Lihat Semua</span>
          <ChevronsRightIcon
            size={18}
            strokeWidth={2.4}
            className="text-accent"
          />
        </Link>
      </div>

      <div className="sm:px-4 mb-10">{children}</div>

      <div className="flex justify-center">
        <Button
          onClick={() => {
            router.push(seeAllUrl);
          }}
          className="sm:text-lg italic tracking-wider"
        >
          Lihat Semua
        </Button>
      </div>
    </section>
  );
};

export default SectionWrapper;
