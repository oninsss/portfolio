export type Face =
  | "name"
  | "sleep"
  | "smile"
  | "happy"
  | "wink"
  | "wow"
  | "think";

export function RobotParts({ label }: { label?: string }) {
  return (
    <span className="bot-parts" aria-hidden="true">
      <i className="bot-antenna" />
      <i className="bot-ear bot-ear-l" />
      <i className="bot-ear bot-ear-r" />
      <span className="bot-visor">
        <span className="bot-eyes">
          <i className="bot-eye" />
          <i className="bot-eye" />
        </span>
        <span className="bot-mouth" />
        {label ? <span className="bot-label">{label}</span> : null}
      </span>
    </span>
  );
}
