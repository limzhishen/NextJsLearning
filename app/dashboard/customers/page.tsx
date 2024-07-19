import CustomersTable from 'app/ui/customers/table'
import { Metadata } from 'next'
import { lusitana } from '@/app/ui/fonts'
import Search from '@/app/ui/search'
import { Suspense } from 'react'
import { fetchFilteredCustomers } from '@/app/lib/data'


export const metadata:Metadata={
    title:'Customer'
}
export default async function Page({searchParams}:{
    searchParams?:{
        query?:string,
        page?: string;
    }
}) {
    const query=searchParams?.query||'';
    const customers=await fetchFilteredCustomers(query)
    return(
        <main>
            <CustomersTable customers={customers}/>
        </main>
    )
}