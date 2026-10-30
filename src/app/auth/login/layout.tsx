import { Suspense } from "react";
import LoginPage from "./page";

export default function LoginLayout() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
