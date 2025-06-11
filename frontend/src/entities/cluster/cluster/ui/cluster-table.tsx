import { ComponentProps, FC, useMemo } from 'react'
import { Badge, Button } from '@solana-foundation/ms-tools-ui'
import { IconTrash } from '@tabler/icons-react'
import { Plus } from 'lucide-react'
import { useCluster } from '@/shared/solana'
import { DataTable } from '@/shared/ui/data-table'

type DataTableAction = NonNullable<ComponentProps<typeof DataTable>['actions']>[0]

export const ClusterTable: FC = () => {
  const { clusters, setCluster, deleteCluster } = useCluster()

  const actions = useMemo<DataTableAction[]>(() => {
    const list = [
      {
        action: 'add',
        title: 'Add cluster',
        icon: <Plus />,
        onClick: () => {},
      },
    ]
    return list
  }, [])

  return (
    <div className="overflow-x-auto">
      <DataTable
        title="Cluster Selector"
        labels={{
          empty: 'No clusters',
        }}
        headers={['Name', 'Network', 'Status', 'Actions']}
        actions={actions}
        rows={clusters.map((item) => {
          return [
            <span key={`clustername-${item.name}`} className="text-xl">
              {item?.active ? (
                item.name
              ) : (
                <button
                  title="Select cluster"
                  className="cursor-pointer"
                  onClick={() => setCluster(item)}
                >
                  {item.name}
                </button>
              )}
            </span>,
            <>
              <span className="text-xs">Network: {item.network ?? 'custom'}</span>
              <div className="text-xs whitespace-nowrap text-gray-500">{item.endpoint}</div>
            </>,
            item?.active ? (
              <Badge size="xxs" variant="success">
                Active
              </Badge>
            ) : (
              <></>
            ),
            <Button
              key={`clusteractions-${item.name}`}
              disabled={item?.active}
              variant="ghost"
              onClick={() => {
                if (!window.confirm('Are you sure?')) return
                deleteCluster(item)
              }}
            >
              <IconTrash size={16} />
            </Button>,
          ]
        })}
      />

      <table className="border-base-300 table border-separate border-4">
        <thead>
          <tr>
            <th>Name/ Network / Endpoint</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clusters.map((item) => (
            <tr key={item.name} className={item?.active ? 'bg-base-200' : ''}>
              <td className="space-y-2">
                <div className="space-x-2 whitespace-nowrap">
                  <span className="text-xl">
                    {item?.active ? (
                      item.name
                    ) : (
                      <button
                        title="Select cluster"
                        className="link link-secondary"
                        onClick={() => setCluster(item)}
                      >
                        {item.name}
                      </button>
                    )}
                  </span>
                </div>
                <span className="text-xs">Network: {item.network ?? 'custom'}</span>
                <div className="text-xs whitespace-nowrap text-gray-500">{item.endpoint}</div>
              </td>
              <td className="space-x-2 text-center whitespace-nowrap">
                <button
                  disabled={item?.active}
                  className="btn btn-xs btn-default btn-outline"
                  onClick={() => {
                    if (!window.confirm('Are you sure?')) return
                    deleteCluster(item)
                  }}
                >
                  <IconTrash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
