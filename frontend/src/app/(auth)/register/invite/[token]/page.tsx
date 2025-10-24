"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Upload, Loader2 } from 'lucide-react'

export default function InviteRegisterPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    company_name: '',
  })

  useEffect(() => {
    validateToken()
  }, [params.token])

  const validateToken = async () => {
    try {
      const response = await api.invitations.validate(params.token)
      if (response.valid) {
        setTokenValid(true)
        if (response.email) {
          setFormData(prev => ({ ...prev, email: response.email }))
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Invitación inválida',
        description: error.message || 'Esta invitación no es válida o ha expirado',
      })
      setTimeout(() => router.push('/'), 3000)
    } finally {
      setValidating(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    try {
      // Aquí subirías el archivo a Supabase Storage
      // Por ahora, simulamos con un placeholder
      const fakeUrl = URL.createObjectURL(file)
      setLogoUrl(fakeUrl)
      toast({
        title: 'Logo cargado',
        description: 'El logo ha sido cargado correctamente',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cargar el logo',
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.registerByInvitation({
        ...formData,
        token: params.token,
        company_logo_url: logoUrl || undefined,
      })

      toast({
        title: '¡Registro exitoso!',
        description: 'Tu empresa y cuenta han sido creadas correctamente',
      })

      router.push('/dashboard')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al registrar',
        description: error.message || 'Ocurrió un error al crear tu cuenta',
      })
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Validando invitación...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tokenValid) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl text-center">Bienvenido a TransRoute</CardTitle>
          <CardDescription className="text-center">
            Completa el formulario para registrar tu empresa
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Información de la Empresa */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Información de la Empresa</h3>
              
              <div className="space-y-2">
                <Label htmlFor="company_name">Nombre de la Empresa *</Label>
                <Input
                  id="company_name"
                  placeholder="Mi Empresa de Transporte S.A."
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo de la Empresa (opcional)</Label>
                <div className="flex items-center gap-4">
                  {logoUrl && (
                    <div className="w-20 h-20 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Usuario */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Tu Información (Owner)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono/Contacto *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+52 123 456 7890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear Empresa y Cuenta'
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Al registrarte, serás el Owner de la empresa y tendrás acceso completo al sistema
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

