import { useState } from "react";
import { Link } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center lg:text-left">
        <h1 className="mb-3 text-title-sm font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
          Sign In
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your email and password to access your account.
        </p>
      </div>

      <form>
        <div className="space-y-5 sm:space-y-6">
          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <Input placeholder="info@gmail.com" />
          </div>

          <div>
            <Label>
              Password <span className="text-error-500">*</span>
            </Label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-row gap-3 justify-between">
            <div className="flex items-center gap-3">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="block text-theme-sm font-normal text-gray-700 dark:text-gray-400">
                Keep me logged in
              </span>
            </div>

            <Link
              to="/reset-password"
              className="text-theme-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Forgot password?
            </Link>
          </div>

          <Button className="w-full" size="sm">
            Sign in
          </Button>
        </div>
      </form>
    </div>
  );
}