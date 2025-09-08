import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon,
  Music, 
  Plus, 
  Clock,
  MapPin,
  Users
} from "lucide-react";

interface Service {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  group: string;
}

export default function ServicesPage() {
  // Sample data for demonstration
  const [services] = useState<Service[]>([
    {
      id: "1",
      title: "Culto Dominical",
      date: "2024-02-04",
      time: "09:00",
      location: "Igreja Central",
      status: "confirmado",
      group: "Grupo de Luanda"
    },
    {
      id: "2", 
      title: "Apresentação Especial",
      date: "2024-02-10",
      time: "15:00",
      location: "Centro Cultural",
      status: "planejado",
      group: "Grupo de Benguela"
    },
    {
      id: "3",
      title: "Culto de Quarta",
      date: "2024-02-07",
      time: "19:00",
      location: "Igreja Local",
      status: "realizado",
      group: "Grupo de Luanda"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejado': return 'bg-blue-100 text-blue-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'realizado': return 'bg-gray-100 text-gray-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planejado': return 'Planejado';
      case 'confirmado': return 'Confirmado';
      case 'realizado': return 'Realizado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Serviços Musicais</h1>
            <p className="text-muted-foreground">
              Agende e gerencie os serviços musicais dos grupos
            </p>
          </div>
          
          <Button variant="gradient" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </Button>
        </div>

        {/* Coming Soon Notice */}
        <Card className="card-elevated border-dashed border-2 border-primary/30">
          <div className="p-8 text-center">
            <Music className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Funcionalidade em Desenvolvimento
            </h3>
            <p className="text-muted-foreground mb-6">
              O sistema de agendamento de serviços musicais será implementado nas próximas atualizações. 
              Por enquanto, você pode visualizar alguns exemplos abaixo.
            </p>
            <Badge variant="outline" className="text-primary">
              Próxima Fase
            </Badge>
          </div>
        </Card>

        {/* Sample Services - For demonstration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="card-elevated opacity-70">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {service.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {new Date(service.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.time}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge className={getStatusColor(service.status)}>
                        {getStatusLabel(service.status)}
                      </Badge>
                      <Badge variant="outline">
                        {service.group}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{service.location}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Future Features Preview */}
        <Card className="card-elevated">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Funcionalidades Futuras
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Agendamento</h4>
                <p className="text-sm text-muted-foreground">
                  Criar e agendar serviços musicais com data, hora e local
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Participantes</h4>
                <p className="text-sm text-muted-foreground">
                  Definir quais membros e partições participarão
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Repertório</h4>
                <p className="text-sm text-muted-foreground">
                  Anexar músicas e arranjos específicos para cada serviço
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Notificações</h4>
                <p className="text-sm text-muted-foreground">
                  Lembrar membros sobre ensaios e apresentações
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Calendário</h4>
                <p className="text-sm text-muted-foreground">
                  Visualização em calendário de todos os eventos
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Relatórios</h4>
                <p className="text-sm text-muted-foreground">
                  Estatísticas de participação e frequência
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}