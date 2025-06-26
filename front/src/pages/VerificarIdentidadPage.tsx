import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Shield, Camera, Upload, CheckCircle, Info, ChevronLeft, CreditCard } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"

const VerificarIdentidadPage: React.FC = () => {
  const navigate = useNavigate()
  const [verificationStep, setVerificationStep] = useState<
    "initial" | "scanning" | "uploading" | "processing" | "success"
  >("initial")
  const [verificationMethod, setVerificationMethod] = useState<"scan" | "upload">("scan")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleStartVerification = (method: "scan" | "upload") => {
    setVerificationMethod(method)
    if (method === "scan") {
      setVerificationStep("scanning")
    } else {
      setVerificationStep("uploading")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleSubmitUpload = () => {
    if (uploadedFile) {
      setVerificationStep("processing")
      // Simulación de procesamiento
      setTimeout(() => {
        setVerificationStep("success")
      }, 3000)
    }
  }

  const handleSimulateScan = () => {
    setVerificationStep("processing")
    // Simulación de procesamiento
    setTimeout(() => {
      setVerificationStep("success")
    }, 3000)
  }

  const handleFinish = () => {
    navigate("/perfil")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Button variant="ghost" className="mb-6 text-indigo-700" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>

        <div className="text-center mb-8">
          <div className="bg-indigo-100 p-3 rounded-full w-fit mx-auto mb-4">
            <Shield className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">Verificación de identidad</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Verifica tu identidad para acceder a eventos con restricción de edad y crear tus propios eventos
          </p>
        </div>

        <Alert className="mb-6 border-indigo-200 bg-indigo-50 text-indigo-800">
          <Info className="h-4 w-4" />
          <AlertTitle>Información importante</AlertTitle>
          <AlertDescription>
            Tu información personal será tratada con confidencialidad y solo se utilizará para verificar tu edad. No
            almacenamos imágenes de tu documento de identidad.
          </AlertDescription>
        </Alert>

        {verificationStep === "initial" && (
          <Card className="border-indigo-100 shadow-md">
            <CardHeader>
              <CardTitle>Elige un método de verificación</CardTitle>
              <CardDescription>Puedes escanear tu DNI con la cámara o subir una imagen del mismo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className="border rounded-lg p-6 flex flex-col items-center cursor-pointer hover:bg-indigo-50 transition-colors"
                onClick={() => handleStartVerification("scan")}
              >
                <div className="bg-indigo-100 p-3 rounded-full mb-3">
                  <Camera className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-medium text-lg text-indigo-900 mb-1">Escanear con cámara</h3>
                <p className="text-gray-600 text-center">
                  Usa la cámara de tu dispositivo para escanear tu DNI en tiempo real
                </p>
              </div>

              <div
                className="border rounded-lg p-6 flex flex-col items-center cursor-pointer hover:bg-indigo-50 transition-colors"
                onClick={() => handleStartVerification("upload")}
              >
                <div className="bg-indigo-100 p-3 rounded-full mb-3">
                  <Upload className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-medium text-lg text-indigo-900 mb-1">Subir imagen</h3>
                <p className="text-gray-600 text-center">Sube una foto de tu DNI desde tu dispositivo</p>
              </div>
            </CardContent>
          </Card>
        )}

        {verificationStep === "scanning" && (
          <Card className="border-indigo-100 shadow-md">
            <CardHeader>
              <CardTitle>Escanea tu DNI</CardTitle>
              <CardDescription>Coloca tu DNI dentro del marco y asegúrate de que esté bien iluminado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                <div className="border-2 border-dashed border-indigo-300 rounded-lg w-4/5 h-4/5 flex items-center justify-center">
                  <div className="text-center">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500">Vista previa de la cámara</p>
                    <p className="text-sm text-gray-400">(Simulación)</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setVerificationStep("initial")}>
                  Cancelar
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSimulateScan}>
                  Capturar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {verificationStep === "uploading" && (
          <Card className="border-indigo-100 shadow-md">
            <CardHeader>
              <CardTitle>Sube una imagen de tu DNI</CardTitle>
              <CardDescription>Asegúrate de que la imagen sea clara y todos los datos sean legibles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <Input id="dni-upload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                <Label htmlFor="dni-upload" className="cursor-pointer">
                  {uploadedFile ? (
                    <div className="text-indigo-600">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3" />
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500">Haz clic para cambiar</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-500 mb-1">Arrastra una imagen o haz clic para seleccionar</p>
                      <p className="text-xs text-gray-400">PNG, JPG o JPEG (máx. 5MB)</p>
                    </div>
                  )}
                </Label>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setVerificationStep("initial")}>
                  Cancelar
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmitUpload} disabled={!uploadedFile}>
                  Verificar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {verificationStep === "processing" && (
          <Card className="border-indigo-100 shadow-md">
            <CardHeader>
              <CardTitle>Procesando tu documento</CardTitle>
              <CardDescription>Estamos verificando tu identidad. Esto puede tomar unos momentos...</CardDescription>
            </CardHeader>
            <CardContent className="py-12 flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin mb-6"></div>
              <p className="text-gray-600">Verificando documento...</p>
            </CardContent>
          </Card>
        )}

        {verificationStep === "success" && (
          <Card className="border-indigo-100 shadow-md">
            <CardHeader>
              <CardTitle>¡Verificación exitosa!</CardTitle>
              <CardDescription>Tu identidad ha sido verificada correctamente</CardDescription>
            </CardHeader>
            <CardContent className="py-8 flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="font-medium text-xl text-green-800 mb-2">Identidad verificada</h3>
              <p className="text-gray-600 text-center max-w-md mb-6">
                Ahora puedes acceder a eventos con restricción de edad y crear tus propios eventos en la plataforma.
              </p>
              <Badge className="bg-green-100 text-green-800 py-1.5 px-3 text-sm">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Verificación completada
              </Badge>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleFinish}>
                Continuar
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}

export default VerificarIdentidadPage
