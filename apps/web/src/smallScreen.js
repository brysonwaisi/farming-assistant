import { css } from "styled-components";

// Phones
export const mobile = (props) => css`
  @media only screen and (max-width: 480px) {
    ${props}
  }
`;

// Tablets (and small laptops)
export const tablet = (props) => css`
  @media only screen and (min-width: 481px) and (max-width: 1024px) {
    ${props}
  }
`;
