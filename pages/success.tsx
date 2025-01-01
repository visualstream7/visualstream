// pages/success.js
import { useRouter } from "next/router";
import Link from "next/link";

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <div className="bg-[#25384c] text-white py-4 px-6 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          VisualStream
        </Link>
      </div>

      {/* Success Content */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-6">
        <div className="bg-white p-10 rounded-lg shadow-xl border border-gray-300 max-w-lg w-full">
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-green-500 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2l4-4m5 4a9 9 0 11-18 0a9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your payment has been successfully processed.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-3 bg-[#25384c] text-white rounded-md shadow-lg hover:bg-[#2d435a] transition"
            >
              Go to Home
            </Link>
            <Link
              href="/orders"
              className="px-6 py-3 bg-gray-100 text-gray-800 rounded-md shadow-lg hover:bg-gray-200 border border-gray-300 transition"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </main>



    </div>
  );
}
