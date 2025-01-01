// pages/success.js
import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  return (
    <div>
      <h1>Payment Successful</h1>
      <p>Thank you for your purchase!</p>
      <p>Session ID: {session_id}</p>
    </div>
  );
}
