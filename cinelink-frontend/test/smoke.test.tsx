import { render, screen } from "@testing-library/react";

describe("Frontend test setup", () => {
    it("should render a basic element", () => {
        render(<h1>CineLink</h1>);

        expect(screen.getByText("CineLink")).toBeInTheDocument();
    });
});
