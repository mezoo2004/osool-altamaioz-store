import QRCode from "qrcode";

export async function generatePassportQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 280,
    color: { dark: "#1a1a1a", light: "#ffffff" },
  });
}

export async function generatePassportQrSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 280,
    color: { dark: "#1a1a1a", light: "#ffffff" },
  });
}
