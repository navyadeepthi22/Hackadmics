import { useState } from "react";
import { Lightbulb, ExternalLink, Calendar, MapPin, Globe, Newspaper, BookOpen, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const upcomingEvents = [
  {
    id: 1,
    title: "5-Day FDP on Deep Learning & NLP",
    organizer: "IIT Madras",
    date: "Apr 14–18, 2026",
    location: "Online",
    type: "FDP",
    relevance: 96,
    tags: ["AI", "Machine Learning", "NLP"],
    link: "#",
  },
  {
    id: 2,
    title: "International Webinar on Quantum Computing",
    organizer: "MIT & IEEE",
    date: "Apr 22, 2026",
    location: "Virtual",
    type: "Webinar",
    relevance: 91,
    tags: ["Quantum Computing", "Emerging Tech"],
    link: "#",
  },
  {
    id: 3,
    title: "National Seminar on Cybersecurity Trends 2026",
    organizer: "NIT Trichy",
    date: "May 5–6, 2026",
    location: "NIT Trichy, Tamil Nadu",
    type: "Seminar",
    relevance: 88,
    tags: ["Cybersecurity", "Network Security"],
    link: "#",
  },
  {
    id: 4,
    title: "Workshop on IoT & Edge Computing",
    organizer: "Anna University",
    date: "May 12–14, 2026",
    location: "Chennai",
    type: "Workshop",
    relevance: 85,
    tags: ["IoT", "Edge Computing"],
    link: "#",
  },
  {
    id: 5,
    title: "AICTE Sponsored FDP on Blockchain Technology",
    organizer: "VIT Vellore",
    date: "Jun 2–6, 2026",
    location: "Hybrid",
    type: "FDP",
    relevance: 82,
    tags: ["Blockchain", "Distributed Systems"],
    link: "#",
  },
  {
    id: 6,
    title: "International Conference on Data Science & AI",
    organizer: "Stanford University & ACM",
    date: "Jun 15–17, 2026",
    location: "Virtual",
    type: "Conference",
    relevance: 79,
    tags: ["Data Science", "AI", "Research"],
    link: "#",
  },
];

const newsItems = [
  {
    id: 1,
    title: "AICTE Announces New Guidelines for Faculty FDP Credits",
    source: "AICTE Official",
    date: "Mar 12, 2026",
    summary: "Faculty can now earn additional credits for completing AICTE-recognized FDPs in emerging technologies including AI, Blockchain, and Cybersecurity.",
    category: "Policy",
  },
  {
    id: 2,
    title: "UGC Mandates Digital Literacy Programs Across Universities",
    source: "UGC India",
    date: "Mar 10, 2026",
    summary: "Universities to implement mandatory digital literacy workshops for all faculty members by 2027.",
    category: "Policy",
  },
  {
    id: 3,
    title: "Top 10 Emerging Research Areas in Computer Science for 2026",
    source: "IEEE Spectrum",
    date: "Mar 8, 2026",
    summary: "Generative AI, quantum machine learning, and neuromorphic computing lead the list of trending research domains.",
    category: "Research",
  },
  {
    id: 4,
    title: "New Funding Opportunities for Faculty-Led Research Projects",
    source: "DST India",
    date: "Mar 5, 2026",
    summary: "Department of Science & Technology opens applications for grants up to ₹25 lakhs for interdisciplinary research projects.",
    category: "Funding",
  },
];

const researchSuggestions = [
  { area: "Explainable AI in Healthcare", trend: "Rising", papers: 342, relevance: 94 },
  { area: "Federated Learning for Privacy", trend: "Hot", papers: 218, relevance: 91 },
  { area: "Edge AI for Smart Cities", trend: "Rising", papers: 185, relevance: 87 },
  { area: "Sustainable Computing", trend: "Emerging", papers: 124, relevance: 83 },
];

const RecommendationsSection = () => {
  const [filterType, setFilterType] = useState<string>("all");

  const filteredEvents = filterType === "all"
    ? upcomingEvents
    : upcomingEvents.filter((e) => e.type === filterType);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-gamification" />
          Recommendations
        </h1>
        <p className="text-muted-foreground mt-1">
          Personalized suggestions based on your interests and activity
        </p>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events" className="font-display text-sm">
            <Calendar className="w-4 h-4 mr-1.5" /> Upcoming Events
          </TabsTrigger>
          <TabsTrigger value="news" className="font-display text-sm">
            <Newspaper className="w-4 h-4 mr-1.5" /> Latest News
          </TabsTrigger>
          <TabsTrigger value="research" className="font-display text-sm">
            <BookOpen className="w-4 h-4 mr-1.5" /> Research Trends
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Events Tab */}
        <TabsContent value="events" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filteredEvents.length} events matched to your interests</p>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="FDP">FDP</SelectItem>
                  <SelectItem value="Webinar">Webinar</SelectItem>
                  <SelectItem value="Seminar">Seminar</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">{event.type}</Badge>
                  <Badge className="bg-success/10 text-success border-0 text-xs font-display">{event.relevance}% match</Badge>
                </div>
                <h3 className="font-display font-semibold text-sm text-foreground mt-2">{event.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> {event.organizer}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full text-xs h-8">
                  <ExternalLink className="w-3 h-3 mr-1" /> View Details & Register
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* News Tab */}
        <TabsContent value="news" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">Latest updates relevant to your academic interests</p>
          <div className="space-y-3">
            {newsItems.map((news) => (
              <Card key={news.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gamification/30 text-gamification">
                        {news.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{news.date}</span>
                    </div>
                    <h3 className="font-display font-semibold text-sm text-foreground">{news.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{news.summary}</p>
                    <p className="text-xs text-primary mt-2 font-medium">Source: {news.source}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Research Trends Tab */}
        <TabsContent value="research" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">Trending research areas matching your profile</p>
          <div className="space-y-3">
            {researchSuggestions.map((research) => (
              <Card key={research.area} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-sm text-foreground">{research.area}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{research.papers} recent papers published</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`text-xs border-0 ${
                      research.trend === "Hot" ? "bg-destructive/10 text-destructive" :
                      research.trend === "Rising" ? "bg-gamification/10 text-gamification" :
                      "bg-primary/10 text-primary"
                    }`}>
                      {research.trend}
                    </Badge>
                    <p className="text-xs text-success font-display font-semibold mt-1">{research.relevance}% relevant</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecommendationsSection;
