import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AvatarPicker from "@/features/auth/components/AvatarPicker";

describe("AvatarPicker", () => {
    it("should render all avatars", () => {
        render(<AvatarPicker value="avatar1" onChange={() => {}} />);

        expect(screen.getByAltText("avatar1")).toBeInTheDocument();
        expect(screen.getByAltText("avatar2")).toBeInTheDocument();
        expect(screen.getByAltText("avatar3")).toBeInTheDocument();
        expect(screen.getByAltText("avatar4")).toBeInTheDocument();
        expect(screen.getByAltText("avatar5")).toBeInTheDocument();
    });

    it("should call onChange when selecting an avatar", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(<AvatarPicker value="avatar1" onChange={onChange} />);

        await user.click(screen.getByAltText("avatar3"));

        expect(onChange).toHaveBeenCalledWith("avatar3");
    });
});
