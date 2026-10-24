import {
  ARMS,
  BLINK,
  BODY_PATHS,
  GRID,
  POSES,
  TALK,
  pathOf,
  type PoseName,
} from "./sprite";

export type Face = PoseName;

/** A short gesture played on top of the current face. */
export type Act = "wave" | "dance";

const FACES = Object.keys(POSES) as Face[];

const poseParts = FACES.map((face) => ({
  face,
  eyes: pathOf(POSES[face].eyes),
  mouth: pathOf(POSES[face].mouth),
  extra: pathOf(POSES[face].extra ?? []),
}));

const parts = {
  blink: pathOf(BLINK),
  talk: pathOf(TALK),
};

const limbs = (Object.keys(ARMS) as (keyof typeof ARMS)[]).map((name) => ({
  name,
  arm: pathOf(ARMS[name].arm),
  hand: pathOf(ARMS[name].hand),
}));

const PART: Record<keyof typeof ARMS, string> = {
  restLeft: "arm-rest-l",
  restRight: "arm-rest-r",
  upLeft: "arm-up-l",
  upRight: "arm-up-r",
  highRight: "arm-high-r",
};

/**
 * The guide: a small pixel-art cube with a visor face. The face (`data-face`),
 * blink, talk and gestures (`data-act`) are all driven from globals.css by
 * attributes on the parent `.bot`, so React never re-renders to animate it.
 */
export function RobotParts({ label }: { label?: string }) {
  return (
    <span className="bot-parts" aria-hidden="true">
      <svg
        className="bot-sprite"
        viewBox={`0 0 ${GRID} ${GRID}`}
        focusable="false"
      >
        <g data-part="all">
          <path data-part="bulb" className="px-a" d={BODY_PATHS.A} />
          <path className="px-s" d={BODY_PATHS.S} />
          <path className="px-b" d={BODY_PATHS.B} />
          <path className="px-l" d={BODY_PATHS.L} />
          <path className="px-d" d={BODY_PATHS.D} />

          {limbs.map(({ name, arm, hand }) => (
            <g key={name} data-part={PART[name]}>
              <path className="px-s" d={arm} />
              <path className="px-l" d={hand} />
            </g>
          ))}

          {poseParts.map(({ face, eyes, mouth, extra }) => (
            <g key={face} data-pose={face}>
              <path data-part="eyes" className="px-w" d={eyes} />
              <path data-part="mouth" className="px-w" d={mouth} />
              {extra ? (
                <path
                  data-part="extra"
                  className={face === "sleep" ? "px-a" : "px-w"}
                  d={extra}
                />
              ) : null}
            </g>
          ))}

          <path data-part="blink" className="px-w" d={parts.blink} />
          <path data-part="talk" className="px-w" d={parts.talk} />
        </g>
      </svg>
      {label ? <span className="bot-label">{label}</span> : null}
    </span>
  );
}
