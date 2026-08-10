import PageMeta from "../../../components/common/PageMeta";
import { useLogout } from "../../../hooks/auth/useAuthApi";

export default function Unauthorized() {
  const logoutMutation = useLogout();

  function handleSignOut() {
    logoutMutation.mutate();
  }

  return (
    <>
      <PageMeta
        title="403 - Unauthorized"
        description="You do not have permission to access this page."
      />

      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white px-6 py-12 dark:bg-gray-950">
        <div className="flex w-full max-w-2xl flex-col items-center text-center">
          {/* Header */}
          <h1 className="mb-6 font-bold tracking-tight text-gray-800 text-title-md dark:text-white/90 sm:text-title-lg xl:text-title-2xl">
            UNAUTHORIZED
          </h1>

          {/* Access Denied Illustration */}
          <div className="mb-8 flex w-full justify-center">
            <img
              src="/images/access_denied.svg"
              alt="Access Denied"
              className="h-auto w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[380px]"
            />
          </div>

          {/* Message */}
          <div className="mb-8 max-w-xl">
            <p className="text-base leading-7 text-gray-600 dark:text-gray-400 sm:text-lg">
              Your account is authenticated, but your current permissions do
              not allow you to view this page.
            </p>

            <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-500 sm:text-base">
              If you believe this is a mistake, please contact your
              administrator.
            </p>
          </div>

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={logoutMutation.isPending}
            className="inline-flex min-w-[130px] items-center justify-center rounded-lg px-6 py-3.5 text-sm font-semibold text-white shadow-theme-xs transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#00CC00] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-gray-950"
            style={{
              backgroundColor: "#00CC00",
            }}
          >
            {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
          </button>
        </div>

        {/* Footer */}
        <p className="absolute bottom-6 left-1/2 w-full -translate-x-1/2 px-6 text-center text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
          &copy; {new Date().getFullYear()} - CDEX Caballes-Go Securities,
          Inc. All Rights Reserved.
        </p>
      </div>
    </>
  );
}

