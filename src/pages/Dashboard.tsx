import { CalendarDays, Clock, Calendar, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const stats = [
    { label: 'Upcoming meetings', value: '3', icon: CalendarDays },
    { label: 'This week', value: '12 hrs', icon: Clock },
    { label: 'Pending requests', value: '2', icon: Calendar },
  ];

  const recentMeetings = [
    {
      id: 1,
      time: '2:00 PM',
      title: 'Product Review',
      participant: 'John Doe',
      status: 'Confirmed',
    },
    {
      id: 2,
      time: '3:30 PM',
      title: 'Team Sync',
      participant: 'Jane Smith',
      status: 'Confirmed',
    },
    {
      id: 3,
      time: '4:00 PM',
      title: 'Client Meeting',
      participant: 'Acme Corp',
      status: 'Confirmed',
    },
    {
      id: 4,
      time: '5:00 PM',
      title: 'Design Review',
      participant: 'Sarah Lee',
      status: 'Confirmed',
    },
  ];

  return (
    <div className="bg-white p-8 min-h-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="shadow-sm border-neutral-200 hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <Icon className="w-5 h-5 text-neutral-500" strokeWidth={1.5} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-neutral-950 mb-1 tracking-tight">
                  {stat.value}
                </div>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Meetings */}
      <Card className="shadow-sm border-neutral-200">
        <CardHeader>
          <CardTitle className="font-semibold text-neutral-950 text-lg">
            Recent Meetings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-neutral-200">
            {recentMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="px-6 py-4 flex items-center justify-between group hover:bg-neutral-50/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="px-3 py-1.5 bg-neutral-100 rounded text-xs text-neutral-700 font-medium">
                    {meeting.time}
                  </div>
                  <div className="flex-1">
                    <div className="text-neutral-950 font-medium text-sm">
                      {meeting.title}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {meeting.participant}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="bg-neutral-900 text-white hover:bg-neutral-800 font-normal"
                  >
                    {meeting.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 h-8 w-8"
                  >
                    <MoreVertical className="w-4 h-4 text-neutral-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
