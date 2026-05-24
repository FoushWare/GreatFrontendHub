import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AlzatonaLogo } from "./AlzatonaLogo";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const { priority, ...imgProps } =
      props as React.ImgHTMLAttributes<HTMLImageElement> & {
        priority?: boolean;
      };

    return <img alt={imgProps.alt ?? "logo"} {...imgProps} />;
  },
}));

vi.mock("@elzatona/contexts", () => ({
  useTheme: () => ({
    isDarkMode: false,
  }),
}));

describe("AlzatonaLogo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the brand text when showText is enabled", () => {
    render(<AlzatonaLogo size="sm" showText />);

    expect(screen.getByText("Elzatona-web")).toBeInTheDocument();
    expect(screen.getByText("Learn. Practice. Build.")).toBeInTheDocument();
  });

  it("renders only the logo image when showText is disabled", () => {
    const { container } = render(<AlzatonaLogo size="sm" showText={false} />);

    expect(screen.queryByText("Elzatona-web")).not.toBeInTheDocument();
    expect(container.querySelector("img")).toBeInTheDocument();
  });
});
