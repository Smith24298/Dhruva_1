import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  to?: string;
  className?: string;
}

export const BackButton = ({ to, className = "" }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/90 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );
};
