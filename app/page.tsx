import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles, Brain, Lightbulb, Compass, PieChart, Activity } from "lucide-react"
import { MirrorLogo } from "@/components/mirror-logo"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container flex h-16 items-center justify-between py-4">
          <MirrorLogo size="md" />
          <nav className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Reflect, Learn, and <span className="mirror-gradient-text">Grow</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Mirror Mind helps you make better decisions through reflection and AI-powered insights.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/signup">
                  <Button size="lg" className="px-8">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-2 p-4">
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Capture Decisions</h3>
                <p className="text-muted-foreground">Record your decisions and the reasoning behind them.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4">
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">AI-Powered Insights</h3>
                <p className="text-muted-foreground">Get intelligent analysis of your decision patterns.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 p-4">
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  <Compass className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Learn and Improve</h3>
                <p className="text-muted-foreground">Track outcomes and refine your decision-making process.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter">How Mirror Mind Works</h2>
                <p className="text-muted-foreground">
                  Our AI analyzes your decisions to identify patterns, cognitive biases, and potential blind spots.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-1">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span>Record your decisions and the context around them</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-1">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span>Receive AI analysis highlighting cognitive biases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-1">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span>Track outcomes and learn from your past decisions</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <Link href="/signup">
                    <Button>Start Your Journal</Button>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="w-full max-w-md rounded-xl overflow-hidden shadow-lg border bg-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Decision Analysis</h3>
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <div className="h-2 w-2 rounded-full bg-primary/60"></div>
                      <div className="h-2 w-2 rounded-full bg-primary/30"></div>
                    </div>
                  </div>

                  {/* Chart visualization */}
                  <div className="relative h-[200px] mb-4">
                    {/* Chart grid lines */}
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                      {Array(16)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="border-t border-l border-border/20"></div>
                        ))}
                    </div>

                    {/* Line chart */}
                    <div className="absolute inset-0 flex items-end">
                      <div className="w-full h-full relative">
                        {/* Line chart path with gradient */}
                        <div className="absolute bottom-0 left-0 w-full h-full">
                          <svg viewBox="0 0 100 60" className="w-full h-full">
                            {/* Gradient definition */}
                            <defs>
                              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                              </linearGradient>
                            </defs>

                            {/* Area fill */}
                            <path
                              d="M0,60 L0,40 C10,35 20,45 30,35 C40,25 50,30 60,20 C70,10 80,15 90,5 L100,5 L100,60 Z"
                              fill="url(#chartGradient)"
                            />

                            {/* Line */}
                            <path
                              d="M0,40 C10,35 20,45 30,35 C40,25 50,30 60,20 C70,10 80,15 90,5"
                              fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {/* Data points */}
                            <circle cx="0" cy="40" r="2" fill="hsl(var(--primary))" />
                            <circle cx="30" cy="35" r="2" fill="hsl(var(--primary))" />
                            <circle cx="60" cy="20" r="2" fill="hsl(var(--primary))" />
                            <circle cx="90" cy="5" r="2" fill="hsl(var(--primary))" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chart legend and metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Decision Quality</span>
                      </div>
                      <div className="text-2xl font-bold">87%</div>
                      <div className="text-xs text-muted-foreground">+12% from last month</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <PieChart className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Bias Detection</span>
                      </div>
                      <div className="text-2xl font-bold">3</div>
                      <div className="text-xs text-muted-foreground">Biases identified</div>
                    </div>
                  </div>

                  {/* Mini charts at bottom */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="h-8 flex items-end">
                      <div className="w-1/5 h-3 bg-primary/20 rounded-sm"></div>
                      <div className="w-1/5 h-5 bg-primary/40 rounded-sm"></div>
                      <div className="w-1/5 h-7 bg-primary/60 rounded-sm"></div>
                      <div className="w-1/5 h-4 bg-primary/40 rounded-sm"></div>
                      <div className="w-1/5 h-6 bg-primary/80 rounded-sm"></div>
                    </div>
                    <div className="h-8 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-primary/30">
                          <div className="w-full h-full rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        </div>
                      </div>
                    </div>
                    <div className="h-8 flex items-end">
                      <div className="w-full h-full relative">
                        <svg viewBox="0 0 100 30" className="w-full h-full">
                          <path
                            d="M0,15 C10,10 20,20 30,15 C40,10 50,5 60,10 C70,15 80,20 90,15 L100,10"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container flex items-center justify-center py-6">
          <p className="text-center text-sm text-muted-foreground">© 2025 Mirror Mind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
