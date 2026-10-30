import { Suspense } from "react";
import RegisterPage from "./page";

export default function RegisterLayout() {
  return (
    <Suspense>
      <RegisterPage />
    </Suspense>
  );
}
