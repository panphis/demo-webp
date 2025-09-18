"use client";

import React from "react";
import styles from "./loading-button.module.css";

import { ButtonProps, Button } from "./button";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    loading ? styles.loading : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Button className={buttonClasses} disabled={disabled || loading} {...props}>
      <span className={styles.border}></span>
      {children}
    </Button>
  );
};

export default LoadingButton;
