import { describe, expect, it } from "vitest";
import { formatDbError } from "@/lib/db/formatDbError";

describe("formatDbError", () => {
  it("reads PostgrestError message objects", () => {
    expect(
      formatDbError({
        message: "new row violates row-level security policy",
        code: "42501",
      })
    ).toBe("new row violates row-level security policy");
  });

  it("never returns [object Object]", () => {
    expect(formatDbError({ code: "23505" })).not.toBe("[object Object]");
  });
});
