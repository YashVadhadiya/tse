import { useEffect, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { User } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { QuotationActions } from '@/hooks/useQuotation'
import type { ClientInfo } from '@/types'

interface ClientInfoFormProps {
  client: ClientInfo
  updateClient: QuotationActions['updateClient']
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-violet-600">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
}

export function ClientInfoForm({
  client,
  updateClient,
}: ClientInfoFormProps) {
  const { register, watch, formState } = useForm<ClientInfo>({
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

  return (
    <Card id="section-client" className="scroll-mt-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="size-4 text-violet-600" />
          Client Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Client Name"
            required
            error={formState.errors.clientName?.message}
          >
            <Input
              className="h-11 text-base"
              {...register('clientName', {
                required: 'Client name is required',
              })}
            />
          </Field>
          <Field
            label="Mobile Number"
            required
            error={formState.errors.mobile?.message}
          >
            <Input
              inputMode="tel"
              className="h-11 text-base"
              {...register('mobile', {
                required: 'Mobile number is required',
                pattern: {
                  value: /^[+]?[\d\s-]{8,15}$/,
                  message: 'Enter a valid mobile number',
                },
              })}
            />
          </Field>
          <Field label="Email" error={formState.errors.email?.message}>
            <Input
              type="email"
              inputMode="email"
              className="h-11 text-base"
              {...register('email', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email',
                },
              })}
            />
          </Field>
          <Field label="Event Name">
            <Input className="h-11 text-base" {...register('eventName')} />
          </Field>
          <Field label="Event Date">
            <Input
              type="date"
              className="h-11 text-base"
              {...register('eventDate')}
            />
          </Field>
          <Field label="Venue">
            <Input className="h-11 text-base" {...register('venue')} />
          </Field>
          <Field label="City">
            <Input className="h-11 text-base" {...register('city')} />
          </Field>
          <Field label="Guest Count">
            <Input
              inputMode="numeric"
              className="h-11 text-base"
              {...register('guestCount')}
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  )
}