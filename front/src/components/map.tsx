import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Button } from "./ui/button"
import { ExternalLink } from "lucide-react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface MapProps {
  center?: [number, number]
  zoom?: number
  height?: string
  address?: string
  title?: string
  showGoogleMapsButton?: boolean
}

export const Map: React.FC<MapProps> = ({
  center = [41.3851, 2.1734], // Barcelona coordinates by default
  zoom = 15,
  height = "300px",
  address = "",
  title = "Ubicación",
  showGoogleMapsButton = true,
}) => {
  const handleOpenInGoogleMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${center[0]},${center[1]}`
    window.open(googleMapsUrl, "_blank")
  }

  return (
    <div className="w-full">
      {showGoogleMapsButton && (
        <div className="mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInGoogleMaps}
            className="text-indigo-700 border-indigo-200 hover:bg-indigo-50 bg-transparent"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver en Google Maps
          </Button>
        </div>
      )}
      <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
        <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center}>
            <Popup>
              <div className="text-center">
                <h3 className="font-medium text-gray-900">{title}</h3>
                {address && <p className="text-sm text-gray-600 mt-1">{address}</p>}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  )
}

export default Map
