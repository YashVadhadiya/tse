import { useEffect, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import {
  Building2,
  CalendarDays,
  MapPin,
  Mail,
  Phone,
  Sparkles,
  StickyNote,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { QuotationActions } from '@/hooks/useQuotation'
import type { ClientInfo } from '@/types'

interface ClientInfoFormProps {
  client: ClientInfo
  updateClient: QuotationActions['updateClient']
  onOpenPreview: () => void
}

function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string
  icon: LucideIcon
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </Label>
      {children}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
}

export function ClientInfoForm({
  client,
  updateClient,
  onOpenPreview,
}: ClientInfoFormProps) {
  const { register, watch, trigger, formState } = useForm<ClientInfo>({
    defaultValues: client,
    mode: 'onBlur',
  })

  useEffect(() => {
    const sub = watch((values) => {
      if (values && typeof values === 'object') {
        updateClient(values as ClientInfo)
      }
    })
    return () => sub.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePreview = async () => {
    const valid = await trigger(['clientName', 'mobile'])
    if (!valid) {
      document
        .getElementById('section-client')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    onOpenPreview()
  }

  return (
    <Card id="section-client" className="scroll-mt-24">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
              <span className="flex size-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                1
              </span>
              Client Information
            </div>
            <CardTitle className="text-lg">Who is the quotation for?</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Basic details of the client and the event.
            </p>
          </div>
          <button
            onClick={handlePreview}
            className="hidden text-sm font-medium text-violet-600 hover:text-violet-700 sm:block"
          >
            Validate →
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            label="Client Name"
            icon={User}
            error={formState.errors.clientName?.message}
          >
            <Input
              placeholder="e.g. Rahul Patel"
              className="h-10"
              {...register('clientName', {
                required: 'Client name is required',
              })}
            />
          </Field>
          <Field
            label="Mobile Number"
            icon={Phone}
            error={formState.errors.mobile?.message}
          >
            <Input
              placeholder="e.g. +91 98765 43210"
              className="h-10"
              {...register('mobile', {
                required: 'Mobile number is required',
                pattern: {
                  value: /^[+]?[\d\s-]{8,15}$/,
                  message: 'Enter a valid mobile number',
                },
              })}
            />
          </Field>
          <Field label="Email (optional)" icon={Mail}>
            <Input
              type="email"
              placeholder="rahul@example.com"
              className="h-10"
              {...register('email', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email',
                },
              })}
            />
          </Field>
          <Field label="Event Name" icon={Sparkles}>
            <Input
              placeholder="e.g. Wedding Celebration"
              className="h-10"
              {...register('eventName')}
            />
          </Field>
          <Field label="Venue" icon={MapPin}>
            <Input
              placeholder="e.g. Green Palace Farm"
              className="h-10"
              {...register('venue')}
            />
          </Field>
          <Field label="City" icon={Building2}>
            <Input
              placeholder="e.g. Rajkot, Gujarat"
              className="h-10"
              {...register('city')}
            />
          </Field>
          <Field label="Event Date" icon={CalendarDays}>
            <Input type="date" className="h-10" {...register('eventDate')} />
          </Field>
          <Field label="Expected Guest Count" icon={Users}>
            <Input
              placeholder="e.g. 800"
              className="h-10"
              {...register('guestCount')}
            />
          </Field>
          <Field label="Special Notes" icon={StickyNote}>
            <Textarea
              placeholder="Timings, theme preferences, special requests…"
              rows={3}
              {...register('notes')}
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  )
}
