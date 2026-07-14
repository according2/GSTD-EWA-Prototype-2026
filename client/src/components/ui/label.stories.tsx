import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";
import { Input } from "./input";
import { Checkbox } from "./checkbox";

const meta = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
  args: {
    children: "Label",
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInput: Story = {
  render: () => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <Label className="gap-2">
      <Checkbox id="terms" />
      Accept terms and conditions
    </Label>
  ),
};
