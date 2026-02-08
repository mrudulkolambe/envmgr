"use client"

import Button from '@/components/app/button'
import AppHeader from '@/components/app/header'
import { useCallback, useEffect, useState } from 'react'
import OrganizationService from './service/organization.service'
import { toast } from 'sonner'
import { DataTable } from '@/components/app/data-table'
import { createColumns } from './components/columns'
import { OrganizationListItem } from './service/types/organization.list.response.types'
import OrgDialog from './components/orgdialog'


const OrganizationsPage = () => {
  const orgService = new OrganizationService();
  const [openDialog, setOpenDialog] = useState(false);

  const [data, setData] = useState<OrganizationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');

  const fetchOrganizations = async () => {
    await orgService.list({
      page: currentPage,
      limit: pageSize,
      search: searchValue
    }, {
      onLoading: setLoading,
      onSuccess: (res) => {
        setData(res.organizations);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      },
      onError: (message) => {
        toast.error(message);
      }
    });
  }

  useEffect(() => {
    fetchOrganizations();
  }, [currentPage, pageSize, searchValue]);

  const orgs = {
    state: {
      data,
      loading,
      currentPage,
      totalPages,
      total,
      pageSize,
    },
    setPage: setCurrentPage,
  };

  const columns = createColumns()

  return (
    <>
      <AppHeader
        title='Organizations'
        description='Manage your organizations'
      />

      <DataTable
        className='px-0 mt-4'
        pageSize={orgs.state.pageSize}
        loading={orgs.state.loading}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onRowClick={() => { }}
        searchPlaceholder='Search by Name...'
        button={{
          text: "Create Organization",
          onClick: () => setOpenDialog(true),
          variant: "default"
        }}
        currentPage={orgs.state.currentPage}
        totalPages={orgs.state.totalPages}
        totalCount={orgs.state.total}
        onPageChange={orgs.setPage}
        columns={columns}
        data={orgs.state.data}
      />
      <OrgDialog open={openDialog} setOpen={setOpenDialog} onSuccess={() => fetchOrganizations()} />
    </>
  )
}

export default OrganizationsPage