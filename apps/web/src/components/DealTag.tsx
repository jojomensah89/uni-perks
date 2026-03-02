interface DealTagProps {
    label: string;
    variant?: "default" | "light";
}

const DealTag = ({ label, variant = "default" }: DealTagProps) => {
    return (
        <span
            className={`rounded-full px-3 py-1 text-[0.7rem] font-medium uppercase ${variant === "light"
                    ? "border border-primary-foreground/40 text-primary-foreground bg-primary-foreground/10 backdrop-blur-sm"
                    : "bg-muted text-foreground"
                }`}
        >
            {label}
        </span>
    );
};

export default DealTag;
