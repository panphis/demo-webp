import { SVGProps } from "react";

export const Play = ({ ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#clip0_407_86)">
        <path
          d="M2.5 7.49998V12.5H5.83333L10 16.6667V3.33332L5.83333 7.49998H2.5ZM13.75 9.99998C13.75 8.52498 12.9 7.25832 11.6667 6.64165V13.35C12.9 12.7417 13.75 11.475 13.75 9.99998ZM11.6667 2.69165V4.40832C14.075 5.12498 15.8333 7.35832 15.8333 9.99998C15.8333 12.6417 14.075 14.875 11.6667 15.5917V17.3083C15.0083 16.55 17.5 13.5667 17.5 9.99998C17.5 6.43332 15.0083 3.44998 11.6667 2.69165Z"
          fill={"currentColor"}
        />
      </g>
      <defs>
        <clipPath id="clip0_407_86">
          <rect width="20" height="20" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  );
};
