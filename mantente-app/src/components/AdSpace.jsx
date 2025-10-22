import React, { useEffect } from "react";

const AdSpace = ({ position = "bottom", adSlot = "" }) => {
  const getAdConfig = () => {
    switch (position) {
      case "left":
        return {
          width: "250px",
          height: "600px",
          format: "vertical",
          adFormat: "vertical",
        };
      case "right":
        return {
          width: "250px",
          height: "600px",
          format: "vertical",
          adFormat: "vertical",
        };
      case "bottom":
        return {
          width: "100%",
          height: "90px",
          format: "horizontal",
          adFormat: "horizontal",
        };
      default:
        return {
          width: "300px",
          height: "250px",
          format: "auto",
          adFormat: "rectangle",
        };
    }
  };

  const config = getAdConfig();

  useEffect(() => {
    // Ejecutar adsbygoogle.push cuando el componente se monta
    if (window.adsbygoogle) {
      window.adsbygoogle.push({});
    }
  }, [adSlot]);

  return (
    <div
      style={{
        width: config.width,
        height: config.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
        margin: "10px",
        position: "relative",
        minHeight: config.height,
      }}
    >
      {adSlot ? (
        <ins
          className="adsbygoogle"
          style={{
            display: "block",
            width: config.width,
            height: config.height,
          }}
          data-ad-client="ca-pub-9518260713755284"
          data-ad-slot={adSlot}
          data-ad-format={config.adFormat}
          data-full-width-responsive="true"
        ></ins>
      ) : (
        <div
          style={{
            textAlign: "center",
            color: "#999",
            fontSize: "12px",
            backgroundColor: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span>Espacio publicitario Google AdSense</span>
        </div>
      )}
    </div>
  );
};

export default AdSpace;