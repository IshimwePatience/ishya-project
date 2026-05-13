import React from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Database, Globe, Lock, Trash2 } from 'lucide-react';

const Settings = () => {
  const sections = [
    { title: 'Profile Settings', desc: 'Update your personal info and avatar', icon: User },
    { title: 'Security & Auth', desc: 'Manage 2FA, passwords and active sessions', icon: Shield },
    { title: 'Troupe Config', desc: 'Set global production defaults and categories', icon: Database },
    { title: 'Notifications', desc: 'Configure system alerts and email reports', icon: Bell },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">System Settings</h2>
        <p className="text-white/40 text-sm mt-1">System Core</p>
      </div>

      <div className="flex flex-col">
        {sections.map((section, i) => (
          <div key={i} className="flex items-center justify-between py-6 border-b border-white/5 hover:bg-white/[0.02] transition-all group px-4">
            <div className="flex items-center gap-8">
              <div className="text-white/20 group-hover:text-[#e5a00d] transition-colors">
                <section.icon size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-[13px] font-bold text-white group-hover:text-[#e5a00d] transition-colors tracking-tight">{section.title}</h3>
                <p className="text-[11px] text-white/40 font-medium mt-1">{section.desc}</p>
              </div>
            </div>
            <button className="text-[11px] font-bold text-white/20 hover:text-white transition-all">
              Manage
            </button>
          </div>
        ))}
      </div>

      <div className="pt-12">
        <div className="flex items-center gap-4 mb-4 px-4">
          <h3 className="text-[10px] font-black text-red-500 tracking-[0.1em]">Danger zone</h3>
          <div className="flex-1 h-px bg-red-500/10" />
        </div>
        <div className="flex justify-between items-center px-4 py-6 hover:bg-red-500/[0.02] transition-all group border-b border-red-500/10">
          <div>
            <div className="font-bold text-white text-[13px] tracking-tight">Erase Troubleshooting Logs</div>
            <div className="text-[11px] text-red-500/60 font-medium mt-1">Permanent System Wipe • Irreversible</div>
          </div>
          <button className="text-[11px] font-black text-red-500/40 hover:text-red-500 transition-all">
            Wipe cache
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
