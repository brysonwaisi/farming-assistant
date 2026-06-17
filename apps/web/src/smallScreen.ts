import { css, CSSObject, FlattenSimpleInterpolation } from "styled-components";

type Styles = CSSObject | FlattenSimpleInterpolation;

// Phones
export const mobile = (props: Styles): FlattenSimpleInterpolation => css`
  @media only screen and (max-width: 480px) {
    ${props}
  }
`;

// Tablets (and small laptops)
export const tablet = (props: Styles): FlattenSimpleInterpolation => css`
  @media only screen and (min-width: 481px) and (max-width: 1024px) {
    ${props}
  }
`;
