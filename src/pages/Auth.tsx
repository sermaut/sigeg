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
import { useLanguage } from '@/contexts/LanguageContext';

export default function Auth() {
  const { t } = useLanguage();
  const [memberCode, setMemberCode] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Password visibility states - hidden by default
  const [showMemberCode, setShowMemberCode] = useState(false);
  const [showGroupCode, setShowGroupCode] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
  
  const { login, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (code: string, type: 'admin' | 'member' | 'group') => {
    if (!code.trim()) {
      setError(t('auth.enterCode'));
      return;
    }

    const normalizedCode = code.trim().toUpperCase();
    
    setLoading(true);
    setError('');

    const result = await login(normalizedCode, type);
    
    if (result.success) {
      toast({
        title: t('auth.loginSuccess'),
        description: t('auth.welcome'),
      });
    } else {
      setError(result.error || t('error.general'));
      
      if (result.error?.includes('Tempo esgotado')) {
        toast({
          title: t('auth.slowConnection'),
          description: t('auth.checkInternet'),
          variant: "destructive",
        });
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 
                    relative overflow-hidden flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl 
                      animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl 
                      animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative w-full max-w-md space-y-8 z-10">
        {/* Logo */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative w-24 h-24 mx-auto group">
            <div className="absolute inset-0 gradient-primary rounded-full blur-xl opacity-50 
                            group-hover:opacity-100 transition-opacity animate-pulse" />
            <div className="relative w-24 h-24 bg-white rounded-full flex items-center 
                            justify-center shadow-strong hover:scale-110 transition-transform duration-500 p-1">
              <img src={sigegLogo} alt="SIGEG Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary to-accent 
                           bg-clip-text text-transparent">
              SIGEG-BV
            </h1>
            <p className="text-lg text-muted-foreground">{t('auth.managementSystem')}</p>
          </div>
        </div>

        {/* Login card */}
        <Card className="card-glass shadow-strong border-2 border-white/20 
                         animate-scale-in overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent 
                          via-primary to-transparent opacity-50" />
          
          <CardHeader className="space-y-1 pt-8">
            <CardTitle className="text-2xl text-center font-bold">{t('auth.systemAccess')}</CardTitle>
            <p className="text-center text-muted-foreground">
              {t('auth.enterAccessCode')}
            </p>
          </CardHeader>
          
          <CardContent className="pb-8">
            <Tabs defaultValue="member" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="member" 
                             className="flex items-center gap-2 rounded-lg data-[state=active]:gradient-primary 
                                       data-[state=active]:text-white transition-all duration-300">
                  <Users className="w-4 h-4" />
                  <span>{t('auth.member')}</span>
                </TabsTrigger>
                <TabsTrigger value="group"
                             className="flex items-center gap-2 rounded-lg data-[state=active]:gradient-primary 
                                       data-[state=active]:text-white transition-all duration-300">
                  <Music className="w-4 h-4" />
                  <span>{t('groups.title')}</span>
                </TabsTrigger>
                <TabsTrigger value="admin"
                             className="flex items-center gap-2 rounded-lg data-[state=active]:gradient-primary 
                                       data-[state=active]:text-white transition-all duration-300">
                  <Shield className="w-4 h-4" />
                  <span>{t('auth.admin')}</span>
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
                    placeholder={t('auth.enterMemberCode')}
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
                      {t('auth.loginAsMember')}
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* GROUP TAB */}
              <TabsContent value="group" className="space-y-4">
                <div className="relative">
                  <Input
                    type={showGroupCode ? "text" : "password"}
                    placeholder={t('auth.enterGroupCode')}
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
                      {t('auth.loginAsGroup')}
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* ADMIN TAB */}
              <TabsContent value="admin" className="space-y-4">
                <div className="relative">
                  <Input
                    type={showAdminCode ? "text" : "password"}
                    placeholder={t('auth.enterAdminCode')}
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
                      {t('auth.loginAsAdmin')}
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground space-y-1 animate-fade-in"
             style={{ animationDelay: '0.3s' }}>
          <p className="font-semibold">SIGEG © {new Date().getFullYear()}</p>
          <p>{t('auth.secureAccess')}</p>
        </div>
      </div>
    </div>
  );
}