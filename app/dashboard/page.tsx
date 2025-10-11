"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, Store, Users, Settings, LogOut, Plus } from "lucide-react";
import { ShopManagement } from "@/components/shop-management";

interface Organization {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface Shop {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user?.organizationId) {
      fetchOrganizationData();
    }
  }, [session, status, router]);

  const fetchOrganizationData = async () => {
    try {
      const response = await fetch("/api/organizations");
      if (response.ok) {
        const data = await response.json();
        if (data.organizations && data.organizations.length > 0) {
          // For now, just get the first organization (would need proper filtering in real app)
          const org = data.organizations.find((o: Organization) => o.id === session?.user?.organizationId) || data.organizations[0];
          setOrganization(org);
        }
      }

      // Fetch shops
      const shopsResponse = await fetch(`/api/shops?organizationId=${session?.user?.organizationId}`);
      if (shopsResponse.ok) {
        const shopsData = await shopsResponse.json();
        setShops(shopsData.shops || []);
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
          <p className='mt-4'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center space-x-4'>
              <Building2 className='h-8 w-8 text-blue-600' />
              <div>
                <h1 className='text-xl font-semibold text-gray-900'>{organization?.name || "Organization Dashboard"}</h1>
                <p className='text-sm text-gray-500'>Welcome back, {session.user?.name}</p>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              {session.user?.isAdmin && <Badge variant='secondary'>Admin</Badge>}
              <Button variant='outline' size='sm' onClick={handleSignOut}>
                <LogOut className='h-4 w-4 mr-2' />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Organization Info */}
        <div className='mb-8'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Building2 className='h-5 w-5' />
                <span>Organization Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-medium text-gray-900'>{organization?.name}</h3>
                  <p className='text-sm text-gray-500'>{organization?.description || "No description"}</p>
                </div>
                <div className='flex items-center space-x-4 text-sm text-gray-500'>
                  <span>Organization ID: {organization?.id}</span>
                  <span>•</span>
                  <span>Created: {organization?.createdAt ? new Date(organization.createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Info */}
        <div className='mb-8'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Users className='h-5 w-5' />
                <span>Your Account</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <p>
                  <span className='font-medium'>Name:</span> {session.user?.name}
                </p>
                <p>
                  <span className='font-medium'>Email:</span> {session.user?.email}
                </p>
                <p>
                  <span className='font-medium'>Role:</span> {session.user?.isAdmin ? "Administrator" : "User"}
                </p>
                <p>
                  <span className='font-medium'>Access to shops:</span> {session.user?.shopIds?.length || 0} shop(s)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className='my-8' />

        {/* Shop Management */}
        <div>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center space-x-2'>
              <Store className='h-6 w-6' />
              <span>Shop Management</span>
            </h2>
          </div>

          <ShopManagement organizationId={session.user?.organizationId} userId={session.user?.id} isAdmin={session.user?.isAdmin} shops={shops} onShopsUpdate={fetchOrganizationData} />
        </div>

        {/* Quick Links */}
        <div className='mt-8'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>Quick Links</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Card className='hover:bg-gray-50 cursor-pointer transition-colors' onClick={() => router.push("/ingredients")}>
              <CardContent className='p-6'>
                <h3 className='font-medium'>Manage Ingredients</h3>
                <p className='text-sm text-gray-500 mt-1'>Add and manage ingredients for your recipes</p>
              </CardContent>
            </Card>
            <Card className='hover:bg-gray-50 cursor-pointer transition-colors' onClick={() => router.push("/")}>
              <CardContent className='p-6'>
                <h3 className='font-medium'>Menu Control</h3>
                <p className='text-sm text-gray-500 mt-1'>Create and manage your menu items</p>
              </CardContent>
            </Card>
            <Card className='hover:bg-gray-50 cursor-pointer transition-colors'>
              <CardContent className='p-6'>
                <h3 className='font-medium'>Reports</h3>
                <p className='text-sm text-gray-500 mt-1'>View cost analysis and reports</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
