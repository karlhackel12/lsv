
import type { Config } from "tailwindcss";

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
				// Validation tool colors
				validation: {
					blue: {
						50: '#EEF2FF',
						100: '#D7E1FF',
						200: '#B0C3FF',
						300: '#89A4FF',
						400: '#6286FF',
						500: '#3B68FF',
						600: '#0A41FF',
						700: '#0035EB',
						800: '#002BC3',
						900: '#00229A'
					},
					gray: {
						50: '#F9FAFB',
						100: '#F2F4F7',
						200: '#E4E7EC',
						300: '#D0D5DD',
						400: '#98A2B3',
						500: '#667085',
						600: '#475467',
						700: '#344054',
						800: '#1D2939',
						900: '#101828'
					},
					green: {
						50: '#ECFDF5',
						100: '#D1FAE5',
						200: '#A6F4C5',
						300: '#6CE9A6',
						400: '#32D583',
						500: '#10B981',
						600: '#059669',
						700: '#047857',
						800: '#065F46',
						900: '#064E3B'
					},
					yellow: {
						50: '#FEF9C3',
						100: '#FEF08A',
						200: '#FDE047',
						300: '#EAB308',
						400: '#CA8A04',
						500: '#A16207',
						600: '#854D0E',
						700: '#713F12',
						800: '#422006',
						900: '#27150B'
					},
					red: {
						50: '#FEF2F2',
						100: '#FEE2E2',
						200: '#FECACA',
						300: '#FCA5A5',
						400: '#F87171',
						500: '#EF4444',
						600: '#DC2626',
						700: '#B91C1C',
						800: '#991B1B',
						900: '#7F1D1D'
					}
				}
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
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				slideUpFade: {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				slideDownFade: {
					from: { opacity: '0', transform: 'translateY(-10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				pulse: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				fadeIn: 'fadeIn 0.5s ease-out',
				slideUpFade: 'slideUpFade 0.4s ease-out',
				slideDownFade: 'slideDownFade 0.4s ease-out',
				pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			},
			boxShadow: {
				subtle: '0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1)',
				'subtle-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
				glass: '0 8px 32px rgba(0, 0, 0, 0.04)',
				'glass-md': '0 12px 40px rgba(0, 0, 0, 0.06)',
				elevation: '0 2px 4px rgba(0, 0, 0, 0.03), 0 10px 40px rgba(0, 0, 0, 0.06)'
			},
			fontFamily: {
				sans: ['SF Pro Display', 'SF Pro', 'system-ui', 'sans-serif'],
				mono: ['SF Mono', 'monospace']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
