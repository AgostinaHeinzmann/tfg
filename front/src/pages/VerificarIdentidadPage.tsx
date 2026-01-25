import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

import {
  Shield,
  Camera,
  Upload,
  Info,
  ChevronLeft,
  Loader,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { toast } from "sonner";
import {
  BarcodeScanner,
  type BarcodeScannerConfig,
} from "dynamsoft-barcode-reader-bundle";
import { MRZScanner, EnumMRZData } from "dynamsoft-mrz-scanner";
import { updateBirthDate, getVerificacion } from "../services/verificacionService";

interface MRZDate {
  day: number;
  month: number;
  year: number;
}

const VerificarIdentidadPage: React.FC = () => {
  const barcodeScannerViewRef = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showScanner, setShowScanner] = useState(false);
  const barcodeScannerRef = useRef<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verification, setVerification] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

        if (result?.barcodeResults?.length > 0) {
          handleBarcodeDetected(result.barcodeResults[0].text);
        }
      } catch (error) {
        toast.error("Error al iniciar el scanner. Verifica tu licencia.");
        setShowScanner(false);
      }
    })();

    return () => {
      try {
        barcodeScannerRef.current?.dispose?.();
      } catch (e) {
        // Silent cleanup
      }
    };
  }, [showScanner]);

  const handleBarcodeDetected = async (text: string) => {
    if (!text) {
      setErrorMessage("No se pudo leer el código de barras. Intenta de nuevo.");
      setShowErrorModal(true);
      return;
    }
    
    setIsProcessing(true);
    try {
      const birthDate = text.split("@")[6];
      const [day, month, year] = birthDate.split("/");
      const formattedDate = `${year}-${month}-${day}`;
      await updateBirthDate(formattedDate);
      setShowScanner(false);
      setShowSuccessModal(true);
      setVerification(true);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error || "Error al verificar identidad. Intenta nuevamente.");
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const mrzScanner = new MRZScanner({
        license: import.meta.env.VITE_DYNAMSOFT_LICENSE_MRZ,
        engineResourcePaths: {
          rootDirectory: "https://cdn.jsdelivr.net/npm/",
        },
        showResultView: false,
      });

      const result = await mrzScanner.launch(file);

      if (result?.data) {
        const dateOfBirth = result.data[EnumMRZData.DateOfBirth] as MRZDate;
        
        if (dateOfBirth && dateOfBirth.year && dateOfBirth.month && dateOfBirth.day) {
          const formattedDate = `${dateOfBirth.year}-${String(dateOfBirth.month).padStart(2, '0')}-${String(dateOfBirth.day).padStart(2, '0')}`;
          
          await updateBirthDate(formattedDate);
          setShowSuccessModal(true);
          setVerification(true);
        } else {
          setErrorMessage(
            "No se pudo extraer la fecha de nacimiento del MRZ. Asegúrate de que la imagen sea del dorso del DNI."
          );
          setShowErrorModal(true);
        }
      } else {
        setErrorMessage(
          "No se detectó la zona MRZ en la imagen. Asegúrate de que sea una foto clara del dorso del DNI."
        );
        setShowErrorModal(true);
      }

      mrzScanner.dispose();
    } catch (error: any) {
      setErrorMessage(
        error?.message ||
        "Error al procesar la imagen. Intenta con otra foto más clara del dorso del DNI."
      );
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
      // Limpiar el input para permitir subir el mismo archivo nuevamente
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const verificacion = await getVerificacion();
        setVerification(verificacion);
      } catch (error) {
        setVerification(false);
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
            <strong>Escaneo con cámara:</strong> Apunta al{" "}
            <strong>frente del DNI</strong> donde está el código de barras.
            <br />
            <strong>Subir imagen:</strong> Sube una foto del{" "}
            <strong>dorso del DNI</strong> donde está la zona MRZ (las líneas de texto codificado en la parte inferior).
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
            {verification ? (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Ya verificado</AlertTitle>
                <AlertDescription>
                  Tu identidad ya ha sido verificada correctamente. Puedes acceder a todos los eventos sin restricción de edad.
                </AlertDescription>
              </Alert>
            ) : (
              <>
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

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border rounded-lg p-6 flex flex-col items-center cursor-pointer hover:bg-indigo-50 transition-colors"
                >
                  <div className="bg-indigo-100 p-3 rounded-full mb-3">
                    <Upload className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="font-medium text-lg text-indigo-900 mb-1">
                    Subir imagen
                  </h3>
                  <p className="text-gray-600 text-center text-sm">
                    Sube una foto clara del{" "}
                    <strong>dorso del DNI</strong> donde está la zona MRZ
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col">
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

      {/* Modal de Éxito */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="border-green-200 bg-white">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-green-900">
              ¡Verificación exitosa!
            </DialogTitle>
            <DialogDescription className="text-center mt-2">
              Tu identidad ha sido verificada correctamente. Ahora puedes acceder a
              eventos con restricción de edad y crear tus propios eventos.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Error */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="border-red-200 bg-white">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-red-900">
              Error en la verificación
            </DialogTitle>
            <DialogDescription className="text-center mt-2">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => {
                setShowErrorModal(false);
                setShowScanner(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Intentar de nuevo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerificarIdentidadPage;
