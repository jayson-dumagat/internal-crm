interface AvatarTextProps {
  name: string;
  colorKey?: string;
  className?: string;
  size?: "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge";
}

const sizeClasses = {
  xsmall: "h-6 w-6",
  small: "h-8 w-8",
  medium: "h-10 w-10",
  large: "h-12 w-12",
  xlarge: "h-14 w-14",
  xxlarge: "h-16 w-16",
};

const AvatarText: React.FC<AvatarTextProps> = ({ name, colorKey, className = "", size = "medium" }) => {
  // Generate initials from name
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate a consistent pastel color based on the name
  const getColorClass = (name: string) => {
    const colors = [
      "bg-brand-100 text-brand-600",
      "bg-pink-100 text-pink-600",
      "bg-cyan-100 text-cyan-600",
      "bg-orange-100 text-orange-600",
      "bg-green-100 text-green-600",
      "bg-purple-100 text-purple-600",
      "bg-yellow-100 text-yellow-600",
      "bg-error-100 text-error-600",
    ];

    const index = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div
      className={`flex ${sizeClasses[size]} ${className} items-center justify-center rounded-full ${getColorClass(
        colorKey ?? name
      )}`}
    >
      <span className="text-sm font-medium">{initials}</span>
    </div>
  );
};

export default AvatarText;
