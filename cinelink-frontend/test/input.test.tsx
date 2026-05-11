import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input", () => {
    it("should render an input with placeholder", () => {
        render(<Input placeholder="Email" />);

        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    });
});
