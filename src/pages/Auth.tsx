import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Music, Shield, Users, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import sigegLogo from '@/assets/sigeg-logo-seal.png';

export default function Auth() {
  const [memberCode, setMemberCode] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Password visibility states - hidden by default
  const [showMemberCode, setShowMemberCode] = useState(false);
  const [showGroupCode, setShowGroupCode] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
  
  const { login, loginAnonymous, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (code: string, type: 'admin' | 'member' | 'group') => {
    if (!code.trim()) {
      setError('Por favor, insira o código de acesso');
      return;
    }

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
      
      if (result.error?.includes('Tempo esgotado')) {
        toast({
          title: "Conexão lenta",
          description: "Verifique sua internet e tente novamente.",
          variant: "destructive",
        });
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 
                    relative overflow-hidden flex items-center justify-center p-4">
      {/* Simplified decorative elements - removed blur-3xl for performance */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full opacity-50" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full opacity-50" />
      
      <div className="relative w-full max-w-md space-y-8 z-10">
        {/* Logo - optimized with fixed dimensions to prevent CLS */}
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-primary/20 rounded-full opacity-50" />
            <div className="relative w-24 h-24 bg-white rounded-full flex items-center 
                            justify-center shadow-lg p-1">
              <img 
                src={sigegLogo} 
                alt="SIGEG Logo" 
                width={88}
                height={88}
                className="w-[88px] h-[88px] object-contain"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
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

        {/* Login card */}
        <Card className="card-glass shadow-strong border-2 border-white/20 
                         animate-scale-in overflow-hidden">
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

              {/* MEMBER TAB */}
              <TabsContent value="member" className="space-y-4">
                <div className="relative">
                  <Input
                    type={showMemberCode ? "text" : "password"}
                    placeholder="Digite seu código de membro"
                    value={memberCode}
                    onChange={(e) => setMemberCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin(memberCode, 'member')}
                    disabled={loading}
                    className="input-modern h-12 text-base pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-muted/50"
                    onClick={() => setShowMemberCode(!showMemberCode)}
                    tabIndex={-1}
                  >
                    {showMemberCode ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={() => handleLogin(memberCode, 'member')}
                  disabled={loading}
                  variant="gradient"
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-bounce" 
                           style={{ animationDelay: "0s" }} />
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-bounce" 
                           style={{ animationDelay: "0.15s" }} />
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-bounce" 
                           style={{ animationDelay: "0.3s" }} />
                    </div>
                  ) : (
                    <>
                      <Users className="w-5 h-5 mr-2" />
                      Entrar como Membro
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* GROUP TAB */}
              <TabsContent value="group" className="space-y-4">
                <div className="relative">
                  <Input
                    type={showGroupCode ? "text" : "password"}
                    placeholder="Digite o código do grupo (ex: ABCD-EF)"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin(groupCode, 'group')}
                    disabled={loading}
                    className="input-modern h-12 text-base pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-muted/50"
                    onClick={() => setShowGroupCode(!showGroupCode)}
                    tabIndex={-1}
                  >
                    {showGroupCode ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={() => handleLogin(groupCode, 'group')}
                  disabled={loading}
                  variant="gradient"
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-bounce" 
                           style={{ animationDelay: "0s" }} />
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-bounce" 
                           style={{ animationDelay: "0.15s" }} />
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-bounce" 
                           style={{ animationDelay: "0.3s" }} />
                    </div>
                  ) : (
                    <>
                      <Music className="w-5 h-5 mr-2" />
                      Entrar como Grupo
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* ADMIN TAB */}
              <TabsContent value="admin" className="space-y-4">
                <div className="relative">
                  <Input
                    type={showAdminCode ? "text" : "password"}
                    placeholder="Digite seu código de administrador"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin(adminCode, 'admin')}
                    disabled={loading}
                    className="input-modern h-12 text-base pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-muted/50"
                    onClick={() => setShowAdminCode(!showAdminCode)}
                    tabIndex={-1}
                  >
                    {showAdminCode ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={() => handleLogin(adminCode, 'admin')}
                  disabled={loading}
                  variant="gradient-accent"
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-bounce" 
                           style={{ animationDelay: "0s" }} />
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-bounce" 
                           style={{ animationDelay: "0.15s" }} />
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-bounce" 
                           style={{ animationDelay: "0.3s" }} />
                    </div>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Entrar como Administrador
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            {/* Skip button for anonymous access */}
            <div className="pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                size="lg"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => loginAnonymous()}
              >
                Pular (modo anónimo)
              </Button>
            </div>
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