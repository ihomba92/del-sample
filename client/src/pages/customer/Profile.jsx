import { useDispatch } from 'react-redux'
import { useState } from 'react'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PageContainer, PageHeader } from '@/components/layout/AppShell'
import { updateProfile } from '@/features/auth/authSlice'
import { fullDate, initials } from '@/utils/formatters'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export default function Profile() {
  const dispatch = useDispatch()
  const toast = useToast()
  const { user, isCourier } = useAuth()

  const [values, setValues] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    vehicle: user?.vehicle || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    const payload = { name: values.name.trim(), phone: values.phone.trim() || null }
    if (isCourier) payload.vehicle = values.vehicle.trim() || null

    const result = await dispatch(updateProfile(payload))
    setSaving(false)

    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile saved')
    } else {
      toast.error(result.payload || 'Could not save your profile')
    }
  }

  return (
    <PageContainer className="max-w-2xl">
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Keep your contact details current so couriers and operations can reach you."
      />

      <div className="mt-6 flex items-center gap-3.5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-inset ring-slate-100">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 font-display text-xl font-bold text-brand-800">
          {initials(user?.name)}
        </span>
        <div>
          <p className="font-display text-xl font-semibold text-slate-950">{user?.name}</p>
          <p className="font-body text-sm text-slate-500">{user?.email}</p>
          <p className="font-body text-xs capitalize text-slate-400">
            {user?.role} · joined {fullDate(user?.created_at)}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-3.5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-inset ring-slate-100 sm:p-8"
      >
        <Input
          label="Full name"
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
        />
        <Input
          label="Phone number"
          value={values.phone}
          onChange={(event) => setValues({ ...values, phone: event.target.value })}
          placeholder="0712345678"
          inputMode="tel"
        />
        {isCourier && (
          <Input
            label="Vehicle"
            value={values.vehicle}
            onChange={(event) => setValues({ ...values, vehicle: event.target.value })}
            placeholder="Motorbike KMFA 221P"
            hint="Shown to customers tracking your deliveries"
          />
        )}
        <Input label="Email address" value={user?.email || ''} disabled hint="Email cannot be changed" />

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </div>
      </form>
    </PageContainer>
  )
}
