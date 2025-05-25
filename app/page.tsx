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
                <Button variant="ghost" className="max-sm:px-2.5">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button className="max-sm:px-2.5">Sign Up</Button>
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
                    Pause • Ponder • <span className="mirror-gradient-text">Thrive</span>
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
                      <h3 className="font-semibold text-lg">Your Progress</h3>
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <div className="h-2 w-2 rounded-full bg-primary/60"></div>
                        <div className="h-2 w-2 rounded-full bg-primary/30"></div>
                      </div>
                    </div>

                    <div className="relative h-[200px] mb-4">
                      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                        {Array(16)
                            .fill(0)
                            .map((_, i) => (
                                <div key={i} className="border-t border-l border-border/20"></div>
                            ))}
                      </div>

                      <div className="absolute inset-0 flex items-end">
                        <div className="w-full h-full relative">
                          <div className="absolute bottom-0 left-0 w-full h-full">
                            <svg viewBox="0 0 100 60" className="w-full h-full">
                              <defs>
                                <linearGradient id="improvementGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                                </linearGradient>
                              </defs>

                              <path
                                  d="M0,60 L0,50 C15,45 25,40 35,35 C50,28 65,22 80,18 C90,15 95,12 100,10 L100,60 Z"
                                  fill="url(#improvementGradient)"
                              />

                              <path
                                  d="M0,50 C15,45 25,40 35,35 C50,28 65,22 80,18 C90,15 95,12 100,10"
                                  fill="none"
                                  stroke="hsl(var(--primary))"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                              />

                              <path
                                  d="M0,25 C15,28 25,30 35,32 C50,35 65,40 80,45 C90,48 95,50 100,52"
                                  fill="none"
                                  stroke="hsl(var(--muted-foreground))"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeDasharray="4,4"
                              />

                              <circle cx="0" cy="50" r="2.5" fill="hsl(var(--primary))" />
                              <circle cx="35" cy="35" r="2.5" fill="hsl(var(--primary))" />
                              <circle cx="80" cy="18" r="2.5" fill="hsl(var(--primary))" />
                              <circle cx="100" cy="10" r="2.5" fill="hsl(var(--primary))" />

                              <circle cx="0" cy="25" r="2" fill="hsl(var(--muted-foreground))" />
                              <circle cx="35" cy="32" r="2" fill="hsl(var(--muted-foreground))" />
                              <circle cx="80" cy="45" r="2" fill="hsl(var(--muted-foreground))" />
                              <circle cx="100" cy="52" r="2" fill="hsl(var(--muted-foreground))" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-2 left-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-0.5 bg-primary rounded"></div>
                          <span>Decision Quality</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-0.5 bg-muted-foreground rounded border-dashed border border-muted-foreground"></div>
                          <span>Cognitive Biases</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-primary">Cleaner Decisions</span>
                        </div>
                        <div className="text-2xl font-bold text-primary">+47%</div>
                        <div className="text-xs text-primary/80">Quality improvement</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <PieChart className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">Bias Reduction</span>
                        </div>
                        <div className="text-2xl font-bold text-muted-foreground">-63%</div>
                        <div className="text-xs text-muted-foreground/80">Fewer blind spots</div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-primary">Your Journey</span>
                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">Improving</span>
                      </div>
                      <p className="text-xs text-primary/90">Making clearer decisions with 47% less bias</p>
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
