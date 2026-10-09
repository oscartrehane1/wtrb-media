type WordmarkProps = {
  compact?: boolean;
};

export function Wordmark({ compact = false }: WordmarkProps) {
  return (
    <span className="wordmark" aria-label="WtRB Media">
      <span>WtRB</span>
      <span className={compact ? "wordmark__media wordmark__media--compact" : "wordmark__media"}>
        Media
      </span>
    </span>
  );
}
