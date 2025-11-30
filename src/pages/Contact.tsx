import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Mail, User, ExternalLink, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreatorInfo {
  name: string;
  whatsapp: string;
  email: string;
  photo_url: string | null;
}

export default function Contact() {
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo>({
    name: "Manuel Bemvindo Mendes",
    whatsapp: "+244 927 800 658",
    email: "manuelbmendes01@gmail.com",
    photo_url: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreatorInfo();
  }, []);

  async function loadCreatorInfo() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'creator_info')
        .single();

      if (error) throw error;
      if (data?.value) {
        setCreatorInfo(data.value as unknown as CreatorInfo);
      }
    } catch (error) {
      console.error('Erro ao carregar informações:', error);
    } finally {
      setLoading(false);
    }
  }

  const whatsappNumber = creatorInfo.whatsapp.replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${whatsappNumber}`;
  const emailLink = `mailto:${creatorInfo.email}`;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Entra em contacto se precisar de ajuda ou esclarecimentos
          </p>
        </div>

        {/* Creator Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader className="text-center pb-2">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
              {creatorInfo.photo_url ? (
                <AvatarImage src={creatorInfo.photo_url} alt={creatorInfo.name} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl">
                <User className="w-10 h-10" />
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{creatorInfo.name}</CardTitle>
            <CardDescription className="text-base">
              Criador e Desenvolvedor do SIGEG-BV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* WhatsApp */}
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="hover:bg-green-500/10 hover:border-green-500/30 transition-all duration-300 cursor-pointer group">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <MessageCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">WhatsApp</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {creatorInfo.whatsapp}
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                </CardContent>
              </Card>
            </a>

            {/* Email */}
            <a 
              href={emailLink}
              className="block"
            >
              <Card className="hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-300 cursor-pointer group">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <Mail className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground break-all">
                      {creatorInfo.email}
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                </CardContent>
              </Card>
            </a>
          </CardContent>
        </Card>

        {/* About SIGEG */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sobre o SIGEG-BV</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              O SIGEG-BV (Sistema de Gestão de Grupos - Boa Vista) é uma plataforma completa para gestão de grupos musicais, oferecendo funcionalidades de gestão de membros, finanças, programas semanais e muito mais. Este sistema foi desenvolvido com dedicação para facilitar a organização e administração de grupos. Administre membros, organize eventos, solicite serviços como: Arranjos Musicais Automatizados, Acompanhamentos de Hinos, Revisão de Arranjos, e gere relatórios detalhados com segurança e praticidade.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}