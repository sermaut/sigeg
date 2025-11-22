import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { Building, Users, Music, BarChart3, ArrowRight, Check } from "lucide-react";
import heroImage from "@/assets/sigeg-hero.jpg";

export function HeroSection() {
  const features = [
    "Gestão completa de grupos musicais",
    "Controle de membros e hierarquia",
    "Sistema de permissões avançado",
    "Relatórios e estatísticas",
    "Interface intuitiva e responsiva"
  ];

  const stats = [
    { icon: Building, label: "Grupos Ativos", value: "1+" },
    { icon: Users, label: "Membros Registrados", value: "0+" },
    { icon: Music, label: "Serviços Musicais", value: "3" },
    { icon: BarChart3, label: "Relatórios", value: "10+" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-foreground">SIGEG</span>
                <span className="text-sm text-muted-foreground ml-2">
                  Sistema de Gestão de Grupos
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Input 
                placeholder="Código de membro..."
                className="w-48 bg-background/50"
              />
              <Button variant="gradient" size="lg">
                Entrar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  <span className="block sm:inline">Gerencie seus</span>
                  <span className="gradient-primary bg-clip-text text-transparent"> Grupos Musicais</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Sistema completo para administração de grupos, membros e atividades musicais 
                  em Angola. Controle hierárquico, relatórios avançados e interface intuitiva.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Button variant="gradient" size="lg" className="shadow-strong whitespace-nowrap">
                  Começar Agora
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button variant="outline" size="lg" className="whitespace-nowrap">
                  Ver Grupos
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="absolute inset-0 gradient-primary rounded-3xl opacity-10 blur-3xl transform rotate-6"></div>
              <Card className="card-elevated overflow-hidden shadow-strong">
                <OptimizedImage 
                  src={heroImage} 
                  alt="SIGEG Dashboard"
                  width={800}
                  height={600}
                  priority={true}
                  className="w-full h-auto rounded-xl"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-muted/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="card-elevated text-center">
                <div className="p-8">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubra como o SIGEG pode revolucionar a gestão do seu grupo musical
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-elevated">
              <div className="p-8 text-center">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Gestão de Grupos
                </h3>
                <p className="text-muted-foreground">
                  Cadastre e gerencie grupos por província, município e direção. 
                  Controle total sobre informações e hierarquia.
                </p>
              </div>
            </Card>

            <Card className="card-elevated">
              <div className="p-8 text-center">
                <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Controle de Membros
                </h3>
                <p className="text-muted-foreground">
                  Sistema completo de cadastro de membros com fotos, funções, 
                  partições musicais e permissões personalizadas.
                </p>
              </div>
            </Card>

            <Card className="card-elevated">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-warning/90 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Serviços Musicais
                </h3>
                <p className="text-muted-foreground">
                  Tablatura de flauta, solicitação de arranjos e avaliação 
                  de partituras integrados ao sistema.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-card/30">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">SIGEG</span>
          </div>
          <p className="text-muted-foreground mb-2">
            Sistema de Gestão de Grupos - Desenvolvido para Angola
          </p>
          <p className="text-sm text-muted-foreground">
            © 2024 SIGEG. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}