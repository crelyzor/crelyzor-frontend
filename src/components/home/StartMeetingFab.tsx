import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, AudioLines, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function StartMeetingFab() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 350,
              }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-[320px] px-4"
            >
              <div className="bg-[#1C1C1E] border border-white/5 rounded-[28px] p-2 shadow-2xl flex flex-col gap-2">
                {/* Start Meeting Button */}
                <Button
                  variant="default"
                  onClick={() => navigate('/meetings/create')}
                  className="h-14 w-full bg-white text-black hover:bg-neutral-100 rounded-[20px] text-[15px] font-medium shadow-none active:scale-[0.98] transition-all"
                >
                  <AudioLines className="w-5 h-5 mr-2.5" />
                  Start meeting
                </Button>

                {/* Join as Bot Button */}
                <Button
                  variant="ghost"
                  disabled
                  className="h-14 w-full bg-[#2C2C2E] text-neutral-400 hover:bg-[#3A3A3C] hover:text-neutral-300 rounded-[20px] text-[15px] font-medium justify-between px-6 opacity-60 cursor-not-allowed"
                >
                  <span>Join as a bot</span>
                  <div className="flex -space-x-1.5 opacity-80 grayscale">
                    {/* Placeholder icons for Zoom, Meet, Teams */}
                    <div className="w-5 h-5 rounded-full bg-[#2D8CFF] flex items-center justify-center border border-[#2C2C2E]">
                      <Video className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="w-5 h-5 rounded-full bg-[#00AC47] flex items-center justify-center border border-[#2C2C2E]">
                      <Video className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="w-5 h-5 rounded-full bg-[#7B83EB] flex items-center justify-center border border-[#2C2C2E]">
                      <Video className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                </Button>

                {/* Cancel Button */}
                <Button
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="h-14 w-full bg-[#2C2C2E] text-neutral-400 hover:bg-[#3A3A3C] hover:text-neutral-300 rounded-[20px] text-[15px] font-medium active:scale-[0.98] transition-all"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Trigger FAB (Only visible when closed) */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
        >
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="h-12 px-6 rounded-full bg-neutral-900 text-white shadow-xl shadow-neutral-900/20 dark:shadow-black/40 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </motion.div>
      )}
    </>
  );
}
