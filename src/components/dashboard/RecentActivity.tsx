
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const activities = [
  {
    id: 1,
    user: "John Doe",
    action: "enrolled in Certificate Course",
    time: "2 hours ago",
    avatar: "/placeholder.svg"
  },
  {
    id: 2,
    user: "Mary Smith",
    action: "completed Diploma Program",
    time: "4 hours ago",
    avatar: "/placeholder.svg"
  },
  {
    id: 3,
    user: "David Wilson",
    action: "submitted project for Advanced Course",
    time: "6 hours ago",
    avatar: "/placeholder.svg"
  },
  {
    id: 4,
    user: "Sarah Johnson",
    action: "joined new class in Colombo",
    time: "8 hours ago",
    avatar: "/placeholder.svg"
  },
];

export const RecentActivity = () => {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activity.avatar} alt={activity.user} />
            <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {activity.user}
            </p>
            <p className="text-sm text-gray-500">
              {activity.action}
            </p>
          </div>
          <div className="text-sm text-gray-400">
            {activity.time}
          </div>
        </div>
      ))}
    </div>
  );
};
