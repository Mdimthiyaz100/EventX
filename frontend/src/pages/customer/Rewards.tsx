import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Gift,
  Award,
  Share2,
  CheckCircle2,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Rewards() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = "EVENTX-IMTHI-500";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Breadcrumb */}
      <div className="border-b border-[#292929] bg-[#0A0A0A]">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-4 py-3.5 text-xs text-[#777777] sm:px-8 lg:px-12">
          <Link to="/" className="hover:text-white">Home</Link>
          <ChevronRight size={13} />
          <span className="text-white font-medium">Rewards & EventX Pass</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12">
        <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-8">
          Rewards & EventX Pass
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ================= LEFT: REWARDS DASHBOARD (5 cols) ================= */}
          <div className="lg:col-span-5 space-y-4">
            {/* Rewards Points Card */}
            <div className="rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#ED1C24]/20 text-[#ED1C24]">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#777777] uppercase">My Points Balance</h3>
                  <p className="font-display text-2xl font-black text-white">1,280 <span className="text-xs font-normal text-[#BDBDBD]">Points</span></p>
                </div>
              </div>
              <p className="mt-3 text-xs text-[#BDBDBD]">
                Earn 5% back in points on every movie and concert booking. 1 Point = ₹1 redeemable at checkout.
              </p>
            </div>

            {/* Coupons Card */}
            <div className="rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#16A34A]/20 text-[#16A34A]">
                  <Gift size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#777777] uppercase">Active Vouchers</h3>
                  <p className="font-display text-xl font-black text-white">5 Active Coupons</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-dashed border-[#292929] bg-[#0A0A0A] p-3 text-xs">
                  <div>
                    <span className="font-bold text-[#ED1C24]">EVENTX100</span>
                    <p className="text-[11px] text-[#777777]">Flat ₹100 off on concert bookings</p>
                  </div>
                  <span className="rounded bg-[#ED1C24]/10 px-2 py-0.5 text-[10px] font-bold text-[#ED1C24]">APPLIED</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-dashed border-[#292929] bg-[#0A0A0A] p-3 text-xs">
                  <div>
                    <span className="font-bold text-white">MOVIE50</span>
                    <p className="text-[11px] text-[#777777]">50% off on 2nd cinema ticket</p>
                  </div>
                  <span className="text-[10px] text-[#777777]">Expires in 12 days</span>
                </div>
              </div>
            </div>

            {/* Refer and Earn */}
            <div className="rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#ED1C24]/20 text-[#ED1C24]">
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#777777] uppercase">Refer & Earn</h3>
                  <p className="font-display text-xl font-black text-white">Get 500 Points</p>
                </div>
              </div>
              <p className="text-xs text-[#BDBDBD] mb-4">
                Invite friends to EventX. You both receive 500 reward points when they attend their first event.
              </p>
              <div className="flex items-center justify-between rounded-xl border border-[#292929] bg-[#0A0A0A] p-2.5 text-xs">
                <span className="font-mono font-bold text-white tracking-wider pl-2">{referralCode}</span>
                <button
                  onClick={handleCopy}
                  className="rounded-lg bg-[#ED1C24] px-3 py-1.5 text-[11px] font-bold uppercase text-white hover:bg-[#FF3038]"
                >
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: EVENTX PASS HERO (7 cols) ================= */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-[#ED1C24]/40 bg-gradient-to-br from-[#1A0A0B] via-[#111111] to-[#0A0A0A] p-8 shadow-2xl">
              {/* Decorative Glow */}
              <div className="absolute right-0 top-0 -mr-20 -mt-20 size-72 rounded-full bg-[#ED1C24]/20 blur-3xl pointer-events-none" />

              {/* Virtual Membership Card Banner */}
              <div className="relative mb-8 h-48 w-full rounded-2xl border border-[#ED1C24]/50 bg-gradient-to-r from-[#ED1C24] via-[#8B0E14] to-[#0A0A0A] p-6 shadow-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={22} className="text-white fill-white" />
                    <span className="font-display text-xl font-black tracking-wider text-white">EVENTX PASS</span>
                  </div>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    VIP TIER
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-white/70 block uppercase tracking-wider">Member Name</span>
                  <p className="font-bold text-white text-base">{user?.name || "Mohamed Imthiyaz"}</p>
                </div>
              </div>

              {/* Membership Benefits List */}
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white mb-4">
                Unlock Exclusive Benefits with EventX Pass
              </h2>

              <ul className="space-y-3 text-xs text-[#BDBDBD] mb-8">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#16A34A]" />
                  <span>Up to 10% instant cashback on all concert and event tickets.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#16A34A]" />
                  <span>Exclusive member-only pre-sale access before public announcements.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#16A34A]" />
                  <span>Priority booking and zero convenience fees on live comedy & theatre.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#16A34A]" />
                  <span>Complimentary dessert or beverage at participating partner restaurants.</span>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#292929] pt-6">
                <div>
                  <span className="text-[11px] text-[#777777] uppercase">Subscription Plan</span>
                  <p className="font-display text-3xl font-black text-white">₹299 <span className="text-xs font-normal text-[#777777]">/ month</span></p>
                </div>
                <button
                  onClick={() => alert("EventX Pass subscription initiated!")}
                  className="w-full sm:w-auto rounded-xl bg-[#ED1C24] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#ED1C24]/30 hover:bg-[#FF3038] transition"
                >
                  Get EventX Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
