import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SubscriptionRoute from "@/components/subscription/SubscriptionRoute";

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