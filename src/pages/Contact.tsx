import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, User, ExternalLink, Phone } from "lucide-react";

export default function Contact() {
  const whatsappLink = "https://wa.me/244927800658";
  const emailLink = "mailto:manuelbmendes01@gmail.com";

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Contacto</h1>
          <p className="text-muted-foreground">
            Entre em contacto com o criador do SIGEG-BV
          </p>
        </div>

        {/* Creator Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Manuel Bemvindo Mendes</CardTitle>
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
                      +244 927 800 658
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
                      manuelbmendes01@gmail.com
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
              O SIGEG-BV (Sistema de Gestão de Grupos - Boa Vontade) é uma plataforma completa 
              para gestão de grupos musicais, oferecendo funcionalidades de gestão de membros, 
              finanças, programas semanais e muito mais. Desenvolvido com dedicação para 
              facilitar a organização e administração de grupos corais em Angola.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
