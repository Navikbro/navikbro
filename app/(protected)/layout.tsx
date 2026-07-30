import ProtectedRoute from "@/components/ProtectedRoute";
import SubscriptionRoute from "@/components/SubscriptionRoute";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>

      <SubscriptionRoute>
        {children}
      </SubscriptionRoute>

    </ProtectedRoute>
  );
}