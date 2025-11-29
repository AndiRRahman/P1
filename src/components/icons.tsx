import type { SVGProps } from "react"

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      {...props}
    >
      <style>
        {`
          .logo-text {
            font-family: 'Poppins', sans-serif;
            font-size: 38px;
            font-weight: 600;
            fill: hsl(var(--primary));
          }
           .dark .logo-text {
            fill: hsl(var(--primary));
          }
        `}
      </style>
      <text x="0" y="38" className="logo-text">E-Commers V</text>
    </svg>
  ),
};
