import { useState } from "react";
import { Lightbulb, ExternalLink, Calendar, MapPin, Globe, Newspaper, BookOpen, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";

const RecommendationsSection = () => {
  const [filterType, setFilterType] = useState<string>("all");
  const { getRecommendedEvents, getRecommendedNews, getRecommendedResearch } = useAppStore();

  const events = getRecommendedEvents();
  const news = getRecommendedNews();
  const research = getRecommendedResearch();

  const filteredEvents = filterType === "all"
    ? events
    : events.filter((e) => e.type === filterType);

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
                  <SelectItem value="Hackathon">Hackathon</SelectItem>
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
            {news.map((item) => (
              <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gamification/30 text-gamification">
                        {item.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                      <Badge className="bg-success/10 text-success border-0 text-[10px]">{item.relevance}% relevant</Badge>
                    </div>
                    <h3 className="font-display font-semibold text-sm text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.summary}</p>
                    <p className="text-xs text-primary mt-2 font-medium">Source: {item.source}</p>
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
            {research.map((item) => (
              <Card key={item.area} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-sm text-foreground">{item.area}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.papers} recent papers published</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`text-xs border-0 ${
                      item.trend === "Hot" ? "bg-destructive/10 text-destructive" :
                      item.trend === "Rising" ? "bg-gamification/10 text-gamification" :
                      "bg-primary/10 text-primary"
                    }`}>
                      {item.trend}
                    </Badge>
                    <p className="text-xs text-success font-display font-semibold mt-1">{item.relevance}% relevant</p>
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
