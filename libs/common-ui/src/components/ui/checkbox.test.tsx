import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renders correctly", () => {
    render(<Checkbox data-testid="checkbox" />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("calls onCheckedChange when clicked", () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={onCheckedChange} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("shows check icon when checked", () => {
    const { rerender } = render(<Checkbox checked={false} />);
    // Check icon is hidden by opacity-0
    expect(document.querySelector(".opacity-100")).not.toBeInTheDocument();

    rerender(<Checkbox checked={true} />);
    // Check icon is visible by opacity-100
    expect(document.querySelector(".opacity-100")).toBeInTheDocument();
  });

  it("stops propagation on mouse down", () => {
    const onMouseDown = vi.fn();
    render(
      <div onMouseDown={onMouseDown}>
        <Checkbox />
      </div>,
    );
    const label = document.querySelector("label");
    if (label) {
      fireEvent.mouseDown(label);
    }
    expect(onMouseDown).not.toHaveBeenCalled();
  });
});
