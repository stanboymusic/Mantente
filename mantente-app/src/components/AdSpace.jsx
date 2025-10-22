import React from "react";

const AdSpace = ({ position = "bottom" }) => {
  const getAdConfig = () => {
    switch (position) {
      case "left":
        return {
          width: "250px",
          height: "600px",
          label: "Anuncio Vertical Izquierdo",
        };
      case "right":
        return {
          width: "250px",
          height: "600px",
          label: "Anuncio Vertical Derecho",
        };
      case "bottom":
        return {
          width: "100%",
          height: "90px",
          label: "Anuncio Horizontal Inferior",
        };
      default:
        return {
          width: "300px",
          height: "250px",
          label: "Espacio para Anuncio",
        };
    }
  };

  const config = getAdConfig();

  return (
    <div
      style={{
        width: config.width,
        height: config.height,
        backgroundColor: "#f8f9fa",
        border: "2px solid #dee2e6",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
        margin: "10px",
        fontSize: "12px",
        color: "#6c757d",
        textAlign: "center",
        fontWeight: "500",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Placeholder para Google AdSense */}
      <div>
        <div style={{ marginBottom: "8px" }}>📢</div>
        {config.label}
        <div style={{ fontSize: "10px", marginTop: "5px", opacity: 0.7 }}>
          Google AdSense
        </div>
      </div>

      {/* Aquí va el código de Google AdSense */}
      {/* Reemplaza este div con: <ins class="adsbygoogle" ...></ins> */}
    </div>
  );
};

export default AdSpace;