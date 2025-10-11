"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Store, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Shop {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  createdAt: string;
}

interface ShopManagementProps {
  organizationId?: string;
  userId?: string;
  isAdmin?: boolean;
  shops: Shop[];
  onShopsUpdate: () => void;
}

export function ShopManagement({ organizationId, userId, isAdmin, shops, onShopsUpdate }: ShopManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId || !userId) {
      setError("Missing required information");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: shopName,
          description: shopDescription,
          organizationId,
          adminUserId: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Shop created successfully!",
        });
        setIsCreateDialogOpen(false);
        setShopName("");
        setShopDescription("");
        onShopsUpdate();
      } else {
        setError(data.error || "Failed to create shop");
      }
    } catch (error) {
      setError("An error occurred while creating the shop");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Create Shop Dialog */}
      {isAdmin && (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className='mb-4'>
              <Plus className='h-4 w-4 mr-2' />
              Create New Shop
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-md'>
            <form onSubmit={handleCreateShop}>
              <DialogHeader>
                <DialogTitle>Create New Shop</DialogTitle>
                <DialogDescription>Add a new shop to your organization</DialogDescription>
              </DialogHeader>
              <div className='space-y-4 py-4'>
                {error && (
                  <Alert variant='destructive'>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className='space-y-2'>
                  <Label htmlFor='shopName'>Shop Name</Label>
                  <Input id='shopName' value={shopName} onChange={(e) => setShopName(e.target.value)} required placeholder='Enter shop name' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='shopDescription'>Description (Optional)</Label>
                  <Textarea id='shopDescription' value={shopDescription} onChange={(e) => setShopDescription(e.target.value)} placeholder='Describe this shop' rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button type='button' variant='outline' onClick={() => setIsCreateDialogOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type='submit' disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Shop"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Shops List */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {shops.length === 0 ? (
          <div className='col-span-full'>
            <Card>
              <CardContent className='p-8 text-center'>
                <Store className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>No shops yet</h3>
                <p className='text-gray-500 mb-4'>Get started by creating your first shop</p>
                {isAdmin && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className='h-4 w-4 mr-2' />
                    Create First Shop
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          shops.map((shop) => (
            <Card key={shop.id} className='hover:shadow-md transition-shadow'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Store className='h-5 w-5' />
                  <span>{shop.name}</span>
                </CardTitle>
                <CardDescription>{shop.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex items-center space-x-2 text-sm text-gray-500'>
                  <Calendar className='h-4 w-4' />
                  <span>Created: {new Date(shop.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
              <CardFooter>
                <div className='w-full'>
                  <p className='text-xs text-gray-400 mb-2'>Shop ID: {shop.id}</p>
                  <Button variant='outline' size='sm' className='w-full'>
                    Manage Shop
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      <div className='mt-8 p-4 bg-blue-50 rounded-lg'>
        <div className='flex items-center space-x-2'>
          <Store className='h-5 w-5 text-blue-600' />
          <span className='font-medium text-blue-900'>Shop Summary</span>
        </div>
        <div className='mt-2 text-sm text-blue-700'>
          <p>Total shops: {shops.length}</p>
          {isAdmin && <p>You have admin access to create and manage all shops.</p>}
        </div>
      </div>
    </div>
  );
}
