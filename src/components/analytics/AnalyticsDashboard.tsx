import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  ArrowLeft, 
  Calendar,
  User,
  Brain,
  MessageSquare,
  FileText,
  Users
} from "lucide-react";

interface AnalyticsDashboardProps {
  onBackToHome: () => void;
}

export const AnalyticsDashboard = ({ onBackToHome }: AnalyticsDashboardProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  // Sample analytics data (in real app, this would come from API)
  const overallStats = {
    totalInterviews: 12,
    averageScore: 8.4,
    totalTimeSpent: 240, // minutes
    improvementRate: 23
  };

  const recentInterviews = [
    {
      id: 1,
      type: 'technical',
      role: 'Frontend Developer',
      score: 8.8,
      date: '2024-01-15',
      duration: 25,
      status: 'completed'
    },
    {
      id: 2,
      type: 'hr',
      role: 'Product Manager',
      score: 7.9,
      date: '2024-01-14',
      duration: 18,
      status: 'completed'
    },
    {
      id: 3,
      type: 'gd',
      role: 'Marketing Executive',
      score: 8.2,
      date: '2024-01-12',
      duration: 22,
      status: 'completed'
    },
    {
      id: 4,
      type: 'technical',
      role: 'Full Stack Developer',
      score: 9.1,
      date: '2024-01-10',
      duration: 32,
      status: 'completed'
    }
  ];

  const skillAnalysis = {
    technical: { score: 8.6, improvement: 15, weakness: 'System Design' },
    communication: { score: 8.2, improvement: 28, weakness: 'Clarity' },
    problemSolving: { score: 8.9, improvement: 12, weakness: 'Edge Cases' },
    leadership: { score: 7.8, improvement: 35, weakness: 'Decision Making' }
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'technical': return FileText;
      case 'hr': return Users;
      case 'gd': return MessageSquare;
      default: return Brain;
    }
  };

  const getInterviewTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-blue-500/20 text-blue-400';
      case 'hr': return 'bg-green-500/20 text-green-400';
      case 'gd': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBackToHome}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-primary" />
                Analytics Dashboard
              </h1>
              <p className="text-xl text-muted-foreground">
                Track your interview performance and improvement over time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Total Interviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">
                {overallStats.totalInterviews}
              </div>
              <div className="text-sm text-muted-foreground">
                +3 this month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Average Score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">
                {overallStats.averageScore}/10
              </div>
              <div className="text-sm text-green-400">
                +0.8 improvement
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Practiced
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">
                {formatDuration(overallStats.totalTimeSpent)}
              </div>
              <div className="text-sm text-muted-foreground">
                This month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Improvement Rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">
                +{overallStats.improvementRate}%
              </div>
              <div className="text-sm text-green-400">
                vs last month
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Score Distribution */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Overall Performance Score</CardTitle>
                  <CardDescription>
                    Your comprehensive interview performance rating
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary mb-2">
                      {overallStats.averageScore}
                    </div>
                    <div className="text-lg text-muted-foreground">out of 10</div>
                    <Badge className="mt-2 bg-green-500/20 text-green-400">
                      Excellent Performance
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Communication</span>
                      <span>8.2/10</span>
                    </div>
                    <Progress value={82} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Technical Skills</span>
                      <span>8.6/10</span>
                    </div>
                    <Progress value={86} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Problem Solving</span>
                      <span>8.9/10</span>
                    </div>
                    <Progress value={89} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Leadership</span>
                      <span>7.8/10</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Recent Interviews</CardTitle>
                  <CardDescription>
                    Your latest interview sessions and performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentInterviews.slice(0, 4).map((interview) => {
                    const Icon = getInterviewTypeIcon(interview.type);
                    return (
                      <div key={interview.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${getInterviewTypeColor(interview.type)} flex items-center justify-center`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{interview.role}</div>
                            <div className="text-xs text-muted-foreground">{interview.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{interview.score}/10</div>
                          <div className="text-xs text-muted-foreground">{interview.duration}min</div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interviews" className="space-y-6">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Interview History</CardTitle>
                <CardDescription>
                  Complete history of your interview sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInterviews.map((interview) => {
                    const Icon = getInterviewTypeIcon(interview.type);
                    return (
                      <div key={interview.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg ${getInterviewTypeColor(interview.type)} flex items-center justify-center`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="font-semibold">{interview.role}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {interview.type} Interview • {interview.date}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <div className="font-bold text-lg text-primary">{interview.score}/10</div>
                            <div className="text-xs text-muted-foreground">Score</div>
                          </div>
                          <div>
                            <div className="font-medium">{interview.duration}min</div>
                            <div className="text-xs text-muted-foreground">Duration</div>
                          </div>
                          <Badge className="bg-green-500/20 text-green-400">
                            {interview.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(skillAnalysis).map(([skill, data]) => (
                <Card key={skill} className="bg-gradient-card border-border/50">
                  <CardHeader>
                    <CardTitle className="capitalize">{skill}</CardTitle>
                    <CardDescription>
                      Performance analysis and improvement areas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-primary">{data.score}/10</span>
                      <Badge className="bg-green-500/20 text-green-400">
                        +{data.improvement}% improved
                      </Badge>
                    </div>
                    <Progress value={data.score * 10} className="h-3" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Focus area: </span>
                      <span className="font-medium">{data.weakness}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>
                  Track your improvement over time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Detailed performance charts and trend analysis will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};