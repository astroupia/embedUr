"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { campaignsApi, CreateCampaignData } from "@/lib/api/campaigns";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateCampaignData>({
    name: "",
    description: "",
    targetAudience: "",
    emailTemplate: "",
    schedule: {
      startDate: "",
      endDate: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    settings: {
      maxEmailsPerDay: 100,
      delayBetweenEmails: 60,
      followUpSequence: false,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("schedule.")) {
      setForm((prev) => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [name.replace("schedule.", "")]: value,
        },
      }));
    } else if (name.startsWith("settings.")) {
      setForm((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          [name.replace("settings.", "")]: type === "checkbox" ? checked : Number(value),
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await campaignsApi.createCampaign(form);
      router.push("/dashboard/campaigns");
    } catch (err: any) {
      setError(err?.message || "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Create Campaign</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Target Audience</label>
          <input
            name="targetAudience"
            value={form.targetAudience}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Template</label>
          <textarea
            name="emailTemplate"
            value={form.emailTemplate}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            rows={4}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="schedule.startDate"
              value={form.schedule.startDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="schedule.endDate"
              value={form.schedule.endDate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Timezone</label>
            <input
              name="schedule.timezone"
              value={form.schedule.timezone}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Emails Per Day</label>
            <input
              type="number"
              name="settings.maxEmailsPerDay"
              value={form.settings.maxEmailsPerDay}
              onChange={handleChange}
              min={1}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Delay Between Emails (sec)</label>
            <input
              type="number"
              name="settings.delayBetweenEmails"
              value={form.settings.delayBetweenEmails}
              onChange={handleChange}
              min={0}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              name="settings.followUpSequence"
              checked={form.settings.followUpSequence}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">Enable Follow-up Sequence</label>
          </div>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
} 