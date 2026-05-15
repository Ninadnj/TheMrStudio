type Props = {
  label: string;
  className?: string;
};

export default function QuietStatus({ label, className = "" }: Props) {
  return (
    <div className={`quiet-status ${className}`}>
      <span className="shimmer-line" aria-hidden />
      <span className="label">{label}</span>
    </div>
  );
}
