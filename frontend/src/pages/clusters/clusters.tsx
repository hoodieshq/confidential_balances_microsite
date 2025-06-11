'use client'

import { FC, useState } from 'react'
import { ClusterModal, ClusterTable } from '@/entities/cluster/cluster'
import { DataTable } from '@/shared/ui/data-table'
import { Hero } from '@/shared/ui/hero'
import { Text } from '@/shared/ui/text'

export const Clusters: FC = () => {
  const [showModal, setShowModal] = useState(false)

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Text variant="header1">Clusuters</Text>
        <Text>Configure list of clusters to work with.</Text>
      </div>

      <div>
        <Hero title="Clusters" subtitle="Manage and select your Solana clusters">
          <ClusterModal show={showModal} hideModal={() => setShowModal(false)} />
          <button className="btn btn-xs lg:btn-md btn-primary" onClick={() => setShowModal(true)}>
            Add Cluster
          </button>
        </Hero>
        <ClusterTable />
      </div>
    </section>
  )
}
