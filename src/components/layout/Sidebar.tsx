
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  UserCheck,
  BarChart3,
  Settings,
  CalendarDays
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Classes", href: "/classes", icon: Calendar },
  { name: "Lecturers", href: "/lecturers", icon: GraduationCap },
  { name: "Lecturers Schedule", href: "/lecturers-schedule", icon: CalendarDays },
  { name: "Attendance", href: "/attendance", icon: UserCheck },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col fixed inset-y-0 z-50 bg-gray-900">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-xl font-bold text-white">Bible Studies</h1>
      </div>
      <nav className="flex flex-1 flex-col px-6 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                      location.pathname === item.href
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    )}
                  >
                    <item.icon className="h-6 w-6 shrink-0" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};
