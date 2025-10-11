"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function RegisterPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [organizationDescription, setOrganizationDescription] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Basic validation
    if (adminPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (adminPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationName,
          organizationDescription,
          adminName,
          adminEmail,
          adminPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Organization created successfully! You can now sign in.");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } else {
        setError(data.error || "Failed to create organization");
      }
    } catch (error) {
      setError("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center'>Create Organization</CardTitle>
          <CardDescription className='text-center'>Set up your organization and admin account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className='space-y-4'>
            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-gray-700'>Organization Details</h3>
              <div className='space-y-2'>
                <Label htmlFor='organizationName'>Organization Name</Label>
                <Input id='organizationName' value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} required placeholder='Enter organization name' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='organizationDescription'>Description (Optional)</Label>
                <Textarea id='organizationDescription' value={organizationDescription} onChange={(e) => setOrganizationDescription(e.target.value)} placeholder='Describe your organization' rows={3} />
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-gray-700'>Admin User Details</h3>
              <div className='space-y-2'>
                <Label htmlFor='adminName'>Admin Name</Label>
                <Input id='adminName' value={adminName} onChange={(e) => setAdminName(e.target.value)} required placeholder='Enter admin name' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='adminEmail'>Admin Email</Label>
                <Input id='adminEmail' type='email' value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required placeholder='Enter admin email' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='adminPassword'>Password</Label>
                <Input id='adminPassword' type='password' value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required placeholder='Enter password' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Confirm Password</Label>
                <Input id='confirmPassword' type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder='Confirm password' />
              </div>
            </div>
          </CardContent>
          <CardFooter className='flex flex-col space-y-4'>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? "Creating Organization..." : "Create Organization"}
            </Button>
            <div className='text-center text-sm'>
              Already have an account?{" "}
              <Link href='/auth/signin' className='text-blue-600 hover:underline'>
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
