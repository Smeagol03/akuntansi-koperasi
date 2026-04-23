import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
    Wallet,
    CreditCard,
    CalendarClock,
    Landmark,
    BookText,
    History,
    FilePieChart
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    dashboard,
    web_members_index,
    web_savings_index,
    web_loans_index,
    web_loans_schedules,
    web_cash_index,
    web_accounting_journals,
    web_accounting_ledger,
    web_accounting_reports
} from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Anggota',
        href: web_members_index(),
        icon: Users,
    },
    {
        title: 'Simpanan',
        href: web_savings_index(),
        icon: Wallet,
    },
    {
        title: 'Pinjaman',
        href: web_loans_index(),
        icon: CreditCard,
    },
    {
        title: 'Jadwal Angsuran',
        href: web_loans_schedules(),
        icon: CalendarClock,
    },
    {
        title: 'Kas & Bank',
        href: web_cash_index(),
        icon: Landmark,
    },
];

const accountingNavItems: NavItem[] = [
    {
        title: 'Jurnal Umum',
        href: web_accounting_journals(),
        icon: BookText,
    },
    {
        title: 'Buku Besar',
        href: web_accounting_ledger(),
        icon: History,
    },
    {
        title: 'Laporan Keuangan',
        href: web_accounting_reports(),
        icon: FilePieChart,
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar variant="inset" {...props} collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Platform" />
                <NavMain items={accountingNavItems} label="Akuntansi" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
