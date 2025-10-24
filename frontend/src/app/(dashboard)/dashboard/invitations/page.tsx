"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Copy, Plus, Trash2, Check } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function InvitationsPage() {
  const { toast } = useToast()
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [email, setEmail] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadInvitations = async () => {
    try {
      const data = await api.invitations.getAll()
      setInvitations(data)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudieron cargar las invitaciones',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvitations()
  }, [])

  const handleCreateInvitation = async () => {
    setCreating(true)
    try {
      await api.invitations.create(email || undefined)
      toast({
        title: 'Invitación creada',
        description: 'La invitación ha sido generada exitosamente',
      })
      setEmail('')
      loadInvitations()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo crear la invitación',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    toast({
      title: 'Enlace copiado',
      description: 'El enlace de invitación ha sido copiado al portapapeles',
    })
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteInvitation = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta invitación?')) return

    try {
      await api.invitations.delete(id)
      toast({
        title: 'Invitación eliminada',
        description: 'La invitación ha sido eliminada',
      })
      loadInvitations()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo eliminar la invitación',
      })
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Invitaciones</h1>
        <p className="text-muted-foreground">
          Genera enlaces de invitación para que nuevas empresas se registren en TransRoute
        </p>
      </div>

      {/* Crear nueva invitación */}
      <Card>
        <CardHeader>
          <CardTitle>Generar Nueva Invitación</CardTitle>
          <CardDescription>
            Crea un enlace único de un solo uso para invitar a una nueva empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="empresa@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreateInvitation} disabled={creating}>
                <Plus className="h-4 w-4 mr-2" />
                {creating ? 'Creando...' : 'Crear Invitación'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de invitaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Invitaciones Generadas</CardTitle>
          <CardDescription>
            {invitations.length} invitación(es) activa(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Cargando...</p>
          ) : invitations.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay invitaciones generadas
            </p>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">
                        {invitation.email || 'Sin email especificado'}
                      </p>
                      {invitation.is_used ? (
                        <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                          Usado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          Activo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {invitation.invitation_link}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Creado: {formatDate(invitation.created_at)} • Expira: {formatDate(invitation.expires_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyLink(invitation.invitation_link, invitation.id)}
                      disabled={invitation.is_used}
                    >
                      {copiedId === invitation.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteInvitation(invitation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

