import Input from '@/components/ui/Input'
import PlacesAutocomplete from '@/components/map/PlacesAutocomplete'

export default function OrderForm({ values, errors, categories, couriers = [], onChange }) {
  const set = (patch) => onChange({ ...values, ...patch })
  const tier = categories.find((item) => item.value === values.weight_category)

  return (
    <div className="flex flex-col gap-8">
      <Section title="Route" caption="Where should we collect and deliver?">
        <PlacesAutocomplete
          label="Pickup location"
          value={values.pickup}
          onChange={(pickup) => set({ pickup })}
          error={errors.pickup}
          placeholder="Sarit Centre, Westlands"
        />
        <PlacesAutocomplete
          label="Destination"
          value={values.destination}
          onChange={(destination) => set({ destination })}
          error={errors.destination}
          placeholder="Karen Shopping Centre"
        />
      </Section>

      <Section title="Parcel" caption="Weight decides the handling multiplier.">
        <fieldset>
          <legend className="font-body text-sm font-semibold text-slate-700">
            Weight category
          </legend>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            {categories.map((category) => {
              const active = values.weight_category === category.value
              return (
                <label
                  key={category.value}
                  className={[
                    'flex cursor-pointer flex-col gap-0.5 rounded-xl p-3.5 transition',
                    'ring-1 ring-inset focus-within:ring-2 focus-within:ring-brand-500',
                    active
                      ? 'bg-brand-50 ring-brand-500'
                      : 'bg-white ring-slate-200 hover:ring-slate-300',
                  ].join(' ')}
                >
                  <span className="flex items-center justify-between gap-2.5">
                    <span className="font-display text-base font-semibold text-slate-900">
                      {category.label}
                    </span>
                    <input
                      type="radio"
                      name="weight_category"
                      value={category.value}
                      checked={active}
                      onChange={() => set({ weight_category: category.value })}
                      className="h-4 w-4 accent-brand-600"
                    />
                  </span>
                  <span className="font-body text-sm text-slate-500">{category.description}</span>
                  <span className="font-mono text-xs text-slate-400">
                    up to {category.max_kg} kg · ×{category.multiplier}
                  </span>
                </label>
              )
            })}
          </div>
          {errors.weight_category && (
            <p className="mt-1.5 font-body text-sm text-red-700">{errors.weight_category}</p>
          )}
        </fieldset>

        <Input
          label="Actual weight"
          type="number"
          min="0.1"
          step="0.1"
          value={values.weight_kg}
          onChange={(event) => set({ weight_kg: event.target.value })}
          error={errors.weight_kg}
          hint={tier ? `${tier.label} accepts up to ${tier.max_kg} kg` : 'In kilograms'}
        />
      </Section>

      <Section title="Recipient" caption="Who is receiving this parcel?">
        <Input
          label="Full name"
          value={values.recipient_name}
          onChange={(event) => set({ recipient_name: event.target.value })}
          error={errors.recipient_name}
          placeholder="Joyce Muthoni"
        />
        <Input
          label="Phone number"
          value={values.recipient_phone}
          onChange={(event) => set({ recipient_phone: event.target.value })}
          error={errors.recipient_phone}
          placeholder="0712345678"
          inputMode="tel"
        />
        <Input
          label="Email address"
          type="email"
          value={values.recipient_email}
          onChange={(event) => set({ recipient_email: event.target.value })}
          error={errors.recipient_email}
          placeholder="joyce@example.com"
          hint="Optional. If given, we email them at every stage of the delivery."
        />
        <Input
          as="textarea"
          label="Delivery notes"
          value={values.notes}
          onChange={(event) => set({ notes: event.target.value })}
          placeholder="Call on arrival, leave at reception, fragile…"
          hint="Optional"
        />
      </Section>

      <Section title="Rider" caption="Request someone specific, or let operations choose.">
        <div className="grid gap-2.5 sm:grid-cols-2">
          <RiderChoice
            active={!values.preferred_courier_id}
            title="Any available rider"
            detail="Operations assign the best-placed rider"
            onSelect={() => set({ preferred_courier_id: null })}
          />
          {couriers.map((courier) => (
            <RiderChoice
              key={courier.id}
              active={values.preferred_courier_id === courier.id}
              title={courier.name}
              detail={`${courier.vehicle || 'Rider'} · ${courier.active_orders} active`}
              onSelect={() => set({ preferred_courier_id: courier.id })}
            />
          ))}
        </div>
        <p className="font-body text-xs text-slate-400">
          A requested rider is a preference. Operations confirm the final assignment, and both of
          you are notified either way.
        </p>
      </Section>
    </div>
  )
}

function RiderChoice({ active, title, detail, onSelect }) {
  return (
    <label
      className={[
        'flex cursor-pointer items-start gap-2.5 rounded-xl p-3.5 transition',
        'ring-1 ring-inset focus-within:ring-2 focus-within:ring-brand-500',
        active ? 'bg-brand-50 ring-brand-500' : 'bg-white ring-slate-200 hover:ring-slate-300',
      ].join(' ')}
    >
      <input
        type="radio"
        name="preferred_courier"
        checked={active}
        onChange={onSelect}
        className="mt-0.5 h-4 w-4 accent-brand-600"
      />
      <span>
        <span className="block font-display text-base font-semibold text-slate-900">{title}</span>
        <span className="block font-body text-sm text-slate-500">{detail}</span>
      </span>
    </label>
  )
}

function Section({ title, caption, children }) {
  return (
    <section className="flex flex-col gap-3.5">
      <div>
        <h2 className="font-display text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-0.5 font-body text-sm text-slate-500">{caption}</p>
      </div>
      <div className="flex flex-col gap-3.5">{children}</div>
    </section>
  )
}
