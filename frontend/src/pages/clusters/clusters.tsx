'use client'

import { FC, useState } from 'react'
import { ClusterModal, ClusterTable } from '@/entities/cluster/cluster'
import { Text } from '@/shared/ui/text'

export const Clusters: FC = () => {
  const [showModal, setShowModal] = useState(false)

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Text variant="header1">Clusuters</Text>
        <Text>Configure list of clusters to work with.</Text>
      </div>

      <ClusterModal show={showModal} hideModal={() => setShowModal(false)} />
      <ClusterTable onAddCluster={() => setShowModal(true)} />
    </section>
  )
}
