
import { Rainbow, Zap, Ban } from "lucide-react";

const USPSection = () => {
  const usps = [
    {
      icon: Rainbow,
      title: "TRIPPY MEETS STREET",
      subtitle: "Designs that vibe",
      description: "loud & glow harder."
    },
    {
      icon: Zap,
      title: "OVERSIZED, NOT OVERHYPED",
      subtitle: "Custom cuts",
      description: "that flow with you."
    },
    {
      icon: Ban,
      title: "NO MASS DROPOUTS",
      subtitle: "Limited drops.",
      description: "No restocks."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {usps.map((usp, index) => {
            const Icon = usp.icon;
            return (
              <div 
                key={index}
                className="text-center p-8 rounded-2xl bg-card border border-border/50 hover:border-neon-cyan/50 transition-all duration-300 group hover:scale-105"
              >
                <div className="mb-6 flex justify-center">
                  <div className="p-4 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 group-hover:bg-neon-cyan/20 transition-colors">
                    <Icon className="h-8 w-8 text-neon-cyan" />
                  </div>
                </div>
                
                <h3 className="text-xl font-anton mb-2 text-foreground group-hover:text-neon-cyan transition-colors">
                  {usp.title}
                </h3>
                <p className="text-lg font-space font-medium text-muted-foreground mb-1">
                  {usp.subtitle}
                </p>
                <p className="text-sm font-space text-muted-foreground">
                  {usp.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default USPSection;
