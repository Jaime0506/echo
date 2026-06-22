import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn", () => {
  it("merges Tailwind classes, with later classes overriding earlier ones", () => {
    const result = cn("px-4 py-2", "px-6");
    expect(result).toBe("py-2 px-6");
  });

  it("handles conditional class expressions including arrays, objects, and falsy values", () => {
    const result = cn(
      "base-class",
      false && "hidden",
      undefined,
      null,
      ["extra-class", "another-class"],
      { "conditional-true": true, "conditional-false": false },
    );
    expect(result).toContain("base-class");
    expect(result).toContain("extra-class");
    expect(result).toContain("another-class");
    expect(result).toContain("conditional-true");
    expect(result).not.toContain("conditional-false");
    expect(result).not.toContain("hidden");
  });

  it("returns an empty string when no valid classes are provided", () => {
    const result = cn(false, undefined, null, "");
    expect(result).toBe("");
  });
});
