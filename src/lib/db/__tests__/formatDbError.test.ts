import { describe, expect, it } from "vitest";
import {
  formatDbError,
  PHONE_ALREADY_REGISTERED_MESSAGE,
} from "@/lib/db/formatDbError";

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

  it("maps duplicate phone constraint to a friendly message", () => {
    expect(
      formatDbError({
        code: "23505",
        message: "duplicate key value violates unique constraint",
        details: "Key (normalize_phone(phone))=(9876543210) already exists.",
      })
    ).toBe(PHONE_ALREADY_REGISTERED_MESSAGE);
  });

  it("maps duplicate phone Error instances to a friendly message", () => {
    const error = new Error(
      'duplicate key value violates unique constraint "idx_profiles_phone_normalized"'
    );
    expect(formatDbError(error)).toBe(PHONE_ALREADY_REGISTERED_MESSAGE);
  });
});
