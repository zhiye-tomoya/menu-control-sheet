"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function ToastTestPage() {
  return (
    <div className='container mx-auto py-12 space-y-6'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold mb-4'>Toast Message Types Demo</h1>
        <p className='text-muted-foreground'>Click the buttons below to see different toast message styles</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto'>
        <Button
          onClick={() =>
            toast({
              title: "Default Toast",
              description: "This is a default toast message.",
            })
          }
          variant='outline'
        >
          Default Toast
        </Button>

        <Button
          onClick={() =>
            toast.success({
              title: "Success!",
              description: "Operation completed successfully.",
            })
          }
          className='bg-green-600 hover:bg-green-700 text-white'
        >
          Success Toast
        </Button>

        <Button
          onClick={() =>
            toast.error({
              title: "Error",
              description: "Something went wrong. Please try again.",
            })
          }
          className='bg-red-600 hover:bg-red-700 text-white'
        >
          Error Toast
        </Button>

        <Button
          onClick={() =>
            toast.warning({
              title: "Warning",
              description: "Please check your input and try again.",
            })
          }
          className='bg-yellow-600 hover:bg-yellow-700 text-white'
        >
          Warning Toast
        </Button>

        <Button
          onClick={() =>
            toast.info({
              title: "Information",
              description: "Here's some helpful information for you.",
            })
          }
          className='bg-blue-600 hover:bg-blue-700 text-white'
        >
          Info Toast
        </Button>

        <Button
          onClick={() =>
            toast.destructive({
              title: "Destructive Action",
              description: "This action cannot be undone.",
            })
          }
          variant='destructive'
        >
          Destructive Toast
        </Button>
      </div>

      <div className='mt-12 text-center'>
        <div className='bg-muted p-6 rounded-lg max-w-2xl mx-auto'>
          <h3 className='text-lg font-semibold mb-3'>Usage Examples</h3>
          <div className='text-left space-y-2 text-sm'>
            <p>
              <code className='bg-background px-2 py-1 rounded'>toast.success({"{ title: 'Success!', description: '...' }"})</code>
            </p>
            <p>
              <code className='bg-background px-2 py-1 rounded'>toast.error({"{ title: 'Error', description: '...' }"})</code>
            </p>
            <p>
              <code className='bg-background px-2 py-1 rounded'>toast.warning({"{ title: 'Warning', description: '...' }"})</code>
            </p>
            <p>
              <code className='bg-background px-2 py-1 rounded'>toast.info({"{ title: 'Info', description: '...' }"})</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
