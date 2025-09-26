import { redirect } from 'next/navigation';
import { getServerClient } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './loginForm';

export default async function LoginPage() {
  const supabase = getServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (user) {
    redirect('/(admin)/dashboard');
  }
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
