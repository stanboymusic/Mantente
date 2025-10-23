import React, { useEffect } from "react";
import { useApp } from "../context/AppContext";

const AdSpace = ({ position = "bottom" }) => {
  const { isPremium } = useApp();

  // Si el usuario es premium, no mostrar anuncios
  if (isPremium) {
    return null;
  }

  const getAdConfig = () => {
    switch (position) {
      case "left":
        return {
          width: "250px",
          height: "600px",
        };
      case "right":
        return {
          width: "250px",
          height: "600px",
        };
      case "bottom":
        return {
          width: "100%",
          height: "90px",
        };
      default:
        return {
          width: "300px",
          height: "250px",
        };
    }
  };

  const config = getAdConfig();

  useEffect(() => {
    // Ejecutar adsbygoogle.push para que AdSense procese los anuncios automáticamente
    if (window.adsbygoogle) {
      window.adsbygoogle.push({});
    }
  }, [position]);

  return (
    <ins
      className="adsbygoogle"
      style={{
        display: "block",
        width: config.width,
        height: config.height,
      }}
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};

export default AdSpace;