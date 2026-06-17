import styled from "styled-components";
import { colors, radius } from "../theme";

interface ButtonProps {
  variant?: "outline";
}

const Button = styled.button<ButtonProps>`
  padding: 14px 20px;
  border-radius: ${radius};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;

  border: ${(props) =>
    props.variant === "outline" ? `2px solid ${colors.primary}` : "none"};
  background-color: ${(props) =>
    props.variant === "outline" ? colors.white : colors.primary};
  color: ${(props) =>
    props.variant === "outline" ? colors.primary : colors.white};

  &:hover:not(:disabled) {
    background-color: ${(props) =>
      props.variant === "outline" ? colors.lightBg : colors.primaryDark};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default Button;
