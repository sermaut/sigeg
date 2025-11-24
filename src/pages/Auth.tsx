import { useState, useEffect } from 'react';
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
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Sessão persistente - não limpar ao montar
  }, []);

  // Redirect if already authenticated - sempre para Dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (code: string, type: 'admin' | 'member' | 'group') => {
    if (!code.trim()) {
      setError('Por favor, insira o código de acesso');
      return;
    }

    // Normalizar código
    const normalizedCode = code.trim().toUpperCase();
    
    setLoading(true);
    setError('');

    const result = await login(normalizedCode, type);
    
    if (result.success) {
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo ao SIGEG`,
      });
    } else {
      setError(result.error || 'Erro ao fazer login');
      
      // Sugerir limpar cache se for erro de verificação
      if (result.error?.includes('verificar código')) {
        toast({
          title: "Erro ao fazer login",
          description: "Se o problema persistir, tente limpar o cache do navegador.",
          variant: "destructive",
        });
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 
                    relative overflow-hidden flex items-center justify-center p-4">
      {/* Elementos decorativos animados */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl 
                      animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl 
                      animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative w-full max-w-md space-y-8 z-10">
        {/* Logo com animação de entrada */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative w-24 h-24 mx-auto group">
            <div className="absolute inset-0 gradient-primary rounded-3xl blur-xl opacity-50 
                            group-hover:opacity-100 transition-opacity animate-pulse" />
            <div className="relative w-24 h-24 gradient-primary rounded-3xl flex items-center 
                            justify-center shadow-strong hover:scale-110 transition-transform duration-500">
              <Music className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary to-accent 
                           bg-clip-text text-transparent">
              SIGEG-BV
            </h1>
            <p className="text-lg text-muted-foreground">Sistema de Gestão de Grupos</p>
          </div>
        </div>

        {/* Card de login com glass effect */}
        <Card className="card-glass shadow-strong border-2 border-white/20 
                         animate-scale-in overflow-hidden">
          {/* Brilho decorativo */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent 
                          via-primary to-transparent opacity-50" />
          
          <CardHeader className="space-y-1 pt-8">
            <CardTitle className="text-2xl text-center font-bold">Acesso ao Sistema</CardTitle>
            <p className="text-center text-muted-foreground">
              Entre com seu código de acesso
            </p>
          </CardHeader>
          
          <CardContent className="pb-8">
            <Tabs defaultValue="member" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="member" 
                             className="flex items-center gap-2 rounded-lg data-[state=active]:gradient-primary 
                                       data-[state=active]:text-white transition-all duration-300">
                  <Users className="w-4 h-4" />
                  <span>Membro</span>
                </TabsTrigger>
                <TabsTrigger value="group"
                             className="flex items-center gap-2 rounded-lg data-[state=active]:gradient-primary 
                                       data-[state=active]:text-white transition-all duration-300">
                  <Music className="w-4 h-4" />
                  <span>Grupo</span>
                </TabsTrigger>
                <TabsTrigger value="admin"
                             className="flex items-center gap-2 rounded-lg data-[state=active]:gradient-primary 
                                       data-[state=active]:text-white transition-all duration-300">
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" 
                       className="bg-destructive/10 border-destructive/50 animate-shake">
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
                    className="input-modern h-12 text-base"
                  />
                </div>
                <Button
                  onClick={() => handleLogin(memberCode, 'member')}
                  disabled={loading}
                  variant="gradient"
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Users className="w-5 h-5 mr-2" />
                  )}
                  Entrar como Membro
                </Button>
              </TabsContent>

              <TabsContent value="group" className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Digite o código do grupo (ex: ABCD-EF)"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin(groupCode, 'group')}
                    disabled={loading}
                    className="input-modern h-12 text-base"
                  />
                </div>
                <Button
                  onClick={() => handleLogin(groupCode, 'group')}
                  disabled={loading}
                  variant="gradient"
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Music className="w-5 h-5 mr-2" />
                  )}
                  Entrar como Grupo
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
                    className="input-modern h-12 text-base"
                  />
                </div>
                <Button
                  onClick={() => handleLogin(adminCode, 'admin')}
                  disabled={loading}
                  variant="gradient-accent"
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Shield className="w-5 h-5 mr-2" />
                  )}
                  Entrar como Administrador
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground space-y-1 animate-fade-in"
             style={{ animationDelay: '0.3s' }}>
          <p className="font-semibold">SIGEG © {new Date().getFullYear()}</p>
          <p>Acesso seguro com controle de permissões</p>
        </div>
      </div>
    </div>
  );
}