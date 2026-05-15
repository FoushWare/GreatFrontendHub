import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ThemeToggle,
  InputGroup,
  TextAreaGroup,
  SelectGroup,
  TabHeader,
} from "./SharedEditorComponents";
import { describe, it, expect, vi } from "vitest";

describe("SharedEditorComponents", () => {
  describe("ThemeToggle", () => {
    it("renders light mode active", () => {
      const setTheme = vi.fn();
      render(<ThemeToggle theme="light" setTheme={setTheme} isDark={false} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);
      fireEvent.click(buttons[1]);
      expect(setTheme).toHaveBeenCalledWith("dark");
    });
  });

  describe("InputGroup", () => {
    it("renders and calls onChange", () => {
      const onChange = vi.fn();
      render(
        <InputGroup
          label="Test Input"
          value="value"
          onChange={onChange}
          isDark={false}
        />,
      );
      const input = screen.getByLabelText("Test Input");
      expect(input).toBeInTheDocument();
      fireEvent.change(input, { target: { value: "new value" } });
      expect(onChange).toHaveBeenCalledWith("new value");
    });
  });

  describe("TextAreaGroup", () => {
    it("renders and calls onChange", () => {
      const onChange = vi.fn();
      render(
        <TextAreaGroup
          label="Test Text"
          value="value"
          onChange={onChange}
          isDark={true}
        />,
      );
      const textarea = screen.getByLabelText("Test Text");
      expect(textarea).toBeInTheDocument();
      fireEvent.change(textarea, { target: { value: "new text" } });
      expect(onChange).toHaveBeenCalledWith("new text");
    });
  });

  describe("SelectGroup", () => {
    it("renders string options and calls onChange", () => {
      const onChange = vi.fn();
      render(
        <SelectGroup
          label="Test Select"
          value="a"
          options={["A", "B"]}
          onChange={onChange}
          isDark={false}
        />,
      );
      const select = screen.getByLabelText("Test Select");
      expect(select).toBeInTheDocument();
      fireEvent.change(select, { target: { value: "b" } });
      expect(onChange).toHaveBeenCalledWith("b");
    });

    it("renders object options", () => {
      const onChange = vi.fn();
      render(
        <SelectGroup
          label="Test Select"
          value="a"
          options={[
            { label: "A", value: "a" },
            { label: "B", value: "b" },
          ]}
          onChange={onChange}
          isDark={false}
        />,
      );
      expect(screen.getByText("A")).toBeInTheDocument();
    });
  });

  describe("TabHeader", () => {
    it("renders tabs and calls onTabChange", () => {
      const onTabChange = vi.fn();
      render(
        <TabHeader
          activeTab="tab1"
          tabs={["tab1", "tab2"]}
          onTabChange={onTabChange}
          isDark={false}
        />,
      );
      const tab2 = screen.getByText("tab2");
      expect(tab2).toBeInTheDocument();
      fireEvent.click(tab2);
      expect(onTabChange).toHaveBeenCalledWith("tab2");
    });
  });
});
