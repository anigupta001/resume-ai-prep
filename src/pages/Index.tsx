import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, MessageSquare, BarChart3, Users, Clock, Target, Zap } from "lucide-react";
import { InterviewSetup } from "@/components/interview/InterviewSetup";
import { InterviewInterface } from "@/components/interview/InterviewInterface";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

type AppState = 'landing' | 'setup' | 'interview' | 'analytics';
type InterviewType = 'technical' | 'hr' | 'gd';

interface InterviewConfig {
  type: InterviewType;
  resume?: File;
  jobDescription: string;
  experience: string;
  role: string;
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Questions",
      description: "Dynamic questions based on your resume and role requirements"
    },
    {
      icon: MessageSquare,
      title: "Voice & Text Responses",
      description: "Answer questions through speech or text, your choice"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Get instant feedback and scoring on your performance"
    },
    {
      icon: Users,
      title: "Multiple Interview Types",
      description: "Technical, HR, and Group Discussion rounds available"
    }
  ];

  const interviewTypes = [
    {
      type: 'technical' as InterviewType,
      title: 'Technical Round',
      description: 'Coding, problem-solving, and technical knowledge assessment',
      icon: FileText,
      color: 'bg-blue-500/10 text-blue-400'
    },
    {
      type: 'hr' as InterviewType,
      title: 'HR Round',
      description: 'Behavioral questions, cultural fit, and soft skills evaluation',
      icon: Users,
      color: 'bg-green-500/10 text-green-400'
    },
    {
      type: 'gd' as InterviewType,
      title: 'Group Discussion',
      description: 'Communication skills, leadership, and collaborative thinking',
      icon: MessageSquare,
      color: 'bg-purple-500/10 text-purple-400'
    }
  ];

  const startInterview = (config: InterviewConfig) => {
    setInterviewConfig(config);
    setAppState('interview');
  };

  const completeInterview = () => {
    setAppState('analytics');
  };

  if (appState === 'setup') {
    return <InterviewSetup onStart={startInterview} onBack={() => setAppState('landing')} />;
  }

  if (appState === 'interview' && interviewConfig) {
    return <InterviewInterface config={interviewConfig} onComplete={completeInterview} />;
  }

  if (appState === 'analytics') {
    return <AnalyticsDashboard onBackToHome={() => setAppState('landing')} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">InterviewAI</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setAppState('analytics')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30" variant="outline">
              AI-Powered Interview Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Master Your Interview Skills
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Practice with AI-driven interviews tailored to your resume, experience, and target role.
              Get real-time feedback and improve your performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="lg" 
                onClick={() => setAppState('setup')}
                className="text-lg px-8 py-6"
              >
                <Zap className="h-5 w-5" />
                Start Interview Practice
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10"
              >
                <Target className="h-5 w-5" />
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose InterviewAI?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the next generation of interview preparation with our advanced AI technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="text-center">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interview Types Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Interview Types
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from different interview formats to match your preparation needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {interviewTypes.map((type) => (
              <Card key={type.type} className="bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center mb-4`}>
                    <type.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{type.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground mb-6">
                    {type.description}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setAppState('setup')}
                  >
                    <Clock className="h-4 w-4" />
                    Start {type.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-accent">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">10K+</div>
              <div className="text-primary-foreground/80 text-lg">Interviews Completed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">95%</div>
              <div className="text-primary-foreground/80 text-lg">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">8.5/10</div>
              <div className="text-primary-foreground/80 text-lg">Average Score Improvement</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-semibold">InterviewAI</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 InterviewAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
