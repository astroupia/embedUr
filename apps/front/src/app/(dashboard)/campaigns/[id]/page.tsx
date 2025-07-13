"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { campaignsApi, Campaign, CampaignAnalytics } from "@/lib/api/campaigns";
import {
  PlayIcon,
  PauseIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadCampaign();
      loadAnalytics();
    }
    // eslint-disable-next-line
  }, [id]);

  const loadCampaign = async () => {
    setLoading(true);
    try {
      const data = await campaignsApi.getCampaign(id);
      setCampaign(data);
    } catch (err: any) {
      setError("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await campaignsApi.getCampaignAnalytics(id);
      setAnalytics(data);
    } catch (err: any) {
      // ignore analytics error
    }
  };

  const handleActivate = async () => {
    setActionLoading(true);
    try {
      await campaignsApi.activateCampaign(id);
      loadCampaign();
    } catch (err) {
      setError("Failed to activate campaign");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    setActionLoading(true);
    try {
      await campaignsApi.pauseCampaign(id);
      loadCampaign();
    } catch (err) {
      setError("Failed to pause campaign");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    setActionLoading(true);
    try {
      await campaignsApi.deleteCampaign(id);
      router.push("/dashboard/campaigns");
    } catch (err) {
      setError("Failed to delete campaign");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }
  if (!campaign) {
    return <div className="text-center text-red-600">Campaign not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
          <p className="text-gray-500">{campaign.description}</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/campaigns/${campaign.id}/edit`}
            className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            <PencilIcon className="h-4 w-4 mr-1" /> Edit
          </Link>
          {campaign.status === "ACTIVE" ? (
            <button
              onClick={handlePause}
              disabled={actionLoading}
              className="inline-flex items-center px-3 py-2 text-sm bg-yellow-100 rounded hover:bg-yellow-200"
            >
              <PauseIcon className="h-4 w-4 mr-1" /> Pause
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={actionLoading}
              className="inline-flex items-center px-3 py-2 text-sm bg-green-100 rounded hover:bg-green-200"
            >
              <PlayIcon className="h-4 w-4 mr-1" /> Activate
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="inline-flex items-center px-3 py-2 text-sm bg-red-100 rounded hover:bg-red-200"
          >
            <TrashIcon className="h-4 w-4 mr-1" /> Delete
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-2">Details</h2>
          <div className="text-sm text-gray-700">
            <div><b>Status:</b> {campaign.status}</div>
            <div><b>Target Audience:</b> {campaign.targetAudience}</div>
            <div><b>Schedule:</b> {campaign.schedule.startDate} to {campaign.schedule.endDate || "-"} ({campaign.schedule.timezone})</div>
            <div><b>Max Emails/Day:</b> {campaign.settings.maxEmailsPerDay}</div>
            <div><b>Delay Between Emails:</b> {campaign.settings.delayBetweenEmails} sec</div>
            <div><b>Follow-up Sequence:</b> {campaign.settings.followUpSequence ? "Yes" : "No"}</div>
            <div className="mt-2"><b>Email Template:</b>
              <pre className="bg-gray-50 p-2 rounded mt-1 whitespace-pre-wrap">{campaign.emailTemplate}</pre>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-2">Analytics</h2>
          {analytics ? (
            <div className="text-sm text-gray-700 space-y-1">
              <div><b>Total Leads:</b> {analytics.metrics.totalLeads}</div>
              <div><b>Emails Sent:</b> {analytics.metrics.emailsSent}</div>
              <div><b>Opened:</b> {analytics.metrics.emailsOpened} ({analytics.metrics.openRate.toFixed(1)}%)</div>
              <div><b>Clicked:</b> {analytics.metrics.emailsClicked} ({analytics.metrics.clickRate.toFixed(1)}%)</div>
              <div><b>Replies:</b> {analytics.metrics.replies} ({analytics.metrics.replyRate.toFixed(1)}%)</div>
              <div><b>Bounces:</b> {analytics.metrics.bounces}</div>
            </div>
          ) : (
            <div className="text-gray-400">No analytics data</div>
          )}
        </div>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </div>
  );
} 