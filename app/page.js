import Image from "next/image";
import Link from "next/link";
import { FiCpu, FiZap, FiShield, FiBox, FiArrowRight, FiStar, FiMessageCircle, FiCode, FiActivity } from "react-icons/fi";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20 dark:border-gray-700/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl gradient-bg">
                <Image src="/next.svg" alt="YARSYA-AI" width={24} height={24} className="dark:invert" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">YARSYA-AI</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Intelligent Assistant</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                Features
              </a>
              <a href="#demo" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                Demo
              </a>
              <a href="#faq" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                FAQ
              </a>
              <Link href="/chat" className="btn-primary px-6 py-2 rounded-full font-medium flex items-center space-x-2 group">
                <span>Start Chat</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link href="/chat" className="btn-primary px-4 py-2 rounded-full text-sm">
                Chat
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-fade-in">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                  <span className="gradient-text">Smart AI Assistant</span>
                  <br />
                  <span className="text-gray-900 dark:text-white">for Everything</span>
                </h1>
                
                <p className="mx-auto max-w-3xl text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  YARSYA-AI adalah asisten virtual super cerdas yang mendukung 
                  <span className="text-blue-600 font-semibold"> LaTeX</span>, 
                  <span className="text-purple-600 font-semibold"> Markdown</span>, dan 
                  <span className="text-green-600 font-semibold"> code highlighting</span>.
                  Tanyakan apa saja dari sains hingga programming!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                  <Link href="/chat" className="btn-primary px-8 py-4 rounded-full text-lg font-semibold flex items-center space-x-3 group shadow-floating hover:shadow-xl">
                    <FiMessageCircle />
                    <span>Try Now - It's Free</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <a href="#features" className="btn-secondary px-8 py-4 rounded-full text-lg font-semibold flex items-center space-x-3">
                    <FiStar />
                    <span>See Features</span>
                  </a>
                </div>

                {/* Live Demo Preview */}
                <div className="mx-auto max-w-4xl">
                  <div className="relative rounded-2xl shadow-floating overflow-hidden">
                    <div className="absolute inset-0 gradient-bg opacity-10"></div>
                    <div className="relative glass p-8">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">YARSYA-AI Chat Interface</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <div className="message-user px-6 py-3 rounded-2xl rounded-tr-md max-w-xs">
                            <p>Jelaskan E=mc² dengan LaTeX</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-start">
                          <div className="message-ai px-6 py-4 rounded-2xl rounded-tl-md max-w-md">
                            <p className="mb-2">Persamaan Einstein yang terkenal:</p>
                            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm">
                              E = mc²
                            </div>
                            <p className="mt-2 text-sm">Energi sama dengan massa dikali kecepatan cahaya kuadrat</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 text-center">
                        <Link href="/chat" className="text-blue-600 hover:text-blue-700 font-medium">
                          Click here to start your own conversation →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-32 bg-white/50 dark:bg-gray-900/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Everything you need for intelligent conversations and problem-solving
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<FiCpu className="w-8 h-8" />}
                title="Super Smart"
                description="Advanced AI with deep knowledge in science, math, programming, and more. Get accurate, detailed answers."
                gradient="from-blue-500 to-blue-600"
              />
              
              <FeatureCard 
                icon={<FiZap className="w-8 h-8" />}
                title="Lightning Fast"
                description="Instant responses with modern UI. Smooth animations and seamless user experience."
                gradient="from-yellow-500 to-orange-500"
              />
              
              <FeatureCard 
                icon={<FiShield className="w-8 h-8" />}
                title="Rate Protected"
                description="Server-side rate limiting (3 rps) ensures stable performance and prevents abuse."
                gradient="from-green-500 to-emerald-500"
              />
              
              <FeatureCard 
                icon={<FiBox className="w-8 h-8" />}
                title="Ready to Use"
                description="Full-stack solution. Just deploy and start using. No complex setup required."
                gradient="from-purple-500 to-pink-500"
              />
            </div>

            {/* Technical Features */}
            <div className="mt-20">
              <h3 className="text-2xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                Technical Capabilities
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <TechFeature 
                  icon={<FiActivity />}
                  title="LaTeX & Math"
                  description="Full LaTeX support for complex mathematical equations and formulas"
                />
                
                <TechFeature 
                  icon={<FiCode />}
                  title="Code Highlighting"
                  description="Syntax highlighting for all major programming languages"
                />
                
                <TechFeature 
                  icon={<FiMessageCircle />}
                  title="Markdown Support"
                  description="Rich text formatting with full Markdown compatibility"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="glass rounded-3xl p-8 lg:p-12 shadow-floating">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Ready to Get Started?
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    Join thousands of users who are already using YARSYA-AI for learning, 
                    problem-solving, and getting instant expert answers.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">No registration required</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">Instant responses</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">Mobile-friendly interface</span>
                    </div>
                  </div>
                  
                  <Link href="/chat" className="btn-primary px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center space-x-3">
                    <span>Start Chatting Now</span>
                    <FiArrowRight />
                  </Link>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 gradient-bg rounded-2xl transform rotate-6"></div>
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-floating">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
                        <FiCpu className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold">YARSYA-AI</span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <p>Ask me anything about:</p>
                      <ul className="space-y-1 ml-4">
                        <li>• Mathematics & Physics</li>
                        <li>• Programming & Code</li>
                        <li>• Science & Research</li>
                        <li>• General Knowledge</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 sm:py-32 bg-white/50 dark:bg-gray-900/50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-8">
              <FAQItem 
                question="Does it support LaTeX, symbols, and code?"
                answer="Yes! YARSYA-AI fully supports LaTeX mathematical notation, Unicode symbols, Markdown formatting, and syntax highlighting for all major programming languages."
              />
              
              <FAQItem 
                question="What about rate limits and performance?"
                answer="The server implements a token bucket rate limiter allowing 3 requests per second for stability. This ensures consistent performance for all users."
              />
              
              <FAQItem 
                question="Is it free to use?"
                answer="Yes, YARSYA-AI is completely free to use. No registration, no hidden fees, no premium plans. Just start chatting!"
              />
              
              <FAQItem 
                question="What languages are supported?"
                answer="YARSYA-AI primarily operates in Indonesian (Bahasa Indonesia) but can understand and respond in multiple languages including English."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-12 bg-white/80 dark:bg-gray-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="p-2 rounded-xl gradient-bg">
                <Image src="/next.svg" alt="logo" width={20} height={20} className="dark:invert" />
              </div>
              <div>
                <span className="font-bold gradient-text">YARSYA-AI</span>
                <p className="text-xs text-gray-500">© {new Date().getFullYear()} All rights reserved</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/chat" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Start Chat
              </Link>
              <a href="#features" className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Features
              </a>
              <a href="#faq" className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                FAQ
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 gradient-bg rounded-2xl transform group-hover:scale-105 transition-transform opacity-10"></div>
      <div className="relative glass rounded-2xl p-8 h-full shadow-elegant hover:shadow-floating transition-all">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${gradient} text-white mb-4`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function TechFeature({ icon, title, description }) {
  return (
    <div className="text-center group">
      <div className="inline-flex p-4 rounded-2xl gradient-bg text-white mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h4>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function FAQItem({ question, answer }) {
  return (
    <div className="glass rounded-2xl p-6 shadow-elegant">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{question}</h4>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{answer}</p>
    </div>
  );
}
