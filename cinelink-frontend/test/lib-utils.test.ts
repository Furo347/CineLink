import { getApiErrorMessage } from "@/lib/api-error";
import { getAvatarSrc } from "@/lib/avatar";
import { decodeToken, getJwtEmail, getJwtName, getJwtUserId } from "@/lib/jwt";

function makeToken(payload: Record<string, unknown>) {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `header.${encoded}.signature`;
}

describe("jwt helpers", () => {
  it("decodes valid JWT payloads and reads user claims by priority", () => {
    const decoded = decodeToken(makeToken({ userId: "user-1", email: "a@mail.com", name: "Alice" }));

    expect(decoded).toEqual({ userId: "user-1", email: "a@mail.com", name: "Alice" });
    expect(getJwtUserId(decoded)).toBe("user-1");
    expect(getJwtEmail(decoded)).toBe("a@mail.com");
    expect(getJwtName(decoded)).toBe("Alice");
  });

  it("falls back across supported id claims", () => {
    expect(getJwtUserId({ id: "id-claim", userId: "user-claim" })).toBe("id-claim");
    expect(getJwtUserId({ _id: "mongo-id" })).toBe("mongo-id");
    expect(getJwtUserId({ sub: "subject-id" })).toBe("subject-id");
  });

  it("returns null for invalid, empty or unusable tokens", () => {
    expect(decodeToken("not-a-token")).toBeNull();
    expect(decodeToken("header.invalid-base64.signature")).toBeNull();
    expect(getJwtUserId(null)).toBeNull();
    expect(getJwtUserId({ id: "   ", userId: 123 })).toBeNull();
    expect(getJwtEmail({ email: "   " })).toBeNull();
    expect(getJwtName({ name: 42 })).toBeNull();
  });
});

describe("api error helper", () => {
  it("prefers API message over validation errors and fallback", () => {
    expect(
      getApiErrorMessage(
        { response: { data: { message: "Message serveur", errors: [{ msg: "Validation" }] } } },
        "Fallback",
      ),
    ).toBe("Message serveur");
  });

  it("uses validation msg, validation message, then fallback", () => {
    expect(
      getApiErrorMessage({ response: { data: { errors: [{ msg: "Champ invalide" }] } } }, "Fallback"),
    ).toBe("Champ invalide");

    expect(
      getApiErrorMessage({ response: { data: { errors: [{ message: "Erreur détaillée" }] } } }, "Fallback"),
    ).toBe("Erreur détaillée");

    expect(getApiErrorMessage(new Error("network"), "Fallback")).toBe("Fallback");
  });
});

describe("avatar helper", () => {
  it("normalizes supported avatar values", () => {
    expect(getAvatarSrc("https://cdn.test/avatar.jpg")).toBe("https://cdn.test/avatar.jpg");
    expect(getAvatarSrc("/avatars/custom.jpg")).toBe("/avatars/custom.jpg");
    expect(getAvatarSrc("avatars/avatar1.jpg")).toBe("/avatars/avatar1.jpg");
    expect(getAvatarSrc("avatar2")).toBe("/avatars/avatar2.jpg");
    expect(getAvatarSrc("avatar3.jpg")).toBe("/avatars/avatar3.jpg");
  });

  it("returns null for absent, blank or unknown avatars", () => {
    expect(getAvatarSrc()).toBeNull();
    expect(getAvatarSrc("   ")).toBeNull();
    expect(getAvatarSrc("unknown")).toBeNull();
  });
});
