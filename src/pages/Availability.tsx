import { Clock, Plus, X } from 'lucide-react';
import { useState } from 'react';

type DaySchedule = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

export default function Availability() {
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({
    monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    saturday: { enabled: false, startTime: '10:00', endTime: '14:00' },
    sunday: { enabled: false, startTime: '10:00', endTime: '14:00' },
  });

  const [activeTab, setActiveTab] = useState<
    'recurring' | 'custom' | 'blocked'
  >('recurring');

  const toggleDay = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], enabled: !schedule[day].enabled },
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#1A1A1A] mb-2">
            Availability
          </h1>
          <p className="text-[#4A4A4A]">
            Set your weekly schedule and manage your available time slots
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#E8E8E8]">
          <button
            onClick={() => setActiveTab('recurring')}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === 'recurring'
                ? 'text-[#0F766E]'
                : 'text-[#4A4A4A] hover:text-[#1A1A1A]'
            }`}
          >
            Recurring Weekly
            {activeTab === 'recurring' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F766E]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === 'custom'
                ? 'text-[#0F766E]'
                : 'text-[#4A4A4A] hover:text-[#1A1A1A]'
            }`}
          >
            Custom Dates
            {activeTab === 'custom' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F766E]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === 'blocked'
                ? 'text-[#0F766E]'
                : 'text-[#4A4A4A] hover:text-[#1A1A1A]'
            }`}
          >
            Blocked Times
            {activeTab === 'blocked' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F766E]" />
            )}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'recurring' && (
              <div className="bg-white rounded-lg border border-[#E8E8E8] p-6">
                <h2 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                  Weekly Schedule
                </h2>

                <div className="space-y-4">
                  {Object.entries(schedule).map(([day, config]) => (
                    <div
                      key={day}
                      className="flex items-center gap-4 pb-4 border-b border-[#E8E8E8] last:border-0"
                    >
                      {/* Day Toggle */}
                      <div className="w-32">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={() => toggleDay(day)}
                            className="w-5 h-5 rounded border-[#E8E8E8] 
                                     text-[#0F766E] focus:ring-[#0F766E]"
                          />
                          <span
                            className={`text-sm font-medium capitalize ${
                              config.enabled
                                ? 'text-[#1A1A1A]'
                                : 'text-[#B8B8B8]'
                            }`}
                          >
                            {day}
                          </span>
                        </label>
                      </div>

                      {/* Time Pickers */}
                      {config.enabled ? (
                        <div className="flex-1 flex items-center gap-3">
                          <input
                            type="time"
                            value={config.startTime}
                            onChange={(e) =>
                              setSchedule({
                                ...schedule,
                                [day]: {
                                  ...config,
                                  startTime: e.target.value,
                                },
                              })
                            }
                            className="px-3 py-2 border border-[#E8E8E8] rounded-lg 
                                     focus:outline-none focus:ring-2 focus:ring-[#0F766E] 
                                     focus:border-transparent text-[#1A1A1A]"
                          />
                          <span className="text-[#4A4A4A]">to</span>
                          <input
                            type="time"
                            value={config.endTime}
                            onChange={(e) =>
                              setSchedule({
                                ...schedule,
                                [day]: {
                                  ...config,
                                  endTime: e.target.value,
                                },
                              })
                            }
                            className="px-3 py-2 border border-[#E8E8E8] rounded-lg 
                                     focus:outline-none focus:ring-2 focus:ring-[#0F766E] 
                                     focus:border-transparent text-[#1A1A1A]"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 text-[#B8B8B8] text-sm">
                          Unavailable
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-[#E8E8E8]">
                  <button
                    type="button"
                    className="px-6 py-3 bg-[#0F766E] text-white rounded-lg 
                             hover:bg-[#134E4A] transition-colors font-medium"
                  >
                    Save Schedule
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="bg-white rounded-lg border border-[#E8E8E8] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[#1A1A1A]">
                    Custom Date Availability
                  </h2>
                  <button className="px-4 py-2 bg-[#0F766E] text-white rounded-lg hover:bg-[#134E4A] transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Custom Date
                  </button>
                </div>

                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-[#B8B8B8] mx-auto mb-3" />
                  <p className="text-[#B8B8B8]">
                    No custom dates set. Add specific dates to override your
                    weekly schedule.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'blocked' && (
              <div className="bg-white rounded-lg border border-[#E8E8E8] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[#1A1A1A]">
                    Blocked Time Slots
                  </h2>
                  <button className="px-4 py-2 bg-[#0F766E] text-white rounded-lg hover:bg-[#134E4A] transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Block Time
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Example blocked time */}
                  <div className="flex items-center justify-between p-4 bg-[#FAFAF9] rounded-lg border border-[#E8E8E8]">
                    <div>
                      <div className="font-medium text-[#1A1A1A]">
                        Lunch Break
                      </div>
                      <div className="text-sm text-[#4A4A4A]">
                        Every day, 12:00 PM - 1:00 PM
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded hover:bg-[#E8E8E8] flex items-center justify-center transition-colors">
                      <X className="w-4 h-4 text-[#B91C1C]" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-[#E8E8E8] p-6 sticky top-8">
              <h3 className="font-semibold text-[#1A1A1A] mb-4">
                This Week's Availability
              </h3>

              <div className="space-y-3">
                {Object.entries(schedule)
                  .filter(([, config]) => config.enabled)
                  .map(([day, config]) => (
                    <div
                      key={day}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm capitalize text-[#4A4A4A]">
                        {day}
                      </span>
                      <span className="text-sm font-medium text-[#15803D]">
                        {config.startTime} - {config.endTime}
                      </span>
                    </div>
                  ))}
              </div>

              {Object.values(schedule).filter((c) => c.enabled).length ===
                0 && (
                <p className="text-sm text-[#B8B8B8] text-center py-4">
                  No availability set
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
