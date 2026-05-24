import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { shuffleArray } from "./utils";

describe("shuffleArray", () => {
  const getRandomValuesSpy = vi.spyOn(crypto, "getRandomValues");

  beforeEach(() => {
    vi.clearAllMocks();
    getRandomValuesSpy.mockImplementation((array: Uint32Array) => {
      array.set([2, 1, 0]);
      return array;
    });
  });

  afterEach(() => {
    getRandomValuesSpy.mockRestore();
  });

  it("returns a shuffled copy without mutating the original array", () => {
    const original = [1, 2, 3];

    const shuffled = shuffleArray(original);

    expect(shuffled).toEqual([3, 2, 1]);
    expect(original).toEqual([1, 2, 3]);
    expect(shuffled).not.toBe(original);
  });

  it("returns short arrays as-is", () => {
    const singleItem = [42];

    const shuffled = shuffleArray(singleItem);

    expect(shuffled).toEqual([42]);
    expect(shuffled).not.toBe(singleItem);
  });
});
