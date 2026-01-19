import type React from "react";
import { act, useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import {
  Shield,
  Camera,
  Upload,
  Info,
  ChevronLeft,
  X,
  Loader,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { toast } from "sonner";
import {
  BarcodeScanner,
  EnumScanMode,
  type BarcodeScannerConfig,
} from "dynamsoft-barcode-reader-bundle";
import { updateBirthDate, getVerificacion } from "../services/verificacionService";

const VerificarIdentidadPage: React.FC = () => {
  const barcodeScannerViewRef = useRef(null);
  const [showScanner, setShowScanner] = useState(false);
  const barcodeScannerRef = useRef<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verification, setVerification] = useState<boolean>(false);

  useEffect(() => {
    if (!showScanner) return;

    const config: BarcodeScannerConfig = {
      license: import.meta.env.VITE_DYNAMSOFT_LICENSE,
      container: barcodeScannerViewRef.current!,
      uiPath:
        "https://cdn.jsdelivr.net/npm/dynamsoft-barcode-reader-bundle@11.2.4000/dist/ui/barcode-scanner.ui.xml",
      engineResourcePaths: {
        rootDirectory: "https://cdn.jsdelivr.net/npm/",
      },
    };

    const barcodeScanner = new BarcodeScanner(config);
    barcodeScannerRef.current = barcodeScanner;

    (async () => {
      try {
        const result = await barcodeScanner.launch();
        

        // Si se detecta un código de barras en el launch
        if (result?.barcodeResults?.length > 0) {
          handleBarcodeDetected(result.barcodeResults[0].text);
        }
      } catch (error) {
        console.error("Error launching barcode scanner:", error);
        toast.error("Error al iniciar el scanner. Verifica tu licencia.");
        setShowScanner(false);
      }
    })();

    return () => {
      try {
        barcodeScannerRef.current?.dispose?.();
      } catch (e) {
        console.error("Error disposing scanner:", e);
      }
    };
  }, [showScanner]);

  const handleBarcodeDetected = async (text: string) => {
    const birthDate = text.split("@")[6];
    const [day, month, year] = birthDate.split("/");
    const formattedDate = `${year}-${month}-${day}`;
    await updateBirthDate(formattedDate);
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getVerificacion();
        setVerification(data);
      } catch (error) {
        console.error("Error fetching verification:", error);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Button variant="ghost" className="mb-6 text-indigo-700">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>

        <div className="text-center mb-8">
          <div className="bg-indigo-100 p-3 rounded-full w-fit mx-auto mb-4">
            <Shield className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">
            Verificación de identidad
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Verifica tu identidad para acceder a eventos con restricción de edad
            y crear tus propios eventos
          </p>
        </div>

        <Alert className="mb-6 border-indigo-200 bg-indigo-50 text-indigo-800">
          <Info className="h-4 w-4" />
          <AlertTitle>Información importante</AlertTitle>
          <AlertDescription>
            Tu información personal será tratada con confidencialidad y solo se
            utilizará para verificar tu edad. No almacenamos imágenes de tu
            documento de identidad.
          </AlertDescription>
        </Alert>

        <Alert className="mb-6 border-yellow-200 bg-yellow-50 text-yellow-900">
          <Info className="h-4 w-4" />
          <AlertTitle>⚠️ Consejos para mejores resultados</AlertTitle>
          <AlertDescription>
            Asegúrate de que la <strong>luz sea clara</strong>, coloca el DNI{" "}
            <strong>centrado</strong> en la cámara y apunta al{" "}
            <strong>frente (parte delantera)</strong> donde están tus datos
            personales.
          </AlertDescription>
        </Alert>

        <Card className="border-indigo-100 shadow-md">
          <CardHeader>
            <CardTitle>Elige un método de verificación</CardTitle>
            <CardDescription>
              Puedes escanear tu DNI con la cámara o subir una imagen del mismo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              onClick={() => setShowScanner(true)}
              className="border rounded-lg p-6 flex flex-col items-center cursor-pointer hover:bg-indigo-50 transition-colors"
            >
              <div className="bg-indigo-100 p-3 rounded-full mb-3">
                <Camera className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-medium text-lg text-indigo-900 mb-1">
                Escanear con cámara
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Apunta al <strong>frente (parte delantera)</strong> de tu DNI
                donde están tus datos
              </p>
            </div>

            <div className="border rounded-lg p-6 flex flex-col items-center cursor-pointer hover:bg-indigo-50 transition-colors">
              <div className="bg-indigo-100 p-3 rounded-full mb-3">
                <Upload className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-medium text-lg text-indigo-900 mb-1">
                Subir imagen
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Sube una foto clara del{" "}
                <strong>frente (parte delantera)</strong> de tu DNI
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-white">
            <h2 className="text-xl font-bold text-indigo-900">Escanear DNI</h2>
            <button
              onClick={() => setShowScanner(false)}
              disabled={isProcessing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <div
            ref={barcodeScannerViewRef}
            style={{ width: "100%", height: "100%", flex: 1 }}
          ></div>
          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <Loader className="h-8 w-8 text-white animate-spin" />
                <p className="text-white font-medium">Procesando documento...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificarIdentidadPage;
