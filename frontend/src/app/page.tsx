import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bus, Package, TrendingUp, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            TransRoute
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Sistema de gestión multi-empresa para transporte de pasajeros y paquetería
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="text-lg">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-lg text-white border-white hover:bg-white/20">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <FeatureCard
            icon={<Bus className="w-12 h-12" />}
            title="Gestión de Viajes"
            description="Administra rutas, viajes y asientos en tiempo real"
          />
          <FeatureCard
            icon={<Users className="w-12 h-12" />}
            title="Multi-empresa"
            description="Soporte completo para múltiples empresas en una sola plataforma"
          />
          <FeatureCard
            icon={<Package className="w-12 h-12" />}
            title="Paquetería"
            description="Sistema completo de envío y rastreo de paquetes"
          />
          <FeatureCard
            icon={<TrendingUp className="w-12 h-12" />}
            title="Reportes Financieros"
            description="Análisis detallado de ingresos, gastos y comisiones"
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white hover:bg-white/20 transition-colors">
      <div className="mb-4 text-primary-200">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-primary-100">{description}</p>
    </div>
  )
}

