import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, MessageSquare, Upload, ArrowLeft, ArrowRight } from "lucide-react";

type InterviewType = 'technical' | 'hr' | 'gd';

interface InterviewConfig {
  type: InterviewType;
  resume?: File;
  jobDescription: string;
  experience: string;
  role: string;
}

interface InterviewSetupProps {
  onStart: (config: InterviewConfig) => void;
  onBack: () => void;
}

export const InterviewSetup = ({ onStart, onBack }: InterviewSetupProps) => {
  const [config, setConfig] = useState<InterviewConfig>({
    type: 'technical',
    jobDescription: '',
    experience: '',
    role: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const interviewTypes = [
    {
      type: 'technical' as InterviewType,
      title: 'Technical Round',
      description: 'Coding, algorithms, system design, and technical knowledge',
      icon: FileText,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      type: 'hr' as InterviewType,
      title: 'HR Round',
      description: 'Behavioral questions, cultural fit, and soft skills',
      icon: Users,
      color: 'bg-green-500/10 text-green-400 border-green-500/20'
    },
    {
      type: 'gd' as InterviewType,
      title: 'Group Discussion',
      description: 'Communication, leadership, and collaborative thinking',
      icon: MessageSquare,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setConfig(prev => ({ ...prev, resume: file }));
    }
  };

  const handleStartInterview = () => {
    onStart({
      ...config,
      resume: resumeFile || undefined
    });
  };

  const isFormValid = config.jobDescription.trim() && config.experience.trim() && config.role.trim();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">Setup Your Interview</h1>
          <p className="text-xl text-muted-foreground">
            Provide your details to get personalized interview questions
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Interview Type Selection */}
          <div className="lg:col-span-3">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Select Interview Type
                </CardTitle>
                <CardDescription>
                  Choose the type of interview you want to practice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {interviewTypes.map((type) => (
                    <Card 
                      key={type.type}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-card ${
                        config.type === type.type 
                          ? `${type.color} border-2` 
                          : 'bg-card border-border hover:border-primary/20'
                      }`}
                      onClick={() => setConfig(prev => ({ ...prev, type: type.type }))}
                    >
                      <CardHeader className="text-center pb-2">
                        <type.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <CardTitle className="text-lg">{type.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-center text-sm">
                          {type.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resume Upload */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Resume (Optional)
                </CardTitle>
                <CardDescription>
                  Upload your resume for more personalized questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {resumeFile ? resumeFile.name : 'Click to upload your resume'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, DOCX up to 10MB
                    </p>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                  Paste the job description you're applying for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the job description here..."
                  value={config.jobDescription}
                  onChange={(e) => setConfig(prev => ({ ...prev, jobDescription: e.target.value }))}
                  className="min-h-32 bg-background/50"
                />
              </CardContent>
            </Card>

            {/* Experience Level */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Experience Level</CardTitle>
                <CardDescription>
                  Tell us about your professional experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={config.experience}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, experience: value }))}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fresher">Fresher (0-1 years)</SelectItem>
                    <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                    <SelectItem value="mid">Mid-level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (5-8 years)</SelectItem>
                    <SelectItem value="lead">Lead/Principal (8+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Target Role */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Target Role</CardTitle>
                <CardDescription>
                  What position are you interviewing for?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="e.g., Frontend Developer, Product Manager, Data Scientist"
                  value={config.role}
                  onChange={(e) => setConfig(prev => ({ ...prev, role: e.target.value }))}
                  className="bg-background/50"
                />
              </CardContent>
            </Card>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-card border-border/50 sticky top-6">
              <CardHeader>
                <CardTitle>Interview Summary</CardTitle>
                <CardDescription>
                  Review your setup before starting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Interview Type</Label>
                  <Badge className="ml-2 bg-primary/20 text-primary">
                    {interviewTypes.find(t => t.type === config.type)?.title}
                  </Badge>
                </div>
                
                {resumeFile && (
                  <div>
                    <Label className="text-sm font-medium">Resume</Label>
                    <p className="text-sm text-muted-foreground">{resumeFile.name}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium">Experience</Label>
                  <p className="text-sm text-muted-foreground">
                    {config.experience || 'Not specified'}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Target Role</Label>
                  <p className="text-sm text-muted-foreground">
                    {config.role || 'Not specified'}
                  </p>
                </div>

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full mt-6"
                  onClick={handleStartInterview}
                  disabled={!isFormValid}
                >
                  <ArrowRight className="h-4 w-4" />
                  Start Interview
                </Button>
                
                {!isFormValid && (
                  <p className="text-xs text-muted-foreground text-center">
                    Please fill in all required fields
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};