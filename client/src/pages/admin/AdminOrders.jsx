import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import ErrorMessage from '@/components/ui/ErrorMessage'
import Input from '@/components/ui/Input'
import OrderTable from '@/components/orders/OrderTable'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import { PageContainer, PageHeader } from '@/components/layout/AppShell'
import { PageSpinner } from '@/components/ui/Spinner'
import {
  fetchAdminOrders,
  fetchCouriers,
  selectAdminOrderFilters,
  selectAdminOrders,
  selectAdminOrdersError,
  selectAdminOrdersMeta,
  selectAdminOrdersStatus,
  selectCouriersList,
  setAdminOrderFilters,
} from '@/features/admin/adminSlice'
import { STATUS_META } from '@/utils/constants'
import { useDebounce } from '@/hooks/useDebounce'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.entries(STATUS_META).map(([value, meta]) => ({ value, label: meta.label })),
]

export default function AdminOrders() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()

  const orders = useSelector(selectAdminOrders)
  const meta = useSelector(selectAdminOrdersMeta)
  const status = useSelector(selectAdminOrdersStatus)
  const error = useSelector(selectAdminOrdersError)
  const filters = useSelector(selectAdminOrderFilters)
  const couriers = useSelector(selectCouriersList)

  const [search, setSearch] = useState(filters.search)
  const debouncedSearch = useDebounce(search)

  useEffect(() => {
    dispatch(fetchCouriers())
    const initialStatus = searchParams.get('status')
    if (initialStatus) dispatch(setAdminOrderFilters({ status: initialStatus, page: 1 }))
  }, [dispatch, searchParams])

  useEffect(() => {
    dispatch(setAdminOrderFilters({ search: debouncedSearch, page: 1 }))
  }, [debouncedSearch, dispatch])

  useEffect(() => {
    dispatch(
      fetchAdminOrders({
        page: filters.page,
        per_page: 10,
        status: filters.status || undefined,
        courier_id: filters.courier_id || undefined,
        search: filters.search || undefined,
      }),
    )
  }, [dispatch, filters])

  const courierOptions = [
    { value: '', label: 'Any courier' },
    { value: 'unassigned', label: 'Unassigned only' },
    ...couriers.map((courier) => ({
      value: String(courier.id),
      label: `${courier.name} (${courier.active_orders} active)`,
    })),
  ]

  const isFiltered = Boolean(filters.status || filters.search || filters.courier_id)

  const clear = () => {
    setSearch('')
    dispatch(setAdminOrderFilters({ status: '', search: '', courier_id: '', page: 1 }))
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operations"
        title="All orders"
        description="Filter the board, assign couriers and correct anything that has gone sideways."
        actions={
          isFiltered ? (
            <Button variant="outline" onClick={clear}>
              Clear filters
            </Button>
          ) : null
        }
      />

      <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          label="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tracking code, address, customer"
        />
        <Select
          label="Status"
          value={filters.status}
          onChange={(event) => dispatch(setAdminOrderFilters({ status: event.target.value, page: 1 }))}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Courier"
          value={filters.courier_id}
          onChange={(event) =>
            dispatch(setAdminOrderFilters({ courier_id: event.target.value, page: 1 }))
          }
          options={courierOptions}
        />
      </div>

      <div className="mt-6">
        {status === 'loading' && <PageSpinner label="Loading orders" />}

        {status === 'failed' && (
          <ErrorMessage message={error} onRetry={() => dispatch(fetchAdminOrders({ page: 1 }))} />
        )}

        {status === 'ready' && orders.length === 0 && (
          <EmptyState
            icon="search"
            title="No orders matched"
            message="Adjust the filters or clear them to see the whole board."
            action={
              isFiltered ? (
                <Button variant="outline" onClick={clear}>
                  Clear filters
                </Button>
              ) : null
            }
          />
        )}

        {status === 'ready' && orders.length > 0 && (
          <>
            <OrderTable orders={orders} />
            <Pagination
              meta={meta}
              label="orders"
              onChange={(page) => dispatch(setAdminOrderFilters({ page }))}
            />
          </>
        )}
      </div>
    </PageContainer>
  )
}
