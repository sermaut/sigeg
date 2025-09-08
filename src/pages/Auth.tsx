import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Music, Shield, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [memberCode, setMemberCode] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (code: string, type: 'admin' | 'member') => {
    if (!code.trim()) {
      setError('Por favor, insira o código de acesso');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(code, type);
    
    if (result.success) {
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo ao SIGEG`,
      });
    } else {
      setError(result.error || 'Erro ao fazer login');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo e Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto gradient-primary rounded-2xl flex items-center justify-center shadow-medium">
            <Music className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-foreground">SIGEG-BV</h1>
            <p className="text-muted-foreground">Sistema de Gestão de Grupos - Boa Vista</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="card-elevated">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Acesso ao Sistema</CardTitle>
            <p className="text-center text-muted-foreground">
              Entre com seu código de acesso
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="member" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="member" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Membro</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Administrador</span>
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="member" className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Digite seu código de membro"
                    value={memberCode}
                    onChange={(e) => setMemberCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin(memberCode, 'member')}
                    disabled={loading}
                    className="transition-smooth"
                  />
                </div>
                <Button
                  onClick={() => handleLogin(memberCode, 'member')}
                  disabled={loading}
                  className="w-full transition-smooth"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Users className="w-4 h-4 mr-2" />
                  )}
                  Entrar como Membro
                </Button>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Digite seu código de administrador"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin(adminCode, 'admin')}
                    disabled={loading}
                    className="transition-smooth"
                  />
                </div>
                <Button
                  onClick={() => handleLogin(adminCode, 'admin')}
                  disabled={loading}
                  className="w-full transition-smooth"
                  variant="secondary"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Entrar como Administrador
                </Button>
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>SIGEG - Sistema de Gestão © {new Date().getFullYear()}</p>
          <p>Acesso seguro com controle de permissões</p>
        </div>
      </div>
    </div>
  );
}