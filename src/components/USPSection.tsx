
import { Palette, Scissors, Crown } from "lucide-react";

const USPSection = () => {
  const usps = [
    {
      icon: Palette,
      title: "TRIPPY MEETS STREET",
      subtitle: "Designs that vibe",
      description: "loud & glow harder."
    },
    {
      icon: Scissors,
      title: "OVERSIZED, NOT OVERHYPED",
      subtitle: "Custom cuts",
      description: "that flow with you."
    },
    {
      icon: Crown,
      title: "NO MASS DROPOUTS",
      subtitle: "Limited drops.",
      description: "No restocks."
    }
  ];

  return (
    <section className="py-20 bg-black/30 backdrop-blur-sm">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {usps.map((usp, index) => {
            const Icon = usp.icon;
            const gradientColors = [
              'from-neon-cyan to-neon-purple',
              'from-neon-purple to-neon-pink', 
              'from-neon-pink to-neon-cyan'
            ];
            const borderColors = ['border-neon-cyan/50', 'border-neon-purple/50', 'border-neon-pink/50'];
            const hoverBorderColors = ['hover:border-neon-cyan', 'hover:border-neon-purple', 'hover:border-neon-pink'];
            const textColors = ['group-hover:text-neon-cyan', 'group-hover:text-neon-purple', 'group-hover:text-neon-pink'];
            
            return (
              <div 
                key={index}
                className={`text-center p-8 rounded-2xl bg-black/40 border ${borderColors[index]} ${hoverBorderColors[index]} transition-all duration-300 group hover:scale-105 backdrop-blur-sm`}
              >
                <div className="mb-6 flex justify-center">
                  <div className={`p-4 rounded-full bg-gradient-to-br ${gradientColors[index]} bg-opacity-10 border border-opacity-20 group-hover:bg-opacity-20 transition-colors`}>
                    <Icon className={`h-8 w-8 text-white group-hover:text-transparent group-hover:bg-gradient-to-r ${gradientColors[index]} group-hover:bg-clip-text transition-all`} />
                  </div>
                </div>
                
                <h3 className={`text-xl font-anton mb-2 text-foreground ${textColors[index]} transition-colors`}>
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
