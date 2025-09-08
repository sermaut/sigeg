import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <Card className="card-elevated max-w-md w-full text-center shadow-strong">
        <div className="p-12">
          {/* 404 Icon */}
          <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl font-bold text-white">404</span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4">
            Página Não Encontrada
          </h1>
          
          <p className="text-muted-foreground mb-8 leading-relaxed">
            A página que você está procurando não existe ou foi movida. 
            Verifique o endereço ou retorne à página inicial.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="gradient" 
              size="lg" 
              onClick={() => window.location.href = '/'}
              className="shadow-medium"
            >
              <Home className="w-5 h-5" />
              Página Inicial
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Rota tentada: <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                {location.pathname}
              </code>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
