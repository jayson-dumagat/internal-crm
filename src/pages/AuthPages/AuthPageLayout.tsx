import React from "react";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-1 min-h-screen bg-white dark:bg-gray-900">
      <div className="relative flex min-h-screen w-full flex-col lg:flex-row">
        <div className="flex min-h-screen w-full flex-1 flex-col px-6 py-8 sm:px-8 lg:w-1/2 lg:px-12 lg:py-10 xl:px-16">
          <div className="mx-auto flex w-full max-w-md justify-center lg:justify-start">
            <div className="mx-auto flex w-full max-w-md justify-center lg:justify-start">
              <Link
                to="/"
                className="inline-flex items-center gap-2.5 sm:gap-3"
              >
                <img
                  className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                  src="/cgsi_logo.png"
                  alt="CGSI Logo"
                />

                <div className="flex w-[158px] flex-col leading-none sm:w-[176px] lg:w-[190px]">
                  <span className="font-['Avenir_Next_LT_Pro','Avenir_Next',Arial,sans-serif] text-base font-semibold tracking-[0.18em] whitespace-nowrap text-[#104862] sm:text-lg sm:tracking-[0.15em] lg:tracking-[0.14em] dark:text-white">
                    CABALLES-GO
                  </span>

                  <span className="my-1 h-[2px] w-full bg-[#104862] dark:bg-white" />

                  <span className="font-['Avenir_Next_LT_Pro','Avenir_Next',Arial,sans-serif] text-xs font-bold tracking-[0.70em] whitespace-nowrap text-[#104862] sm:text-sm sm:tracking-[0.58em] lg:tracking-[0.52em] dark:text-white">
                    SECURITIES
                  </span>
                </div>
              </Link>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center pt-10 lg:pt-0">
            {children}
          </div>
        </div>

        <div className="relative hidden min-h-screen w-full overflow-hidden bg-brand-950 lg:block lg:w-1/2">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="/auth-abstract-bg.avif"
            alt="CGSI Background"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />

          <div className="absolute bottom-12 left-12 z-10 max-w-xl pr-16 xl:bottom-16 xl:left-16">
            <img
              className="mb-6 h-11 w-11 object-contain"
              src="/cgsi_logo.png"
              alt="CGSI Logo"
            />

            <h1 className="mb-5 text-2xl leading-tight font-semibold text-white xl:text-4xl">
              Caballes-Go Securities, Inc. DEX (CDEX)
            </h1>

            <p className="max-w-full text-base leading-7 text-white/75">
              CDEX by Caballes-Go Securities, Inc. is a CRM platform built to boost business efficiency and streamline workflows.
            </p>
          </div>
        </div>

        <div className="fixed right-6 bottom-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
