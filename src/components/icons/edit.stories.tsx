import { Edit } from ".";

export default {
  title: "Components/Icons/Edit",
  component: Edit,
};

export const Default = () => <Edit />;

export const WithFill = () => (
  <span className="text-icon-primary hover:text-icon-primary-hover">
    <Edit />
  </span>
);

export const WithDisabled = () => (
  <span className="text-icon-primary-disabled">
    <Edit />
  </span>
);
