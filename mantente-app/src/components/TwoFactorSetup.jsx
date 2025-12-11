import React, { useState, useEffect } from "react";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { pb } from "../pocketbase";

const TwoFactorSetup = ({ onComplete }) => {
  const [secret, setSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const generateSecret = () => {
      const newSecret = authenticator.generateSecret();
      setSecret(newSecret);

      const otpauth = authenticator.keyuri(
        pb.authStore.model?.email || "user",
        "Mantente App",
        newSecret
      );

      QRCode.toDataURL(otpauth, (err, url) => {
        if (!err) {
          setQrCodeUrl(url);
        }
      });
    };

    generateSecret();
  }, []);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError("Ingresa un código de 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isValid = authenticator.verify({ token: code, secret });

      if (isValid) {
        // Guardar el secret en el usuario
        await pb.collection("users").update(pb.authStore.model.id, {
          twofa_secret: secret,
          twofa_enabled: true,
        });

        onComplete();
      } else {
        setError("Código incorrecto");
      }
    } catch (err) {
      setError("Error al verificar el código");
    }

    setLoading(false);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3>Configurar Autenticación de Dos Factores</h3>
            </div>
            <div className="card-body text-center">
              <p>Escanea el código QR con tu aplicación de autenticación:</p>
              {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
              <p className="mt-3">O ingresa manualmente: <code>{secret}</code></p>

              <div className="mt-4">
                <label>Código de verificación:</label>
                <input
                  type="text"
                  className="form-control text-center"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                />
              </div>

              {error && <div className="alert alert-danger mt-3">{error}</div>}

              <button
                className="btn btn-primary mt-3"
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
              >
                {loading ? "Verificando..." : "Verificar y Activar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetup;