import React, { useEffect } from "react";
import { Modal } from "antd";
import type { ModalProps } from "antd/lib/modal";
import styles from "./FullscreenModal.module.scss";

interface FullscreenModalProps extends Omit<ModalProps, "width" | "style"> {
  fullscreen?: boolean;
}

export const FullscreenModal: React.FC<FullscreenModalProps> = ({
  fullscreen = false,
  bodyStyle,
  wrapClassName,
  ...props
}) => {
  useEffect(() => {
    if (fullscreen && props.open) {
      // 全屏时禁用 body 滚动
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreen, props.open]);

  if (fullscreen) {
    return (
      <Modal
        {...props}
        width="100%"
        style={{
          top: 0,
          paddingBottom: 0,
          maxWidth: "100%",
        }}
        bodyStyle={{
          padding: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          ...bodyStyle,
        }}
        wrapClassName={`${styles.fullscreenModalWrap} ${wrapClassName || ""}`}
      />
    );
  }

  return <Modal {...props} bodyStyle={bodyStyle} wrapClassName={wrapClassName} />;
};

