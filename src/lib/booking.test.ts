import { describe, expect, it } from "vitest";
import { bookingTotal, INITIAL_STATUS } from "./booking";

describe("regras de reserva", () => {
  it("total = preço por hora x duração", () => {
    expect(bookingTotal(180, 2)).toBe(360);
    expect(bookingTotal(89.9, 3)).toBe(269.7);
  });
  it("solicitação começa pendente (não é reserva confirmada)", () => {
    expect(INITIAL_STATUS).toBe("pendente");
  });
});
