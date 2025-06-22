import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'anton': ['Anton', 'sans-serif'],
				'space-grotesk': ['Space Grotesk', 'sans-serif']
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Updated Bakwas brand colors with gradient mix
				neon: {
					cyan: '#00E1FF',
					purple: '#8B5CF6',
					pink: '#EC4899',
					orange: '#F97316',
					mix: '#4FACFE' // A blend color for primary use
				},
				'neon-cyan': '#00ffff',
				'neon-purple': '#8b5cf6',
				'neon-pink': '#ff0080',
				'neon-orange': '#ff8000',
			},
			backgroundImage: {
				'site-pattern': "linear-gradient(45deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6)), url('/lovable-uploads/17d662a3-8d8f-42c6-b921-9d219349c216.png')",
				'home': "url('/lovable-uploads/2cdd5801-8016-4547-9f0c-0eb54c786a12.png')",
				'shop': "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url('/lovable-uploads/197afee5-f1d5-4347-8941-04914c3b216b.png')",
				'general': "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url('/lovable-uploads/916479c0-6054-46da-be5d-703b6a87267c.png')",
				'dark-fallback': "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)"
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'psychedelic-pulse': {
					'0%, 100%': {
						transform: 'scale(1)',
						opacity: '1'
					},
					'50%': {
						transform: 'scale(1.05)',
						opacity: '0.8'
					}
				},
				'gradient-shift': {
					'0%, 100%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-20px)'
					}
				},
				'neon-pulse': {
					'0%, 100%': {
						transform: 'scale(0.95)',
						filter: 'drop-shadow(0 0 20px #ff0080) drop-shadow(0 0 40px #ff0080)'
					},
					'50%': {
						transform: 'scale(1)',
						filter: 'drop-shadow(0 0 30px #ff0080) drop-shadow(0 0 50px #ff0080)'
					}
				},
				'typewriter': {
					'0%': {
						width: '0'
					},
					'100%': {
						width: '100%'
					}
				},
				'slide-in-left': {
					'0%': {
						transform: 'translateX(-100px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'slide-in-right': {
					'0%': {
						transform: 'translateX(100px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'corner-pulse': {
					'0%, 100%': {
						opacity: '0.6'
					},
					'50%': {
						opacity: '1'
					}
				},
				'carousel-rotate': {
					'0%': {
						transform: 'rotateY(0deg)'
					},
					'100%': {
						transform: 'rotateY(360deg)'
					}
				},
				'card-float': {
					'0%, 100%': {
						transform: 'translateY(0px) rotateY(0deg)'
					},
					'50%': {
						transform: 'translateY(-10px) rotateY(5deg)'
					}
				},
				'swirl': {
					'0%': { 
						transform: 'rotate(0deg) scale(1)',
						background: 'conic-gradient(from 0deg, #ff0080, #00ffff, #8b5cf6, #ff8000, #ff0080)'
					},
					'25%': { 
						transform: 'rotate(90deg) scale(1.1)',
						background: 'conic-gradient(from 90deg, #00ffff, #8b5cf6, #ff8000, #ff0080, #00ffff)'
					},
					'50%': { 
						transform: 'rotate(180deg) scale(1.2)',
						background: 'conic-gradient(from 180deg, #8b5cf6, #ff8000, #ff0080, #00ffff, #8b5cf6)'
					},
					'75%': { 
						transform: 'rotate(270deg) scale(1.1)',
						background: 'conic-gradient(from 270deg, #ff8000, #ff0080, #00ffff, #8b5cf6, #ff8000)'
					},
					'100%': { 
						transform: 'rotate(360deg) scale(1)',
						background: 'conic-gradient(from 360deg, #ff0080, #00ffff, #8b5cf6, #ff8000, #ff0080)'
					}
				},
				'smoke-drift-1': {
					'0%': { 
						transform: 'translateX(-20px) translateY(0px) rotate(0deg)',
						opacity: '0.3'
					},
					'33%': { 
						transform: 'translateX(10px) translateY(-15px) rotate(120deg)',
						opacity: '0.6'
					},
					'66%': { 
						transform: 'translateX(-5px) translateY(-10px) rotate(240deg)',
						opacity: '0.4'
					},
					'100%': { 
						transform: 'translateX(-20px) translateY(0px) rotate(360deg)',
						opacity: '0.3'
					}
				},
				'smoke-drift-2': {
					'0%': { 
						transform: 'translateX(15px) translateY(-5px) rotate(0deg)',
						opacity: '0.2'
					},
					'50%': { 
						transform: 'translateX(-10px) translateY(-20px) rotate(180deg)',
						opacity: '0.5'
					},
					'100%': { 
						transform: 'translateX(15px) translateY(-5px) rotate(360deg)',
						opacity: '0.2'
					}
				},
				'smoke-drift-3': {
					'0%': { 
						transform: 'translateX(0px) translateY(10px) rotate(0deg)',
						opacity: '0.4'
					},
					'40%': { 
						transform: 'translateX(20px) translateY(-5px) rotate(144deg)',
						opacity: '0.7'
					},
					'80%': { 
						transform: 'translateX(-15px) translateY(-15px) rotate(288deg)',
						opacity: '0.3'
					},
					'100%': { 
						transform: 'translateX(0px) translateY(10px) rotate(360deg)',
						opacity: '0.4'
					}
				},
				'bob-drift': {
					'0%': { 
						transform: 'translateY(0px) translateX(0px)'
					},
					'25%': { 
						transform: 'translateY(-5px) translateX(5px)'
					},
					'50%': { 
						transform: 'translateY(-10px) translateX(10px)'
					},
					'75%': { 
						transform: 'translateY(-5px) translateX(5px)'
					},
					'100%': { 
						transform: 'translateY(0px) translateX(0px)'
					}
				},
				'glitch-sweep': {
					'0%': { 
						transform: 'translateX(-100%)',
						opacity: '0'
					},
					'10%': { 
						transform: 'translateX(-50%)',
						opacity: '0.8'
					},
					'20%': { 
						transform: 'translateX(0%)',
						opacity: '1'
					},
					'30%': { 
						transform: 'translateX(50%)',
						opacity: '0.8'
					},
					'40%': { 
						transform: 'translateX(100%)',
						opacity: '0'
					},
					'100%': { 
						transform: 'translateX(100%)',
						opacity: '0'
					}
				},
				'scanline': {
					'0%': { 
						transform: 'translateY(-100%)'
					},
					'100%': { 
						transform: 'translateY(100vh)'
					}
				},
				'sway-bob': {
					'0%, 100%': { 
						transform: 'translateX(0px) translateY(0px)' 
					},
					'25%': { 
						transform: 'translateX(8px) translateY(-6px)' 
					},
					'50%': { 
						transform: 'translateX(0px) translateY(-12px)' 
					},
					'75%': { 
						transform: 'translateX(-8px) translateY(-6px)' 
					}
				},
				'breathing-rock': {
					'0%, 100%': { 
						transform: 'rotateY(-5deg)' 
					},
					'50%': { 
						transform: 'rotateY(5deg)' 
					}
				},
				'icon-rotate': {
					'0%': { 
						transform: 'rotateY(0deg)' 
					},
					'100%': { 
						transform: 'rotateY(360deg)' 
					}
				},
				'glow-trail': {
					'0%': { 
						transform: 'scale(1) translateX(0px)',
						opacity: '0.3'
					},
					'50%': { 
						transform: 'scale(1.2) translateX(-10px)',
						opacity: '0.6'
					},
					'100%': { 
						transform: 'scale(1) translateX(0px)',
						opacity: '0.3'
					}
				},
				'border-pulse': {
					'0%, 100%': { 
						borderColor: 'rgba(199, 44, 255, 0.6)'
					},
					'50%': { 
						borderColor: 'rgba(199, 44, 255, 1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'psychedelic-pulse': 'psychedelic-pulse 3s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'neon-pulse': 'neon-pulse 4s ease-in-out infinite',
				'typewriter': 'typewriter 0.8s ease-out',
				'slide-in-left': 'slide-in-left 0.6s ease-out',
				'slide-in-right': 'slide-in-right 0.6s ease-out',
				'corner-pulse': 'corner-pulse 3s ease-in-out infinite',
				'carousel-rotate': 'carousel-rotate 60s linear infinite',
				'card-float': 'card-float 6s ease-in-out infinite',
				'swirl': 'swirl 20s linear infinite',
				'smoke-drift-1': 'smoke-drift-1 15s ease-in-out infinite',
				'smoke-drift-2': 'smoke-drift-2 18s ease-in-out infinite',
				'smoke-drift-3': 'smoke-drift-3 12s ease-in-out infinite',
				'bob-drift': 'bob-drift 6s ease-in-out infinite',
				'glitch-sweep': 'glitch-sweep 0.3s ease-out',
				'scanline': 'scanline 0.1s linear infinite',
				'sway-bob': 'sway-bob 8s ease-in-out infinite',
				'breathing-rock': 'breathing-rock 4s ease-in-out infinite',
				'icon-rotate': 'icon-rotate 10s linear infinite',
				'glow-trail': 'glow-trail 2s ease-in-out infinite',
				'border-pulse': 'border-pulse 4s ease-in-out infinite'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		plugin(function({ addUtilities, theme }) {
			const newUtilities = {
				'.text-shadow-cyan': {
					textShadow: `0 0 8px ${theme('colors.neon.cyan')}`,
				},
				'.text-shadow-pink': {
					textShadow: `0 0 8px ${theme('colors.neon.pink')}`,
				},
				'.text-shadow-purple': {
					textShadow: `0 0 8px ${theme('colors.neon.purple')}`,
				},
				'.text-shadow-orange': {
					textShadow: `0 0 8px ${theme('colors.neon.orange')}`,
				},
				'.text-shadow-white': {
					textShadow: '0 0 8px rgba(255, 255, 255, 0.7)',
				},
			}
			addUtilities(newUtilities)
		})
	],
} satisfies Config;
